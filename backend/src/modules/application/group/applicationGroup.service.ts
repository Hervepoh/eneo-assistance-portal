import ApplicationGroupModel from "../../../database/models/applicationGroup.model";


export class ApplicationGroupService {
  async create(data: { name: string }) {
    return await ApplicationGroupModel.create(data);
  }

  async findAll() {
    return await ApplicationGroupModel.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
    });
  }

  async findById(id: number) {
    return await ApplicationGroupModel.findByPk(id);
  }

  async update(id: number, data: Partial<{ name: string; isDeleted: boolean }>) {
    const group = await ApplicationGroupModel.findByPk(id);
    if (!group) return null;

    return await group.update(data);
  }

  async delete(id: number) {
    const group = await ApplicationGroupModel.findByPk(id);
    if (!group) return null;

    await group.destroy(); // soft delete (paranoid: true)
    return group;
  }
}
