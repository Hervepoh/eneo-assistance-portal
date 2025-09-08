// src/types/express.d.ts
import PermissionModel from "../database/models/permission.model";
import RoleModel from "../database/models/role.model";
import { User } from "../database/models/user.model"; // ton modèle Sequelize
import { Multer } from "multer";

declare global {
  namespace Express {
    interface User {
      id: number;
      email?: string;
      name?: string;
      userPreferences?: any;
      activeRole?:{id:number,name:string};  // rôle actif
      activePermissions?: string[]; // noms de permissions seulement
      roles?: RoleModel[]; // liste des rôles de l'utilisateur
    }

    interface Request {
      user?: User;
      sessionId?: string;
      files?: Express.Multer.File[];   // pour plusieurs fichiers
      file?: Express.Multer.File;      // pour un seul fichier
    }
  }
}
