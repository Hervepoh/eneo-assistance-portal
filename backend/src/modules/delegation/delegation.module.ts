import { DelegationService } from "./delegation.service";
import { DelegationController } from "./delegation.controller";

const delegationService = new DelegationService();
const delegationController = new DelegationController(delegationService);

export { delegationService, delegationController };
