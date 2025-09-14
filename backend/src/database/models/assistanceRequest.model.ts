import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { AssistanceStatusEnum } from "../../common/enums/assistance-status.enum";
import { ReferenceGeneratorService } from "../../modules/assistance/referenceGenerator.service";

interface AssistanceRequestAttributes {
  id: number;
  reference: string;
  regionId: number;
  delegationId: number;
  agenceId: number;
  userId: number;
  superiorUserId?: number;
  titre: string;
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
  extends Optional<AssistanceRequestAttributes, "id" | "reference" | "comment" | "status" | "createdAt" | "updatedAt" | "deletedAt"> { }

export class AssistanceRequestModel extends Model<
  AssistanceRequestAttributes,
  AssistanceRequestCreationAttributes
> implements AssistanceRequestAttributes {
  public id!: number;
  public reference!: string;
  public regionId!: number;
  public delegationId!: number;
  public agenceId!: number;
  public userId!: number;
  public superiorUserId?: number;
  public titre!: string;
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
        reference: { type: DataTypes.STRING, allowNull: false },
        regionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        delegationId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        agenceId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
        userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        superiorUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        titre: { type: DataTypes.STRING, allowNull: false },
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
        hooks: {
          beforeValidate: async (instance: AssistanceRequestModel) => {
            // Générer la référence seulement si elle n'existe pas
            if (!instance.reference && instance.applicationId) {
              try {
                instance.reference = await ReferenceGeneratorService.generateUniqueReference(
                  instance.applicationId
                );
              } catch (error:any) {
                throw new Error(`Échec de génération de référence: ${error.message}`);
              }
            }
          }
        }
      }
    );
  }
}




