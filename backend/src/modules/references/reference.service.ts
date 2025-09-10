// src/modul/reference.service.ts

import { AgenceModel, ApplicationGroupModel, ApplicationModel, DelegationModel, RegionModel } from "../../database/models";


export class ReferenceService {
  public async getOrganizationReferences() {
    const organizations = await RegionModel.findAll({
      where: { isDeleted: false },
      attributes: ["id", "name"], // ne renvoyer que les champs utiles
      include: [
        {
          model: DelegationModel,
          as: "delegations",
          where: { isDeleted: false },
          required: true, // une région doit avoir une délégation
          attributes: ["id", "name"],
          include: [
            {
              model: AgenceModel,
              as: "agences",
              where: { isDeleted: false },
              required: false, // une délégation peut ne pas avoir d’agences
              attributes: ["id", "name"],
            },
          ],

        },
      ],
      order: [
        ["name", "ASC"],
        [{ model: DelegationModel, as: "delegations" }, "name", "ASC"],
        [
          { model: DelegationModel, as: "delegations" },
          { model: AgenceModel, as: "agences" },
          "name",
          "ASC",
        ],
      ],
    });

    return organizations;
  }

  public async getApplicationReferences() {
    const applications = await ApplicationGroupModel.findAll({
      where: { isDeleted: false },
      attributes: ["id", "name"], // ne renvoyer que les champs utiles
      include: [
        {
          model: ApplicationModel,
          as: "applications",
          where: { isDeleted: false },
          required: true, // un groupe d'applications doit avoir au moins 1 application
          attributes: ["id", "name"],
        },
      ],
      order: [
        ["name", "ASC"],
        [{ model: ApplicationModel, as: "applications" }, "name", "ASC"]
      ],
    });

    return applications;
  }


  // Optionnel : garder l'endpoint combiné si vraiment nécessaire
  public async getAllReferences() {
    const [organizations, applications] = await Promise.all([
      this.getOrganizationReferences(),
      this.getApplicationReferences()
    ]);

    return {
      organizations,
      applications
    };
  }
}