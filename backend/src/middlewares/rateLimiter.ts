import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

// 🔹 Méthode officielle pour gérer les IPs (IPv6 compatible)
const getClientIp = (req: Request): string => {
  // Priorité: x-forwarded-for header (pour les proxies)
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(/, /)[0];
  }
  
  // Fallback sur les autres méthodes
  return req.ip 
    || req.connection.remoteAddress 
    || req.socket.remoteAddress 
    || 'unknown';
};

// 🔹 Normalise l'IP pour éviter les problèmes IPv6
const normalizeIp = (ip: string): string => {
  return ip.replace(/[:.]/g, '_');
};

// 🔹 Key generators
const generalKeyGenerator = (req: Request): string => {
  if (req.user?.id) {
    return `user-${req.user.id}`;
  }
  return `ip-${normalizeIp(getClientIp(req))}`;
};

const loginKeyGenerator = (req: Request): string => {
  return `login-${normalizeIp(getClientIp(req))}`;
};

// 🔹 Limiteurs
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: Request) => req.user?.id ? 5000 : 1000,
  keyGenerator: generalKeyGenerator,
  message: "Trop de requêtes. Réessayez plus tard 🚫",
  standardHeaders: true,
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  keyGenerator: loginKeyGenerator,
  message: "Trop de tentatives de connexion. Réessayez plus tard 🚫",
  standardHeaders: true,
});

// 🔹 Middleware
export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.path.includes("/auth/login")) {
    return loginLimiter(req, res, next);
  }
  return generalLimiter(req, res, next);
}

export { generalLimiter, loginLimiter };