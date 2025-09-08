// src/database/models/userRole.model.ts
import { DataTypes, Model, Sequelize } from "sequelize";

interface UserRoleAttributes {
  user_id: number;
  role_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export class UserRoleModel extends Model<UserRoleAttributes> implements UserRoleAttributes {
  public user_id!: number;
  public role_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize): void {
    UserRoleModel.init(
      {
        user_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          allowNull: false,
        },
        role_id: {
          type: DataTypes.INTEGER.UNSIGNED,
          primaryKey: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "user_roles",
        timestamps: true,
        underscored: true,
      }
    );
  }
}