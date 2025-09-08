import { DataTypes, Model, Sequelize } from "sequelize";

interface SessionUserRolesPermissionsAttributes {
    id: number;
    user_id: number | null;
    role_id: number | null;
    role_name: string | null;
    permission_id: number | null;
    permission_name: string | null;
}

export class SessionUserRolesPermissionsViewModel extends Model<SessionUserRolesPermissionsAttributes>
    implements SessionUserRolesPermissionsAttributes {
    public id!: number;
    public user_id!: number;
    public role_id!: number;
    public role_name!: string | null;
    public permission_id!: number | null;
    public permission_name!: string | null;

    static initialize(sequelize: Sequelize): void {
        SessionUserRolesPermissionsViewModel.init(
            {
                id: { type: DataTypes.INTEGER, allowNull: false , primaryKey:true },
                user_id: { type: DataTypes.INTEGER, allowNull: true },
                role_id: { type: DataTypes.INTEGER, allowNull: true },
                role_name: { type: DataTypes.STRING, allowNull: true },
                permission_id: { type: DataTypes.INTEGER, allowNull: true },
                permission_name: { type: DataTypes.STRING, allowNull: true }
            },
            {
                sequelize,
                tableName: "sessions_user_roles_permissions",
                timestamps: false
            }
        );
    }
}
