import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../database";
import { AssistanceStatusEnum } from "../../common/enums/assistance-status.enum";


interface AssistanceRequestAttributes {
  id: number;
  regionId: number;
  delegationId: number;
  agenceId: number;
  userId: number;
  superieurHierarchiqueId?: number;
  description: string;
  comment?: string;
  dateDemande: Date;
  applicationGroupId: number;
  applicationId: number;
  status: AssistanceStatusEnum;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface AssistanceRequestCreationAttributes
  extends Optional<
    AssistanceRequestAttributes,
    "id" | "superieurHierarchiqueId" | "status" | "comment" | "deletedAt"
  > {}

export class AssistanceRequestModel
  extends Model<AssistanceRequestAttributes, AssistanceRequestCreationAttributes>
  implements AssistanceRequestAttributes
{
  public id!: number;
  public regionId!: number;
  public delegationId!: number;
  public agenceId!: number;
  public userId!: number;
  public superieurHierarchiqueId?: number;
  public description!: string;
  public comment?: string;
  public dateDemande!: Date;
  public applicationGroupId!: number;
  public applicationId!: number;
  public status!: AssistanceStatusEnum;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

AssistanceRequestModel.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    regionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    delegationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    agenceId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    superieurHierarchiqueId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: true },
    dateDemande: { type: DataTypes.DATE, allowNull: false },
    applicationGroupId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    applicationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    status: {
      type: DataTypes.ENUM(...Object.values(AssistanceStatusEnum)),
      allowNull: false,
      defaultValue: AssistanceStatusEnum.DRAFT,
    },
  },
  {
    sequelize,
    tableName: "assistance_requests",
    timestamps: true,
    paranoid: true,
    underscored: true,
  }
);

export default AssistanceRequestModel;
