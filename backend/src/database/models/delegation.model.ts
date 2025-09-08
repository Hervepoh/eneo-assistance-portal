import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface DelegationAttributes {
  id: number;
  name: string;
  regionId?: number | null;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface DelegationCreationAttributes
  extends Optional<DelegationAttributes, "id" | "isDeleted" | "createdAt" | "updatedAt" | "deletedAt"> { }

export class DelegationModel
  extends Model<DelegationAttributes, DelegationCreationAttributes>
  implements DelegationAttributes {
  public id!: number;
  public name!: string;
  public regionId!: number | null;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public static initialize(sequelize: Sequelize): void {
    DelegationModel.init(
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
        regionId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
          references: {
            model: "regions",
            key: "id",
          },
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
        },
        isDeleted: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: "delegations",
        timestamps: true,
        paranoid: true, // soft delete
        underscored: true, // colonnes snake_case
      }
    );
  }

}

