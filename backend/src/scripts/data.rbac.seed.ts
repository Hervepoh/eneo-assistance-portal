// src/seeds/seedRolesAndPermissions.ts
import "dotenv/config";

import {
    sequelize,
    RoleModel as Role,
    PermissionModel as Permission,
    RolePermissionModel as RolePermission,
} from "../database/models";


async function seedRolesAndPermissions() {
    try {
        // 1️⃣ Connexion DB
        await sequelize.authenticate();
        console.log("✅ Database connected.");

        // 2️⃣ Synchronisation des tables
        await sequelize.sync({ alter: true });

        // 3️⃣ Création des rôles
        const rolesData = [
            { name: "SUPERADMIN", isDeleted: false },
            { name: "ADMIN:TECHNIQUE", isDeleted: false },
            { name: "ADMIN:FONCTIONNEL", isDeleted: false },
            { name: "UTILISATEUR", isDeleted: false },
            { name: "BAO", isDeleted: false },
            { name: "DEC", isDeleted: false },
            { name: "VERIFICATEUR", isDeleted: false },
            { name: "TECHNICIEN", isDeleted: false },
            { name: "AUDITEUR", isDeleted: false },
        ];

        await Role.bulkCreate(rolesData, { ignoreDuplicates: false });
        console.log("✅ Roles seeded.");

        // 4️⃣ Création des permissions
        const modules = [
            "assistance",
            "utilisateur",
            "role",
            "setting",
            "organisation",
            "application",
            "audit",
            "securite",
        ];
        const actions = ["create", "read", "update", "delete"];

        const permissionsData = modules.flatMap((module) =>
            actions.map((action) => ({
                name: `${module}:${action}`.toLowerCase(),
                isDeleted: false,
            }))
        );

        await Permission.bulkCreate(permissionsData, { ignoreDuplicates: true });
        console.log("✅ Permissions seeded.");

        // 5️⃣ Assigner les permissions aux rôles
        const roles = await Role.findAll();
        const permissions = await Permission.findAll();

        // Helper pour créer les associations
        async function assignPermissions(roleName: string, allowed: string[] | "all") {
            const role = roles.find((r) => r.name === roleName);
            if (!role) return;

            let permsToAssign = [];
            if (allowed === "all") {
                permsToAssign = permissions;
            } else {
                permsToAssign = permissions.filter((p) => allowed.includes(p.name));
            }

            const rolePerms = permsToAssign.map((p) => ({
                role_id: role.id,
                permission_id: p.id,
            }));

            await RolePermission.bulkCreate(rolePerms, { ignoreDuplicates: true });
            console.log(`✅ Permissions assigned to role ${roleName}`);
        }

        // Attribution (ajuste selon ta logique métier)
        await assignPermissions("superadmin", "all");
        await assignPermissions("admin:technique", "all");
        await assignPermissions("admin:fonctionnel", ["assistance:read", "utilisateur:read", "role:read", "organisation:create", "organisation:read", "organisation:update", "application:create", "application:read", "application:update"]);
        await assignPermissions("utilisateur", ["assistance:create", "assistance:read"]);
        await assignPermissions("BAO", ["assistance:read", "assistance:update"]);
        await assignPermissions("DEC", ["assistance:read", "assistance:update"]);
        await assignPermissions("verificateur", ["assistance:read", "assistance:update", "audit:read", "securite:read"]);
        await assignPermissions("technicien", ["assistance:read", "assistance:update"]);
        await assignPermissions("auditeur", ["assistance:read", "audit:read"]);

        // 6️⃣ Fermer la connexion
        await sequelize.close();
        console.log("🌱 Seeding finished.");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
}

seedRolesAndPermissions();
