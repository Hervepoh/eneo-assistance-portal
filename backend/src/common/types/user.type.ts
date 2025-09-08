import { PermissionModel, RoleModel, UserModel } from "../../database/models"

export type UserType = UserModel & {
    roles?: (RoleModel & { permissions: PermissionModel[] })[]
}