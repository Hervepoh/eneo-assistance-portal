import { Router } from "express";
import { applicationGroupController } from "./applicationGroup.module";


const applicationGroupRoutes = Router();

applicationGroupRoutes.post("/", applicationGroupController.create);
applicationGroupRoutes.get("/", applicationGroupController.findAll);
applicationGroupRoutes.get("/:id", applicationGroupController.findById);
applicationGroupRoutes.put("/:id", applicationGroupController.update);
applicationGroupRoutes.delete("/:id", applicationGroupController.delete);

export default applicationGroupRoutes;
