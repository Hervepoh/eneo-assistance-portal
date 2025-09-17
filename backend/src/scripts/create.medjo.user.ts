import "dotenv/config";
import { sequelize } from "../database/database";
import {
  UserModel,
  RoleModel,
  UserRoleModel,
  PermissionModel,
  RolePermissionModel
} from "../database/models";

async function seedMedjoUser() {
  try {
    // Connexion à la base de données
    await sequelize.authenticate();
    console.log("✅ Connexion à la base de données établie avec succès.");

    // Synchroniser les tables
    await sequelize.sync({ alter: true });
    console.log("✅ Tables synchronisées.");

    // 1️⃣ Créer les permissions de base
    const permissions = [
      { name: "create_request", description: "Créer des demandes d'assistance" },
      { name: "view_own_requests", description: "Voir ses propres demandes" },
      { name: "view_all_requests", description: "Voir toutes les demandes" },
      { name: "verify_requests", description: "Vérifier les demandes (niveau 1)" },
      { name: "validate_dec", description: "Validation DEC (niveau 2)" },
      { name: "validate_bao", description: "Validation BAO (niveau 3)" },
      { name: "assign_technician", description: "Assigner des techniciens" },
      { name: "resolve_requests", description: "Résoudre les demandes" },
      { name: "manage_users", description: "Gérer les utilisateurs" },
      { name: "manage_roles", description: "Gérer les rôles et permissions" },
      { name: "view_reports", description: "Consulter les rapports" },
      { name: "manage_system", description: "Administration système" }
    ];

    console.log("📝 Création des permissions...");
    for (const permData of permissions) {
      await PermissionModel.findOrCreate({
        where: { name: permData.name },
        defaults: permData
      });
    }
    console.log("✅ Permissions créées ou vérifiées.");

    // 2️⃣ Créer les rôles de base
    const roles = [
      { name: "user", description: "Utilisateur standard - Peut créer et suivre ses demandes" },
      { name: "verificateur", description: "Vérificateur - Validation niveau 1" },
      { name: "dec", description: "Directeur Exploitation Commercial - Validation niveau 2" },
      { name: "bao", description: "Bureau d'Assistance et d'Orientation - Validation niveau 3" },
      { name: "technicien", description: "Technicien - Résolution des demandes" },
      { name: "manager", description: "Manager - Supervision et rapports" },
      { name: "admin", description: "Administrateur - Gestion complète du système" }
    ];

    console.log("👥 Création des rôles...");
    const createdRoles: { [key: string]: any } = {};
    for (const roleData of roles) {
      const [role] = await RoleModel.findOrCreate({
        where: { name: roleData.name },
        defaults: { name: roleData.name, isDeleted: false }
      });
      createdRoles[roleData.name] = role;
    }
    console.log("✅ Rôles créés ou vérifiés.");

    // 3️⃣ Assigner les permissions aux rôles
    const rolePermissions = {
      user: ["create_request", "view_own_requests"],
      verificateur: ["create_request", "view_own_requests", "view_all_requests", "verify_requests"],
      dec: ["create_request", "view_own_requests", "view_all_requests", "verify_requests", "validate_dec"],
      bao: ["create_request", "view_own_requests", "view_all_requests", "verify_requests", "validate_dec", "validate_bao", "assign_technician"],
      technicien: ["create_request", "view_own_requests", "view_all_requests", "resolve_requests"],
      manager: ["create_request", "view_own_requests", "view_all_requests", "view_reports"],
      admin: ["create_request", "view_own_requests", "view_all_requests", "verify_requests", "validate_dec", "validate_bao", "assign_technician", "resolve_requests", "manage_users", "manage_roles", "view_reports", "manage_system"]
    };

    console.log("🔗 Attribution des permissions aux rôles...");
    for (const [roleName, permNames] of Object.entries(rolePermissions)) {
      const role = createdRoles[roleName];
      if (role) {
        for (const permName of permNames) {
          const permission = await PermissionModel.findOne({ where: { name: permName } });
          if (permission) {
            await RolePermissionModel.findOrCreate({
              where: { role_id: role.id, permission_id: permission.id },
              defaults: { role_id: role.id, permission_id: permission.id }
            });
          }
        }
      }
    }
    console.log("✅ Permissions assignées aux rôles.");

    // 4️⃣ Créer l'utilisateur Medjo
    const medjoUserData = {
      name: "Medjo Marcel Miguel",
      email: "medjomarcelmiguel@gmail.com",
      password: "passwordMMM", // Sera automatiquement hashé par le hook beforeSave
      isActive: true,
      isLdap: false,
      isEmailVerified: true,
      userPreferences: {
        enable2FA: false,
        emailNotification: true
      }
    };

    console.log("👤 Création de l'utilisateur Medjo...");
    
    // Vérifier si l'utilisateur existe déjà
    let medjoUser = await UserModel.findOne({
      where: { email: medjoUserData.email }
    });

    if (medjoUser) {
      console.log("⚠️  L'utilisateur Medjo existe déjà. Mise à jour des informations...");
      await medjoUser.update(medjoUserData);
    } else {
      medjoUser = await UserModel.create(medjoUserData);
      console.log("✅ Utilisateur Medjo créé avec succès.");
    }

    // 5️⃣ Assigner le rôle admin à Medjo
    const adminRole = createdRoles["admin"];
    
    if (adminRole && medjoUser) {
      // Vérifier si la relation existe déjà
      const existingUserRole = await UserRoleModel.findOne({
        where: { user_id: medjoUser.id, role_id: adminRole.id }
      });

      if (!existingUserRole) {
        await UserRoleModel.create({
          user_id: medjoUser.id,
          role_id: adminRole.id
        });
        console.log("✅ Rôle admin assigné à l'utilisateur Medjo.");
      } else {
        console.log("ℹ️  L'utilisateur Medjo a déjà le rôle admin.");
      }
    }

    // 6️⃣ Vérification finale - Approche simple sans include complexe
    const finalUser = await UserModel.findOne({
      where: { email: medjoUserData.email }
    });

    if (finalUser) {
      console.log("\n🎉 UTILISATEUR CRÉÉ AVEC SUCCÈS !");
      console.log("═══════════════════════════════════");
      console.log(`👤 Nom: ${finalUser.name}`);
      console.log(`📧 Email: ${finalUser.email}`);
      console.log(`🔒 Mot de passe: passwordMMM`);
      console.log(`✅ Compte actif: ${finalUser.isActive ? 'Oui' : 'Non'}`);
      console.log(`📬 Email vérifié: ${finalUser.isEmailVerified ? 'Oui' : 'Non'}`);
      console.log(`🔐 2FA activé: ${finalUser.userPreferences.enable2FA ? 'Oui' : 'Non'}`);
      
      // Vérifier les rôles de manière simple
      const userRoleCount = await UserRoleModel.count({
        where: { user_id: finalUser.id }
      });
      
      if (userRoleCount > 0) {
        console.log(`\n👥 RÔLES ASSIGNÉS: ${userRoleCount} rôle(s)`);
        console.log("  • admin (avec toutes les permissions)");
      }
      
      console.log("\n🚀 CONNEXION:");
      console.log("1. Aller sur http://localhost:5173");
      console.log("2. Se connecter avec:");
      console.log(`   Email: ${finalUser.email}`);
      console.log("   Mot de passe: passwordMMM");
      console.log("\n✨ L'utilisateur Medjo a tous les droits d'administration !");
    }

    console.log("\n✅ Script terminé avec succès !");
    process.exit(0);

  } catch (error) {
    console.error("❌ Erreur lors de la création de l'utilisateur Medjo:", error);
    process.exit(1);
  }
}

// Exécuter le script
seedMedjoUser();