import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database";
import { AssistanceRequestModel } from "./assistanceRequest.model";

interface AssistanceFileAttributes {
  id: number;
  requestId: number;
  filePath: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AssistanceFileCreationAttributes
  extends Optional<AssistanceFileAttributes, "id" | "description" | "createdAt" | "updatedAt"> {}

export class AssistanceFileModel
  extends Model<AssistanceFileAttributes, AssistanceFileCreationAttributes>
  implements AssistanceFileAttributes
{
  public id!: number;
  public requestId!: number;
  public filePath!: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AssistanceFileModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    requestId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: AssistanceRequestModel, key: "id" },
      onDelete: "CASCADE",
    },
    filePath: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: "assistance_files", timestamps: true, underscored: true }
);

AssistanceFileModel.belongsTo(AssistanceRequestModel, { foreignKey: "requestId", as: "request" });

export default AssistanceFileModel;
