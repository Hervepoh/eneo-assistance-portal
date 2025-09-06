import { Request } from "express";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import UserModel from "../../database/models/user.model";
import SessionModel from "../../database/models/session.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../common/utils/catch-errors";
import { refreshTokenSignOptions, signJwtToken } from "../../common/utils/jwt";

export class MfaService {
  public async generateMFASetup(req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (user.userPreferences?.enable2FA) {
      return { message: "MFA already enabled" };
    }

    let secretKey = user.userPreferences?.twoFactorSecret;

    if (!secretKey) {
      const secret = speakeasy.generateSecret({ name: "Squeezy" });
      secretKey = secret.base32;

      // Mise à jour dans la DB
      await UserModel.update(
        { userPreferences: { ...user.userPreferences, twoFactorSecret: secretKey } },
        { where: { id: user.id } }
      );
    }

    const url = speakeasy.otpauthURL({
      secret: secretKey,
      label: `${user.name}`,
      issuer: "squeezy.com",
      encoding: "base32",
    });

    const qrImageUrl = await qrcode.toDataURL(url);

    return {
      message: "Scan the QR code or use the setup key.",
      secret: secretKey,
      qrImageUrl,
    };
  }

  public async verifyMFASetup(req: Request, code: string, secretKey: string) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (user.userPreferences?.enable2FA) {
      return {
        message: "MFA is already enabled",
        userPreferences: { enable2FA: true },
      };
    }

    const isValid = speakeasy.totp.verify({
      secret: secretKey,
      encoding: "base32",
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code. Please try again.");
    }

    await UserModel.update(
      { userPreferences: { ...user.userPreferences, enable2FA: true } },
      { where: { id: user.id } }
    );

    return {
      message: "MFA setup completed successfully",
      userPreferences: { enable2FA: true },
    };
  }

  public async revokeMFA(req: Request) {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException("User not authorized");
    }

    if (!user.userPreferences?.enable2FA) {
      return {
        message: "MFA is not enabled",
        userPreferences: { enable2FA: false },
      };
    }

    await UserModel.update(
      {
        userPreferences: {
          ...user.userPreferences,
          enable2FA: false,
          twoFactorSecret: null,
        },
      },
      { where: { id: user.id } }
    );

    return {
      message: "MFA revoked successfully",
      userPreferences: { enable2FA: false },
    };
  }

  public async verifyMFAForLogin(code: string, email: string, userAgent?: string) {
    const user = await UserModel.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.userPreferences?.enable2FA || !user.userPreferences?.twoFactorSecret) {
      throw new UnauthorizedException("MFA not enabled for this user");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.userPreferences.twoFactorSecret,
      encoding: "base32",
      token: code,
    });

    if (!isValid) {
      throw new BadRequestException("Invalid MFA code. Please try again.");
    }

    const session = await SessionModel.create({
      userId: user.id,
      userAgent,
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    });

    const accessToken = signJwtToken({
      userId: user.id,
      sessionId: session.id,
    });

    const refreshToken = signJwtToken(
      { sessionId: session.id },
      refreshTokenSignOptions
    );

    return { user, accessToken, refreshToken };
  }
}
