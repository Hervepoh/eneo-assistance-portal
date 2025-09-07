import { Router } from "express";
import { applicationController } from "./application.module";
import applicationGroupRoutes from "./group/applicationGroup.routes";

const applicationRoutes = Router();

/**
 * Routes fixes d'abord (ex: /applications/group)
 */
applicationRoutes.use("/group", applicationGroupRoutes);

/**
 * Routes CRUD Applications
 */
applicationRoutes.post("/", applicationController.create);
applicationRoutes.get("/", applicationController.findAll);
applicationRoutes.get("/:id", applicationController.findById);
applicationRoutes.put("/:id", applicationController.update);
applicationRoutes.delete("/:id", applicationController.delete);


export default applicationRoutes;