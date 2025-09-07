import { ApplicationService } from "./application.service";
import { ApplicationController } from "./application.controller";

const applicationService = new ApplicationService();
const applicationController = new ApplicationController(applicationService);

export { applicationService, applicationController };
