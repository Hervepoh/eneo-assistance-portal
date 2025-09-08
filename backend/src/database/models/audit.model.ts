// src/database/models/audit.model.ts
import { DataTypes, Model, Optional, Sequelize } from "sequelize";

export enum AuditAction {
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  CREATE_REQUEST = "CREATE_REQUEST",
  UPDATE_REQUEST = "UPDATE_REQUEST",
  VALIDATE_REQUEST = "VALIDATE_REQUEST",
  CANCEL_REQUEST = "CANCEL_REQUEST",
  DELETE_REQUEST = "DELETE_REQUEST",
  // Ajoutez d'autres actions au besoin
}

interface AuditAttributes {
  id: number;
  userId: number;
  action: AuditAction;
  entityType: string;
  entityId: number;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt?: Date;
}

interface AuditCreationAttributes extends Optional<AuditAttributes, "id" | "createdAt"> {}

export class AuditModel extends Model<AuditAttributes, AuditCreationAttributes> implements AuditAttributes {
  public id!: number;
  public userId!: number;
  public action!: AuditAction;
  public entityType!: string;
  public entityId!: number;
  public details!: string;
  public ipAddress!: string;
  public userAgent!: string;
  public readonly createdAt!: Date;

  public static initialize(sequelize: Sequelize): void {
    AuditModel.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
        },
        action: {
          type: DataTypes.ENUM(...Object.values(AuditAction)),
          allowNull: false,
        },
        entityType: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        entityId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        details: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        ipAddress: {
          type: DataTypes.STRING(45), // IPv6 peut avoir jusqu'à 45 caractères
          allowNull: true,
        },
        userAgent: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "audit_logs",
        timestamps: true,
        updatedAt: false,
        underscored: true,
        indexes: [
          {
            fields: ["userId"]
          },
          {
            fields: ["action"]
          },
          {
            fields: ["entityType", "entityId"]
          },
          {
            fields: ["createdAt"]
          }
        ]
      }
    );
  }
}

export default AuditModel;