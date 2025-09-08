import { DataTypes, Model, Optional, Sequelize } from "sequelize";

interface AssistanceHistoryAttributes {
  id: number;
  assistanceRequestId: number;
  userId: number;
  action: string;
  comment?: string;
  createdAt?: Date;
}

interface AssistanceHistoryCreationAttributes
  extends Optional<AssistanceHistoryAttributes, "id" | "comment" | "createdAt"> { }

export class AssistanceHistoryModel extends Model<
  AssistanceHistoryAttributes,
  AssistanceHistoryCreationAttributes
> implements AssistanceHistoryAttributes {
  public id!: number;
  public assistanceRequestId!: number;
  public userId!: number;
  public action!: string;
  public comment?: string;

  public readonly createdAt!: Date;

  public static initialize(sequelize: Sequelize): void {
    AssistanceHistoryModel.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        assistanceRequestId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        action: { type: DataTypes.STRING, allowNull: false },
        comment: { type: DataTypes.TEXT, allowNull: true },
      },
      {
        sequelize,
        tableName: "assistance_histories",
        timestamps: true,
        createdAt: true,
        updatedAt: false,
        underscored: true,
      }
    );
  }
}

