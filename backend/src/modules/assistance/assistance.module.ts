import { RegionService } from "./assistance.service";
import { RegionController } from "./region.controller";

const regionService = new RegionService();
const regionController = new RegionController(regionService);

export { regionService, regionController };
