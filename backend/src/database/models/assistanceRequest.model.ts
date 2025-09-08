import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { AssistanceStatusEnum } from "../../common/enums/assistance-status.enum";

interface AssistanceRequestAttributes {
  id: number;
  regionId: number;
  delegationId: number;
  agenceId: number;
  userId: number;
  superiorUserId?: number;
  description: string;
  comment?: string;
  status: AssistanceStatusEnum;
  applicationGroupId: number;
  applicationId: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface AssistanceRequestCreationAttributes
  extends Optional<AssistanceRequestAttributes, "id" | "comment" | "status" | "createdAt" | "updatedAt" | "deletedAt"> { }

export class AssistanceRequestModel extends Model<
  AssistanceRequestAttributes,
  AssistanceRequestCreationAttributes
> implements AssistanceRequestAttributes {
  public id!: number;
  public regionId!: number;
  public delegationId!: number;
  public agenceId!: number;
  public userId!: number;
  public superiorUserId?: number;
  public description!: string;
  public comment?: string;
  public status!: AssistanceStatusEnum;
  public applicationGroupId!: number;
  public applicationId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;

  public static initialize(sequelize: Sequelize): void {
    AssistanceRequestModel.init(
      {
        id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
        regionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        delegationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        agenceId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        superiorUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        description: { type: DataTypes.TEXT, allowNull: false },
        comment: { type: DataTypes.TEXT, allowNull: true },
        status: { type: DataTypes.ENUM(...Object.values(AssistanceStatusEnum)), defaultValue: AssistanceStatusEnum.DRAFT },
        applicationGroupId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        applicationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      },
      {
        sequelize,
        tableName: "assistance_requests",
        timestamps: true,
        paranoid: true, // soft delete
        underscored: true,  // colonnes snake_case
      }
    );
  }
}




