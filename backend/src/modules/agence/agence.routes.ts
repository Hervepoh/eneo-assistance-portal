import { Router } from "express";
import { agenceController } from "./agence.module";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";

const agenceRoutes = Router();

agenceRoutes.post("/", authenticateJWT, agenceController.createAgence);
agenceRoutes.get("/", authenticateJWT, agenceController.getAllAgences);
agenceRoutes.get("/:id", authenticateJWT, agenceController.getAgenceById);
agenceRoutes.put("/:id", authenticateJWT, agenceController.updateAgence);
agenceRoutes.delete("/:id", authenticateJWT, agenceController.deleteAgence);

export default agenceRoutes;
