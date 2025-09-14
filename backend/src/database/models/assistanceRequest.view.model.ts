// src/database/models/assistanceRequestView.model.ts
import { DataTypes, Model, Sequelize } from "sequelize";

export interface AssistanceRequestViewAttributes {
  id: number;
  reference: string;
  region_id: number;
  region_name: string;
  delegation_id: number;
  delegation_name: string;
  agence_id?: number | null;
  agence_name?: string | null;
  user_id: number;
  user_name: string;
  user_email: string;
  superior_user_id: number;
  superior_user_name: string;
  titre: string;
  description: string;
  status: string;
  application_group_id: number;
  application_group_name: string;
  application_id: number;
  application_name: string;
  created_at: Date;
  updated_at: Date;
  fichier_count: number;
}

export class AssistanceRequestViewModel extends Model<
  AssistanceRequestViewAttributes
> implements AssistanceRequestViewAttributes {
  public id!: number;
  public reference!: string;
  public region_id!: number;
  public region_name!: string;
  public delegation_id!: number;
  public delegation_name!: string;
  public agence_id!: number | null;
  public agence_name!: string | null;
  public user_id!: number;
  public user_name!: string;
  public user_email!: string;
  public superior_user_id!: number;
  public superior_user_name!: string;
  public titre!: string;
  public description!: string;
  public status!: string;
  public application_group_id!: number;
  public application_group_name!: string;
  public application_id!: number;
  public application_name!: string;
  public created_at!: Date;
  public updated_at!: Date;
  public fichier_count!: number;

  static initialize(sequelize: Sequelize): void {
    AssistanceRequestViewModel.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        reference: DataTypes.STRING,
        region_id: DataTypes.INTEGER,
        region_name: DataTypes.STRING,
        delegation_id: DataTypes.INTEGER,
        delegation_name: DataTypes.STRING,
        agence_id: DataTypes.INTEGER,
        agence_name: DataTypes.STRING,
        user_id: DataTypes.INTEGER,
        user_name: DataTypes.STRING,
        user_email: DataTypes.STRING,
        superior_user_id: DataTypes.INTEGER,
        superior_user_name: DataTypes.STRING,
        titre: DataTypes.STRING,
        description: DataTypes.TEXT,
        status: DataTypes.STRING,
        application_group_id: DataTypes.INTEGER,
        application_group_name: DataTypes.STRING,
        application_id: DataTypes.INTEGER,
        application_name: DataTypes.STRING,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
        fichier_count: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        tableName: "assistance_requests_view",
        timestamps: false, // c'est une vue, pas de create/update
        underscored: true,
      }
    );
  }
}
