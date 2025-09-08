import { Router } from "express";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";
import { permissionController } from "./permission.module";

const permissionRoutes = Router();

permissionRoutes.post("/", permissionController.createPermission);
permissionRoutes.get("/", permissionController.getAllPermissions);
permissionRoutes.get("/:id", permissionController.getPermissionById);
permissionRoutes.put("/:id", permissionController.updatePermission);
permissionRoutes.delete("/:id", permissionController.deletePermission);

export default permissionRoutes;
