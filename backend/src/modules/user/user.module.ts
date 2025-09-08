import { UserService } from "./user.service";
import { UserController } from "./user.controller";

const userService = new UserService();
const userController = new UserController(userService);

export { userService, userController };