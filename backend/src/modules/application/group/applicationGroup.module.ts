import { ApplicationGroupService } from "./applicationGroup.service";
import { ApplicationGroupController } from "./applicationGroup.controller";

const applicationGroupService = new ApplicationGroupService();
const applicationGroupController = new ApplicationGroupController(applicationGroupService);

export { applicationGroupService, applicationGroupController };