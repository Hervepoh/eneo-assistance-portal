import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface ApplicationAttributes {
  id: number;
  name: string;
  groupId: number;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface ApplicationCreationAttributes
  extends Optional<ApplicationAttributes, "id" | "isDeleted" | "createdAt" | "updatedAt" | "deletedAt"> { }

export class ApplicationModel
  extends Model<ApplicationAttributes, ApplicationCreationAttributes>
  implements ApplicationAttributes {
  public id!: number;
  public name!: string;
  public groupId!: number;
  public isDeleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public static initialize(sequelize: Sequelize): void {
  ApplicationModel.init(
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
      groupId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: "application_groups",
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
      tableName: "applications",
      timestamps: true,
      paranoid: true, // soft delete
      underscored: true, // colonnes snake_case
    }
  );
}
}


