import "dotenv/config";
import {
  sequelize,
  AgenceModel,
  DelegationModel,
  RegionModel ,
  ApplicationGroupModel ,
  ApplicationModel,
  RoleModel,
  PermissionModel,
  RolePermissionModel,
} from "../database/models";

async function clearDatabase() {
  try {
    console.log("🧹 Reset de la base...");

    // Désactiver les contraintes
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    // Vider avec truncate (réel, pas soft delete)
    await AgenceModel.truncate({ cascade: true, force: true });
    await DelegationModel.truncate({ cascade: true, force: true });
    await RegionModel.truncate({ cascade: true, force: true });
    await ApplicationModel.truncate({ cascade: true, force: true });
    await ApplicationGroupModel.truncate({ cascade: true, force: true });
    await RolePermissionModel.truncate({ cascade: true, force: true });
    await RoleModel.truncate({ cascade: true, force: true });
    await PermissionModel.truncate({ cascade: true, force: true });

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
