import "dotenv/config";
import { sequelize } from "../database/database";
import { AgenceModel as Agence } from "../database/models/agency.model";
import { DelegationModel as Delegation } from "../database/models/delegation.model";
import { RegionModel as Region } from "../database/models/region.model";
import { ApplicationModel as Application } from "../database/models/application.model";
import { ApplicationGroupModel as ApplicationGroup } from "../database/models/applicationGroup.model";

async function clearDatabase() {
  try {
    console.log("🧹 Reset de la base...");

    // Désactiver les contraintes
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // Vider avec truncate (réel, pas soft delete)
    await Agence.truncate({ cascade: true, force: true });
    await Delegation.truncate({ cascade: true, force: true });
    await Region.truncate({ cascade: true, force: true });
    await Application.truncate({ cascade: true, force: true });
    await ApplicationGroup.truncate({ cascade: true, force: true });

    // Réactiver les contraintes
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Base reset avec succès !");
  } catch (err) {
    console.error("❌ Erreur lors du reset :", err);
  } finally {
    await sequelize.close();
  }
}

clearDatabase();
