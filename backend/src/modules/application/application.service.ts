import { ApplicationGroupModel, ApplicationModel } from "../../database/models";


export class ApplicationService {
  async create(data: { name: string; groupId: number }) {
    return await ApplicationModel.create(data);
  }

  async findAll() {
    return await ApplicationModel.findAll({
      where: { isDeleted: false },
      include: [{ model: ApplicationGroupModel, as: "group" }],
      order: [["createdAt", "DESC"]],
    });
  }

  async findById(id: number) {
    return await ApplicationModel.findByPk(id, {
      include: [{ model: ApplicationGroupModel, as: "group" }],
    });
  }

  async update(id: number, data: Partial<{ name: string; groupId: number; isDeleted: boolean }>) {
    const app = await ApplicationModel.findByPk(id);
    if (!app) return null;

    return await app.update(data);
  }

  async delete(id: number) {
    const app = await ApplicationModel.findByPk(id);
    if (!app) return null;

    await app.destroy();
    return app;
  }
}
