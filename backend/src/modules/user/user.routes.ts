import { Router } from "express";
import { userController } from "./user.module";

const userRoutes = Router();

userRoutes.post("/", userController.create);
userRoutes.get("/", userController.getAll);
userRoutes.get("/:id", userController.getById);
userRoutes.put("/:id", userController.update);
userRoutes.delete("/:id", userController.delete);

//
userRoutes.post("/assign-role", userController.assignRole);
userRoutes.put("/:id/deactivate", userController.deactivate);

export default userRoutes;
