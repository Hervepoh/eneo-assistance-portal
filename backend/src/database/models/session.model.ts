import { DataTypes, Model, Optional, BelongsToGetAssociationMixin } from "sequelize";
import { sequelize } from "../database"; // ton instance Sequelize
import UserModel, { UserAttributes } from "./user.model";
import { thirtyDaysFromNow } from "../../common/utils/date-time";

interface SessionAttributes {
  id: number;
  userId: number;
  userAgent?: string;
  expiredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SessionCreationAttributes
  extends Optional<SessionAttributes, "id" | "createdAt" | "updatedAt" | "expiredAt"> {}

export class SessionModel extends Model<SessionAttributes, SessionCreationAttributes>
  implements SessionAttributes {
  public id!: number;
  public userId!: number;
  public userAgent?: string;
  public expiredAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // ✅ Déclaration du mixin pour TypeScript
  public getUser!: BelongsToGetAssociationMixin<UserModel>;
  public readonly user?: UserModel; // propriété ajoutée via belongsTo
}

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
  }
);

// association Sequelize
SessionModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

export default SessionModel;
