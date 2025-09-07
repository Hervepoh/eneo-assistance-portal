import "dotenv/config";
import { sequelize } from "../database/database";
import { ApplicationModel as Application } from "../database/models/application.model";
import { ApplicationGroupModel as ApplicationGroup } from "../database/models/applicationGroup.model";

async function seed() {
  try {
    // Connecte-toi à la base
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Crée / met à jour les tables
    await sequelize.sync({ alter: true }); 

    // 1️⃣ Créer les groupes d'applications
    const groupsData = [
      { id: 1, name: "Application Financière", isDeleted: false },
      { id: 2, name: "Application Commerciale", isDeleted: false },
      { id: 3, name: "Application Technique", isDeleted: false },
      { id: 4, name: "Business Intelligence", isDeleted: false },
      { id: 5, name: "Autres Applications", isDeleted: false },
    ];

    await ApplicationGroup.bulkCreate(groupsData, {
      ignoreDuplicates: true,
    });
    console.log("Application groups seeded.");

    // 2️⃣ Créer les applications pour chaque groupe
    const appsData = [
      { name: "SAP-FICA", groupId: 1 },
      { name: "SAP-FICO", groupId: 1 },
      { name: "BILL CANCELATION VALIDATION", groupId: 2 },
      { name: "CMS", groupId: 2 },
      { name: "CUSTOMER OVERVIEW", groupId: 2 },
      { name: "HV e-billing", groupId: 2 },
      { name: "ICN Casing", groupId: 2 },
      { name: "MyMEMO", groupId: 2 },
      { name: "MMS", groupId: 2 },
      { name: "Mobile Cashing", groupId: 2 },
      { name: "Mobile Reading", groupId: 2 },
      { name: "MyEasyLight", groupId: 2 },
      { name: "MAXIMO", groupId: 3 },
      { name: "PENTAHO", groupId: 2 },
      { name: "ENEOPAY (POST-PAIEMENT)", groupId: 2 },
      { name: "POWERNET (PRE-PAIEMENT)", groupId: 2 },
      { name: "SAP-ISU", groupId: 2 },
      { name: "CMS", groupId: 2 },
      { name: "SMART RECOVERY (Live Cash)", groupId: 2 },
      { name: "SUITE CRM", groupId: 2 },
      { name: "TOKENIZER CIRP", groupId: 2 },
      { name: "Power BI", groupId: 3 },
      { name: "Legal Suite", groupId: 3 },
      { name: "MyDailyWork", groupId: 4 },
      { name: "Lead Tracker", groupId: 4 },
      { name: "Feedback System", groupId: 4 },
    ];

    await Application.bulkCreate(appsData, { ignoreDuplicates: true });
    console.log("Applications seeded.");

    // Fermer la connexion
    await sequelize.close();
    console.log("Seeding finished.");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seed();
