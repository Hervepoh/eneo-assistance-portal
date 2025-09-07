import { Router } from "express";
import { regionController } from "./region.module";

const regionRoutes = Router();

regionRoutes.post("/", regionController.createRegion);
regionRoutes.get("/", regionController.getAllRegions);
regionRoutes.get("/:id", regionController.getRegion);
regionRoutes.put("/:id", regionController.updateRegion);
regionRoutes.delete("/:id", regionController.deleteRegion);

export default regionRoutes;
