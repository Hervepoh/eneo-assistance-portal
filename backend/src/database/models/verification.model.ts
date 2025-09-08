import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { VerificationEnum } from "../../common/enums/verification-code.enum";
import { generateUniqueCode } from "../../common/utils/uuid";

interface VerificationCodeAttributes {
  id: number;
  userId: number;
  code: string;
  type: VerificationEnum;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Optionnel lors de la création : id, createdAt, updatedAt, code
interface VerificationCodeCreationAttributes
  extends Optional<VerificationCodeAttributes, "id" | "createdAt" | "updatedAt" | "code"> { }

export class VerificationCodeModel extends Model<
  VerificationCodeAttributes,
  VerificationCodeCreationAttributes
> implements VerificationCodeAttributes {
  public id!: number;
  public userId!: number;
  public code!: string;
  public type!: VerificationEnum;
  public expiresAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: Sequelize): void {
    VerificationCodeModel.init(
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
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        code: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          defaultValue: generateUniqueCode,
        },
        type: {
          type: DataTypes.ENUM(...Object.values(VerificationEnum)),
          allowNull: false,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "verification_codes",
        timestamps: true,
        underscored: true,  // colonnes snake_case
      }
    );
  }
}

