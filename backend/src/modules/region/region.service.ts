
import { NotFoundException } from "../../common/utils/catch-errors";
import RegionModel from "../../database/models/region.model";

export class RegionService {
  public async createRegion(name: string) {
    const region = await RegionModel.create({ name });
    return region;
  }

  public async getAllRegions() {
    return await RegionModel.findAll({ where: { isDeleted: false } });
  }

  public async getRegionById(id: number) {
    const region = await RegionModel.findByPk(id);
    if (!region || region.isDeleted) {
      throw new NotFoundException("Region not found");
    }
    return region;
  }

  public async updateRegion(id: number, name: string) {
    const region = await this.getRegionById(id);
    region.name = name;
    await region.save();
    return region;
  }

  public async deleteRegion(id: number) {
    const region = await this.getRegionById(id);
    region.isDeleted = true;
    await region.save();
    return;
  }
}
