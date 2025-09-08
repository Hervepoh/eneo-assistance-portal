import { DataTypes, Model, Optional, Sequelize } from "sequelize";


interface AssistanceFileAttributes {
  id: number;
  assistanceRequestId: number;
  filePath: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface AssistanceFileCreationAttributes
  extends Optional<AssistanceFileAttributes, "id" | "description" | "createdAt" | "updatedAt" | "deletedAt"> { }

export class AssistanceFileModel extends Model<
  AssistanceFileAttributes,
  AssistanceFileCreationAttributes
> implements AssistanceFileAttributes {
  public id!: number;
  public assistanceRequestId!: number;
  public filePath!: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public static initialize(sequelize: Sequelize): void {
    AssistanceFileModel.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        assistanceRequestId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        filePath: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: true },
      },
      {
        sequelize,
        tableName: "assistance_files",
        timestamps: true,
        paranoid: true, // soft delete
        underscored: true,  // colonnes snake_case
      }
    );
  }
}