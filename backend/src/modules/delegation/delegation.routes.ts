import { Router } from "express";
import { delegationController } from "./delegation.module";

const delegationRoutes = Router();

delegationRoutes.post("/", delegationController.createDelegation);
delegationRoutes.get("/", delegationController.getAllDelegations);
delegationRoutes.get("/:id", delegationController.getDelegation);
delegationRoutes.put("/:id", delegationController.updateDelegation);
delegationRoutes.delete("/:id", delegationController.deleteDelegation);

export default delegationRoutes;