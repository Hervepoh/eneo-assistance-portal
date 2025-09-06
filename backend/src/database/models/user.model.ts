import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../database/database";
import { compareValue, hashValue } from "../../common/utils/bcrypt";

interface UserPreferences {
  enable2FA: boolean;
  emailNotification: boolean;
  twoFactorSecret?: string;
}

// Champs d'entrée (sans id, createdAt, updatedAt car gérés par Sequelize)
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  userPreferences: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "isEmailVerified" | "userPreferences"> {}

// Définition du modèle
class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public isEmailVerified!: boolean;
  public userPreferences!: UserPreferences;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Méthode custom
  public async comparePassword(value: string): Promise<boolean> {
    return compareValue(value, this.password);
  }
}

// Init Sequelize
UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userPreferences: {
      type: DataTypes.JSON, // Stocké en JSON dans MySQL
      defaultValue: {
        enable2FA: false,
        emailNotification: true,
      },
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ["password", "userPreferences.twoFactorSecret"] },
    },
    hooks: {
      beforeSave: async (user: UserModel) => {
        if (user.changed("password")) {
          user.password = await hashValue(user.password);
        }
      },
    },
  }
);

export default UserModel;
