import { RoleController } from "./role.controller";
import { RoleService } from "./role.service";

// Crée une instance unique du service
const roleService = new RoleService();

// Crée une instance du controller en injectant le service
const roleController = new RoleController(roleService);

export { roleService, roleController };
