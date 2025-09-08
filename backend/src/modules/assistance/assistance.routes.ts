import { Router } from "express";
import { assistanceController } from "./assistance.controller";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";
import { upload } from "../../middlewares/multer.middleware";
import { checkPermission } from "../../middlewares/auth";


const assistanceRoutes = Router();

// Créer une demande (permission assistance:create)
assistanceRoutes.post(
  "/",
  authenticateJWT,
  checkPermission(["assistance:create"]),
  upload.array("files"),
  assistanceController.create
);

// submit a draft
assistanceRoutes.put("/submit/:id", authenticateJWT, assistanceController.submit);

// add files to a request (multipart/form-data)  
// expects fields desc_<originalname> for descriptions OR the front can send a JSON `fileDescriptions` mapping
assistanceRoutes.post("/:id/files", authenticateJWT,upload.array("files", 10),assistanceController.addFiles );

// generic action endpoint (verifier / delegue / business / traiteur)
assistanceRoutes.post("/:id/action", authenticateJWT, assistanceController.action);

assistanceRoutes.get("/my-requests", authenticateJWT, assistanceController.myRequests);

assistanceRoutes.post("/", assistanceController.create);
assistanceRoutes.get("/", assistanceController.getAll);
assistanceRoutes.get("/:id", assistanceController.getById);
assistanceRoutes.put("/:id", assistanceController.update);
assistanceRoutes.delete("/:id", assistanceController.delete);


export default assistanceRoutes;
