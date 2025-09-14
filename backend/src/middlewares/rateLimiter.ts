import rateLimit from "express-rate-limit";

// Limite générale : 100 requêtes / 15 minutes par IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // chaque IP peut faire max 100 requêtes dans ce laps de temps
  message: {
    status: 429,
    error: "Trop de requêtes. Réessayez plus tard 🚫",
  },
  standardHeaders: true, // Ajoute RateLimit-* headers
  legacyHeaders: false, // Désactive les X-RateLimit-* headers
});

// Limite spécifique : 5 tentatives / 10 minutes pour login
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // max 5 tentatives
  message: {
    status: 429,
    error: "Trop de tentatives de connexion. Réessayez plus tard 🚫",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
