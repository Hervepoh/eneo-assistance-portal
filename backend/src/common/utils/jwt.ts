import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { config } from "../../config/app.config";

// Payload pour AccessToken
export type AccessTPayload = {
  userId: number;      // Sequelize utilise un id numérique
  sessionId: number;
};

// Payload pour RefreshToken
export type RefreshTPayload = {
  sessionId: number;
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
};


// Access Token options
export const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT.EXPIRES_IN as any,
  secret: config.JWT.SECRET,
};

// Refresh Token options
export const refreshTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT.REFRESH_EXPIRES_IN as any,
  secret: config.JWT.REFRESH_SECRET,
};

// Générer un JWT
export const signJwtToken = (
  payload: AccessTPayload | RefreshTPayload,
  options?: SignOptsAndSecret
) => {
  const { secret, ...opts } = options ?? accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    ...opts,
  });
};

// Vérifier un JWT
export const verifyJwtToken = <TPayload extends object = AccessTPayload>(
  token: string,
  options?: VerifyOptions & { secret: string }
) => {
  try {
    const { secret = config.JWT.SECRET, ...opts } = options ?? {};
    const payload = jwt.verify(token, secret, {
      ...opts,
    }) as unknown as TPayload;

    return { payload };
  } catch (err: any) {
    return {
      error: err.message,
    };
  }
};
