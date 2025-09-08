import { AssistanceService } from "./assistance.service";
import { AssistanceController } from "./assistance.controller";

const assistanceService = new AssistanceService();
const assistanceController = new AssistanceController();

export { assistanceService, assistanceController };
