// src/database/models/permission.model.ts
import { DataTypes, Model, Optional, Sequelize } from "sequelize";


interface PermissionAttributes {
  id: number;
  name: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface PermissionCreationAttributes extends Optional<PermissionAttributes, "id" | "isDeleted" | "createdAt" | "updatedAt" | "deletedAt"> { }

export class PermissionModel extends Model<PermissionAttributes, PermissionCreationAttributes> implements PermissionAttributes {
  public id!: number;
  public name!: string;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public static initialize(sequelize: Sequelize): void {
    PermissionModel.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        sequelize,
        tableName: "permissions",
        timestamps: true,
        paranoid: true,
        underscored: true,  // colonnes snake_case
      }
    );
  }
}
