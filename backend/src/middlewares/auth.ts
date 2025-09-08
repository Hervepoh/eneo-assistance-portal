import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ErrorCode } from "../common/enums/error-code.enum";


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "Token manquant" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
        req.user = decoded;
        next();
    } catch (err) {
        console.error("❌ Erreur middleware authenticate :", err);
        res.status(403).json({ error: "Token invalide" });
    }
};


// Vérification par rôle
export const checkRole =
    (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ error: "Non authentifié" });
        if (!req.user.activeRole) return res.status(401).json({ error: "Pas de role assigné à ce user" });

        if (!roles.includes(req.user.activeRole.name)) {
            return res.status(403).json({ error: "Accès interdit (role)" });
        }
        next();
    };


// Vérification par permission
export const checkPermission = (permissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user?.activePermissions?.some(p => permissions.includes(p))) {
            return res.status(403).json({ error: "Accès refusé (permission)" });
        }
        next();
    };
};

export const checkActiveRole = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.activeRole) {
    return res.status(403).json({
      success: false,
      message: "Veuillez sélectionner un rôle pour accéder à cette ressource",
      code: ErrorCode.ACCESS_FORBIDDEN
    });
  }
  next();
};