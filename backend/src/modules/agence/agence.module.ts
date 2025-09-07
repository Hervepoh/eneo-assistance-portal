import { AgenceController } from "./agence.controller";
import { AgenceService } from "./agence.service";

// Crée une instance unique du service
const agenceService = new AgenceService();

// Crée une instance du controller en injectant le service
const agenceController = new AgenceController(agenceService);

export { agenceService, agenceController };
