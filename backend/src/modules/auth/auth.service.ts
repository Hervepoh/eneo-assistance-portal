import { Op } from "sequelize";
import {
  LoginDto,
  RegisterDto,
  resetPasswordDto,
} from "../../common/interface/auth.interface";
import { ErrorCode } from "../../common/enums/error-code.enum";
import { VerificationEnum } from "../../common/enums/verification-code.enum";
import {
  BadRequestException,
  HttpException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/catch-errors";
import {
  anHourFromNow,
  calculateExpirationDate,
  fortyFiveMinutesFromNow,
  ONE_DAY_IN_MS,
  threeMinutesAgo,
} from "../../common/utils/date-time";

import { config } from "../../config/app.config";
import {
  refreshTokenSignOptions,
  RefreshTPayload,
  signJwtToken,
  verifyJwtToken,
} from "../../common/utils/jwt";
import { sendEmail } from "../../mailers/mailer";
import {
  passwordResetTemplate,
  verifyEmailTemplate,
} from "../../mailers/templates/template";
import { HTTPSTATUS } from "../../config/http.config";
import { hashValue } from "../../common/utils/bcrypt";
import { logger } from "../../common/utils/logger";
import { PermissionModel, RoleModel, SessionModel, UserModel, VerificationCodeModel } from "../../database/models";
import { UserType } from "../../common/types/user.type";



export class AuthService {
  public async register(registerData: RegisterDto) {
    const { name, email, password } = registerData;

    const existingUser = await UserModel.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestException(
        "User already exists with this email",
        ErrorCode.AUTH_EMAIL_ALREADY_EXISTS
      );
    }

    const newUser = await UserModel.create({ name, email, password, isActive: true });

    const verification = await VerificationCodeModel.create({
      userId: newUser.id,
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: fortyFiveMinutesFromNow(),
    });

    const verificationUrl = `${config.APP_ORIGIN}/confirm-account?code=${verification.code}`;
    await sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl),
    });

    // Retourner un objet sans le mot de passe
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    return { user: userWithoutPassword };
  }


  public async login(loginData: LoginDto) {
    const { email, password, userAgent } = loginData;

    logger.info(`Login attempt for email: ${email}`);

    // Récupération du user avec mot de passe
    const user: UserType | null = await UserModel.scope("withPassword").findOne({
      where: { email },
      include: [
        {
          model: RoleModel,
          as: "roles",
          include: [
            {
              model: PermissionModel,
              as: "permissions",
            },
          ],
        },
      ],
    });

    if (!user) {
      logger.warn(`Login failed: User with email ${email} not found`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new BadRequestException(
        "Invalid email or password provided",
        ErrorCode.AUTH_USER_NOT_FOUND
      );
    }

    if (user.userPreferences.enable2FA) {
      logger.info(`2FA required for user ID: ${user.id}`);
      return {
        user: null,
        mfaRequired: true,
        accessToken: "",
        refreshToken: "",
      };
    }

    // Vérifier si l'utilisateur a au moins un rôle
    if (!user.roles || user.roles.length === 0) {
      logger.warn(`[USER_WITHOUT_ROLES] USER ${user.email} (ID: ${user.id}) have beedn create but no role assign.`);
      throw new BadRequestException(
        "Aucun rôle configuré. Merci de contacter l'administrateur.",
        ErrorCode.VERIFICATION_ERROR
      );
    }

    let roleId: number | undefined = undefined;

    // Si l'utilisateur a exactement un rôle, on l'assigne automatiquement
    if (user.roles.length === 1) {
      roleId = user.roles[0].id;
    }
    // Si plusieurs rôles, roleId reste null pour que l'utilisateur choisisse

    const session = await SessionModel.create({
      userId: user.id,
      roleId, // Peut être null si multiple roles
      userAgent
    });

    const accessToken = signJwtToken({
      userId: user.id,
      sessionId: session.id,
    });

    const refreshToken = signJwtToken(
      { sessionId: session.id },
      refreshTokenSignOptions
    );

    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }


  public async refreshToken(refreshToken: string) {
    const { payload } = verifyJwtToken<RefreshTPayload>(refreshToken, {
      secret: refreshTokenSignOptions.secret,
    });

    if (!payload) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const session = await SessionModel.findByPk(payload.sessionId);

    if (!session) {
      throw new UnauthorizedException("Session does not exist");
    }

    const now = Date.now();
    if (session.expiredAt.getTime() <= now) {
      throw new UnauthorizedException("Session expired");
    }

    const sessionRequireRefresh =
      session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

    if (sessionRequireRefresh) {
      session.expiredAt = calculateExpirationDate(config.JWT.REFRESH_EXPIRES_IN);
      await session.save();
    }

    const newRefreshToken = sessionRequireRefresh
      ? signJwtToken({ sessionId: session.id }, refreshTokenSignOptions)
      : undefined;

    const accessToken = signJwtToken({
      userId: session.userId,
      sessionId: session.id,
    });

    return { accessToken, newRefreshToken };
  }


  public async verifyEmail(code: string) {
    const validCode = await VerificationCodeModel.findOne({
      where: {
        code,
        type: VerificationEnum.EMAIL_VERIFICATION,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!validCode) {
      throw new BadRequestException("Invalid or expired verification code");
    }

    await UserModel.update(
      { isEmailVerified: true },
      { where: { id: validCode.userId } }
    );

    const updatedUser = await UserModel.findByPk(validCode.userId);

    if (!updatedUser) {
      throw new BadRequestException(
        "Unable to verify email address",
        ErrorCode.VALIDATION_ERROR
      );
    }

    await validCode.destroy();

    return { user: updatedUser };
  }


  public async forgotPassword(email: string) {
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const timeAgo = threeMinutesAgo();
    const maxAttempts = 2;

    const count = await VerificationCodeModel.count({
      where: {
        userId: user.id,
        type: VerificationEnum.PASSWORD_RESET,
        createdAt: { [Op.gt]: timeAgo },
      },
    });

    if (count >= maxAttempts) {
      throw new HttpException(
        "Too many request, try again later",
        HTTPSTATUS.TOO_MANY_REQUESTS,
        ErrorCode.AUTH_TOO_MANY_ATTEMPTS
      );
    }

    const expiresAt = anHourFromNow();
    const validCode = await VerificationCodeModel.create({
      userId: user.id,
      type: VerificationEnum.PASSWORD_RESET,
      expiresAt,
    });

    const resetLink = `${config.APP_ORIGIN}/reset-password?code=${validCode.code}&exp=${expiresAt.getTime()}`;

    const { data, error } = await sendEmail({
      to: user.email,
      ...passwordResetTemplate(resetLink),
    });

    if (!data?.id) {
      throw new InternalServerException(`${error?.name} ${error?.message}`);
    }

    return { url: resetLink, emailId: data.id };
  }


  public async resePassword({ password, verificationCode }: resetPasswordDto) {
    const validCode = await VerificationCodeModel.findOne({
      where: {
        code: verificationCode,
        type: VerificationEnum.PASSWORD_RESET,
        expiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!validCode) {
      throw new NotFoundException("Invalid or expired verification code");
    }

    const hashedPassword = await hashValue(password);

    // Update password
    await UserModel.update(
      { password: hashedPassword },
      { where: { id: validCode.userId } }
    );

    // Retrieve updated user
    const updatedUser = await UserModel.findByPk(validCode.userId);

    if (!updatedUser) {
      throw new BadRequestException("Failed to reset password!");
    }

    // Delete verification code
    await validCode.destroy();

    // Destroy all sessions for this user
    await SessionModel.destroy({ where: { userId: updatedUser.id } });

    return { user: updatedUser };
  }


  public async logout(sessionId: number) {
    return await SessionModel.destroy({ where: { id: sessionId } });
  }
}
