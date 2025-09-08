import { PermissionController } from "./permission.controller";
import { PermissionService } from "./permission.service";

// Crée une instance unique du service
const permissionService = new PermissionService();

// Crée une instance du controller en injectant le service
const permissionController = new PermissionController(permissionService);

export { permissionService, permissionController };
