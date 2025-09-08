import { Router } from "express";
import { authenticateJWT } from "../../common/strategies/jwt.strategy";
import { roleController } from "./role.module";
import { checkActiveRole } from "../../middlewares/auth";

const roleRoutes = Router();

roleRoutes.post("/", authenticateJWT ,checkActiveRole, roleController.createRole);
roleRoutes.get("/", roleController.getAllRoles);
roleRoutes.get("/:id", roleController.getRoleById);
roleRoutes.put("/:id", roleController.updateRole);
roleRoutes.delete("/:id", roleController.deleteRole);

export default roleRoutes;
