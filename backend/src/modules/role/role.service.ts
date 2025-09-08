
import { NotFoundException } from "../../common/utils/catch-errors";
import { PermissionModel, RoleModel } from "../../database/models";


export class RoleService {
  public async createRole(data: { name: string; delegationId?: number }) {
    const role = await RoleModel.create(data);
    return role;
  }

  public async getAllRoles() {
    const roles = await RoleModel.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]],
    });
    return roles;
  }

  public async getRoleByName(name: string) {
    return await RoleModel.findOne({
      where: { name },
    });

  }


  public async getRoleById(id: number) {
    const role = await RoleModel.findOne({
      where: { id, isDeleted: false },
    });
    if (!role) throw new NotFoundException("Role not found");
    return role;
  }

  public async updateRole(id: number, data: { name?: string; delegationId?: number }) {
    const role = await this.getRoleById(id);
    await role.update(data);
    return role;
  }

  public async deleteRole(id: number) {
    const role = await this.getRoleById(id);
    await role.destroy(); // soft delete
    return { message: "Role deleted successfully" };
  }
}

export const roleService = new RoleService();
