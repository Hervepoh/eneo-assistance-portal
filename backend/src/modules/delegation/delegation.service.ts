
import { NotFoundException } from "../../common/utils/catch-errors";
import DelegationModel from "../../database/models/delegation.model";

export class DelegationService {
  public async createDelegation(data: { name: string; regionId?: number }) {
    return await DelegationModel.create(data);
  }

  public async getAllDelegations() {
    return await DelegationModel.findAll({ where: { isDeleted: false }, include: ["region"] });
  }

  public async getDelegationById(id: number) {
    const delegation = await DelegationModel.findByPk(id, { include: ["region"] });
    if (!delegation || delegation.isDeleted) throw new NotFoundException("Delegation not found");
    return delegation;
  }

  public async updateDelegation(id: number, data: { name?: string; regionId?: number }) {
    const delegation = await this.getDelegationById(id);
    await delegation.update(data);
    return delegation;
  }

  public async deleteDelegation(id: number) {
    const delegation = await this.getDelegationById(id);
    delegation.isDeleted = true;
    await delegation.save();
  }
}
export const delegationService = new DelegationService();