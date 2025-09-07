import { getEnv } from "../common/utils/get-env";

const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  APP_ORIGIN: getEnv("APP_ORIGIN", "localhost"),
  PORT: getEnv("PORT", "5000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  DATABASE: {
    NAME: getEnv("DB_NAME"),
    USER: getEnv("DB_USER"),
    PASSWORD: getEnv("DB_PASSWORD"),
    HOST: getEnv("DB_HOST", "localhost"),
    PORT: getEnv("DB_PORT", "3306"),
    DIALECT: getEnv("DB_DIALECT", "mysql"),
  },
  LDAP: {
    SERVER: getEnv("LDAP_SERVER", "localhost"),
    PORT: getEnv("LDAP_PORT", "389"),
    DOMAIN: getEnv("LDAP_DOMAIN", "camlight.cm"),
    ADMIN_USER: getEnv("LDAP_ADMIN_USER", "admin"),
    ADMIN_PASSWORD: getEnv("LDAP_ADMIN_PASSWORD", "password"),
  },
  JWT: {
    SECRET: getEnv("JWT_SECRET"),
    EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
  },
  MAILER_SENDER: getEnv("MAILER_SENDER"),
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
});

export const config = appConfig();
