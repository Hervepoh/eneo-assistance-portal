import { Router } from "express";
import { sessionController } from "./session.module";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";
import { checkActiveRole } from "../../middlewares/auth";

const sessionRoutes = Router();

sessionRoutes.get("/all", authenticateJWT ,checkActiveRole, sessionController.getAllSession);
sessionRoutes.get("/", authenticateJWT , sessionController.getSession);
sessionRoutes.delete("/:id",authenticateJWT, sessionController.deleteSession);

export default sessionRoutes;
