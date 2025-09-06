// src/types/express.d.ts
import { User } from "../database/models/user.model"; // ton modèle Sequelize

declare global {
  namespace Express {
    interface User {
      id: number; // obligatoire
      email?: string;
      name?: string;
      userPreferences?: any;
      // ajoute d'autres champs si nécessaire
    }

    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}
