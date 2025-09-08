import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface RoleAttributes {
  id: number;
  name: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, "id" | "isDeleted" | "createdAt" | "updatedAt" | "deletedAt"> { }

export class RoleModel extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public static initialize(sequelize: Sequelize): void {
    RoleModel.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        sequelize,
        tableName: "roles",
        timestamps: true,
        paranoid: true,
        underscored: true
      }
    );
  }
}

