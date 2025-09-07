import { Router } from "express";
import { mfaController } from "./mfa.module";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";

const mfaRoutes = Router();
// TODO: check all mfa features
mfaRoutes.get("/setup", authenticateJWT, mfaController.generateMFASetup);
mfaRoutes.post("/verify", authenticateJWT, mfaController.verifyMFASetup);
mfaRoutes.put("/revoke", authenticateJWT, mfaController.revokeMFA);
mfaRoutes.post("/verify-login", mfaController.verifyMFAForLogin);

export default mfaRoutes;
