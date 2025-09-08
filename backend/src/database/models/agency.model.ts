import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface AgenceAttributes {
  id: number;
  name: string;
  delegationId?: number | null;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface AgenceCreationAttributes
  extends Optional<AgenceAttributes, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt"> { }

export class AgenceModel
  extends Model<AgenceAttributes, AgenceCreationAttributes>
  implements AgenceAttributes {
  public id!: number;
  public name!: string;
  public delegationId!: number | null;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public static initialize(sequelize: Sequelize): void {
  AgenceModel.init(
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
      delegationId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "delegations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: "agences",
      timestamps: true,
      paranoid: true, // soft delete
      underscored: true,  // colonnes snake_case
    }
  );
}

}

