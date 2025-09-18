import { Router } from "express";

import { authenticateJWT } from "../../common/strategies/jwt.strategy";
import { upload } from "../../middlewares/multer.middleware";
import { checkPermission } from "../../middlewares/auth";
import { assistanceController } from "./assistance.module";


const assistanceRoutes = Router();

// ===== ROUTES PUBLIQUES   =====
// assistanceRoutes.post("/", assistanceController.create); 

// ===== ROUTES AUTHENTIFIÉES =====

// Middleware d'authentification global pour toutes les routes
// assistanceRoutes.use(authenticateJWT);

// --- CRÉATION ---
// Créer une demande (permission assistance:create)
assistanceRoutes.post("/", 
  authenticateJWT,
  //  checkPermission(["assistance:create"]),
  upload.array("files"), assistanceController.create
);

// Soumettre une demande brouillon (draft)
assistanceRoutes.post("/:id/submit", 
  authenticateJWT,
  //  checkPermission(["assistance:create"])
  assistanceController.submit
);

// --- RÉCUPÉRATION ---
// Récupérer toutes mes demandes
assistanceRoutes.get("/me",
  authenticateJWT,
  //checkPermission(["assistance:read"]),
  assistanceController.getMy
);

// Récupérer toutes les demandes au niveau N+1
assistanceRoutes.get("/validate/n1",
  authenticateJWT,
  //checkPermission(["assistance:validate"]),
  assistanceController.getAsN1
);

// Récupérer toutes les demandes
assistanceRoutes.get("/", assistanceController.getAll);

// add files to a request (multipart/form-data)  
// expects fields desc_<originalname> for descriptions OR the front can send a JSON `fileDescriptions` mapping
assistanceRoutes.post("/:id/files", 
  authenticateJWT, 
  upload.array("files", 10), 
  assistanceController.addFiles
);

// generic action endpoint (verifier / delegue / business / traiteur)
assistanceRoutes.post("/:id/action", 
  authenticateJWT, 
  upload.single('attachment'), 
  assistanceController.action
);


// Recherche par référence
assistanceRoutes.get('/:reference(EN-ASS[A-Z]{3}\\d{4}-\\d{4})', assistanceController.getByReference);

// Recherche par id
assistanceRoutes.get("/:id(\\d+)", assistanceController.getById);
assistanceRoutes.put("/:id", assistanceController.update);
assistanceRoutes.delete("/:id", assistanceController.delete);


export default assistanceRoutes;
