import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database";

interface ApplicationGroupAttributes {
  id: number;
  name: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface ApplicationGroupCreationAttributes
  extends Optional<ApplicationGroupAttributes, "id" | "isDeleted" | "createdAt" | "updatedAt" | "deletedAt"> {}

export class ApplicationGroupModel
  extends Model<ApplicationGroupAttributes, ApplicationGroupCreationAttributes>
  implements ApplicationGroupAttributes
{
  public id!: number;
  public name!: string;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

ApplicationGroupModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_deleted",
    },
  },
  {
    sequelize,
    tableName: "application_groups",
    timestamps: true,
    paranoid: true, // ajoute deletedAt
    underscored: true,
  }
);

export default ApplicationGroupModel;
