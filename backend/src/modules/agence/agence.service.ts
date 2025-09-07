
import { NotFoundException } from "../../common/utils/catch-errors";
import AgenceModel from "../../database/models/agency.model";

export class AgenceService {
  public async createAgence(data: { name: string; delegationId?: number }) {
    const agence = await AgenceModel.create(data);
    return agence;
  }

  public async getAllAgences() {
    const agences = await AgenceModel.findAll({
      where: { isDeleted: false },
      include: ["delegation"],
      order: [["createdAt", "DESC"]],
    });
    return agences;
  }

  public async getAgenceById(id: number) {
    const agence = await AgenceModel.findOne({
      where: { id, isDeleted: false },
      include: ["delegation"],
    });
    if (!agence) throw new NotFoundException("Agence not found");
    return agence;
  }

  public async updateAgence(id: number, data: { name?: string; delegationId?: number }) {
    const agence = await this.getAgenceById(id);
    await agence.update(data);
    return agence;
  }

  public async deleteAgence(id: number) {
    const agence = await this.getAgenceById(id);
    await agence.destroy(); // soft delete
    return { message: "Agence deleted successfully" };
  }
}

export const agenceService = new AgenceService();
