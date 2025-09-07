import { Router } from "express";
import { assistanceController } from "./assistance.controller";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";

const assistanceRoutes = Router();

assistanceRoutes.post("/", assistanceController.create);
assistanceRoutes.get("/", assistanceController.findAll);
assistanceRoutes.get("/:id", assistanceController.findById);
assistanceRoutes.put("/:id", assistanceController.update);
assistanceRoutes.delete("/:id", assistanceController.delete);
assistanceRoutes.get("/my-requests-sm", authenticateJWT, assistanceController.findMyRequests);
assistanceRoutes.get("/my-requests", authenticateJWT, assistanceController.findMyRequestsWithPagination);


export default assistanceRoutes;
