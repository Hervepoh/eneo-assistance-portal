
import { NotFoundException } from "../../common/utils/catch-errors";
import { PermissionModel } from "../../database/models";


export class PermissionService {
  public async createPermission(data: { name: string; delegationId?: number }) {
    const role = await PermissionModel.create(data);
    return role;
  }

  public async getAllPermissions() {
    const roles = await PermissionModel.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
    });
    return roles;
  }

  public async getPermissionByName(name: string) {
    return await PermissionModel.findOne({
      where: { name },
    });

  }


  public async getPermissionById(id: number) {
    const role = await PermissionModel.findOne({
      where: { id, isDeleted: false },
      include: ["roles"],
    });
    if (!role) throw new NotFoundException("Permission not found");
    return role;
  }

  public async updatePermission(id: number, data: { name?: string; delegationId?: number }) {
    const role = await this.getPermissionById(id);
    await role.update(data);
    return role;
  }

  public async deletePermission(id: number) {
    const role = await this.getPermissionById(id);
    await role.destroy(); // soft delete
    return { message: "Permission deleted successfully" };
  }
}

export const roleService = new PermissionService();
