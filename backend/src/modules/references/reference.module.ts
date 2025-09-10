import { ReferenceService } from "./reference.service";
import { ReferenceController } from "./reference.controller";

const referenceService = new ReferenceService();
const referenceController = new ReferenceController(referenceService);

export { referenceService, referenceController };
