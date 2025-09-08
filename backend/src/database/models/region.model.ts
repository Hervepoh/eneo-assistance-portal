// src/database/models/region.model.ts

import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface RegionAttributes {
  id: number;
  name: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface RegionCreationAttributes
  extends Optional<RegionAttributes, "id" | "isDeleted" | "createdAt" | "updatedAt" | "deletedAt"> { }

export class RegionModel
  extends Model<RegionAttributes, RegionCreationAttributes>
  implements RegionAttributes {
  public id!: number;
  public name!: string;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public static initialize(sequelize: Sequelize): void {
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
        underscored: true,  // colonnes snake_case
      }
    );
  }

}

