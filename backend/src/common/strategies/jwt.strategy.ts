import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptionsWithRequest,
} from "passport-jwt";
import { UnauthorizedException } from "../utils/catch-errors";
import { ErrorCode } from "../enums/error-code.enum";
import { config } from "../../config/app.config";
import passport, { PassportStatic } from "passport";
import { userService } from "../../modules/user/user.module";
import { PermissionModel, RoleModel, UserModel } from "../../database/models";
import { sessionService } from "../../modules/session/session.module";
import { roleService } from "../../modules/role/role.service";
import { RoleType } from "../types/role.type";
import { permissionService } from "../../modules/permission/permission.module";


interface JwtPayload {
  userId: string;
  sessionId: string;
}

const options: StrategyOptionsWithRequest = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    (req) => {
      if (!req?.cookies) return null;
      const accessToken = req.cookies.accessToken;
      if (!accessToken) {
        console.log("❌ Cookie accessToken missing:", req.cookies);
        throw new UnauthorizedException(
          "Unauthorized access token",
          ErrorCode.AUTH_TOKEN_NOT_FOUND
        );
      }
      return accessToken;
    },
  ]),
  secretOrKey: config.JWT.SECRET,
  algorithms: ["HS256"],
  passReqToCallback: true,
};

export const setupJwtStrategy = (passport: PassportStatic) => {
  passport.use(
    new JwtStrategy(options, async (req, payload: JwtPayload, done) => {
      try {
        const user = await userService.getUserRolesWithPermissions(Number(payload.userId));
        if (!user) {
          return done(null, false);
        }

        // Vérifier si l'utilisateur a au moins un rôle
        if (!user?.roles || user?.roles?.length === 0) {
          return done(new Error("Aucun rôle configuré. Merci de contacter l'administrateur."), false);
        }

        // On stocke la sessionId dans req pour l'utiliser dans les controllers
        req.sessionId = payload.sessionId;

        let activeRole: { id: number; name: string } | undefined;
        let activePermissions: string[] = [];

        // Si l'utilisateur a exactement un rôle, on l'assigne automatiquement
        if (user.roles.length === 1) {
          const firstRole = user.roles[0];
          activeRole = { id: firstRole.id, name: firstRole.name };
          activePermissions = firstRole.permissions || [];
        } else {
          const session = await sessionService.getSessionByIdWithPermissions(Number(payload.sessionId))
          if (session?.[0]?.role_id) {
            activeRole = { id: session[0].role_id, name: session[0].role_name ?? "" };
            activePermissions = session.map(p => p.permission_name ?? "" ) || [];
          }
        }

        // Transformer l'utilisateur en objet simple
        const simplifiedUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          userPreferences: user.userPreferences,
          activeRole: activeRole,
          activePermissions,
          roles: user.roles.map((role: any) => ({
            id: role.id,
            name: role.name
          }))
        };

        return done(null, simplifiedUser);
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

export const authenticateJWT = passport.authenticate("jwt", { session: false });
