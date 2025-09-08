// src/database/models/rolePermission.model.ts
import { DataTypes, Model, Sequelize } from "sequelize";

interface RolePermissionAttributes {
  role_id: number;
  permission_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export class RolePermissionModel extends Model<RolePermissionAttributes> implements RolePermissionAttributes {
  public role_id!: number;
  public permission_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): void {
    RolePermissionModel.init(
      {
        role_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          allowNull: false,
        },
        permission_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "role_permissions",
        timestamps: true,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['role_id', 'permission_id']
          }
        ]
      }
    );
  }
}
