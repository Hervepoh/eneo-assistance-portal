import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database";

interface RegionAttributes {
  id: number;
  name: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface RegionCreationAttributes
  extends Optional<RegionAttributes, "id" | "isDeleted" | "createdAt" | "updatedAt" | "deletedAt"> {}

export class RegionModel
  extends Model<RegionAttributes, RegionCreationAttributes>
  implements RegionAttributes
{
  public id!: number;
  public name!: string;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

RegionModel.init(
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
    },
  },
  {
    sequelize,
    tableName: "regions",
    timestamps: true,
    paranoid: true, // ajoute deletedAt
    underscored: true,
  }
);

export default RegionModel;
