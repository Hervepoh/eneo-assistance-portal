// src/database/models/session.model.ts

import { DataTypes, Model, Optional, BelongsToGetAssociationMixin, Sequelize } from "sequelize";
import { thirtyDaysFromNow } from "../../common/utils/date-time";
import { UserModel } from "./user.model";

interface SessionAttributes {
  id: number;
  userId: number;
  roleId?: number;
  userAgent?: string;
  expiredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SessionCreationAttributes
  extends Optional<SessionAttributes, "id" | "roleId" | "createdAt" | "updatedAt" | "expiredAt"> { }

export class SessionModel extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes {
  public id!: number;
  public userId!: number;
  public roleId!: number;
  public userAgent?: string;
  public expiredAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // ✅ Déclaration du mixin pour TypeScript
  public getUser!: BelongsToGetAssociationMixin<UserModel>;
  public readonly user?: UserModel; // propriété ajoutée via belongsTo

  public static initialize(sequelize: Sequelize): void {
    SessionModel.init(
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
            model: UserModel,
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        roleId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        userAgent: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        expiredAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: thirtyDaysFromNow,
        },
      },
      {
        sequelize,
        tableName: "sessions",
        timestamps: true,
        underscored: true,  // colonnes snake_case
      }
    );
  }
}
