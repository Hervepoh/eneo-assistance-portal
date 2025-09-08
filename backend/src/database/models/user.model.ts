import { DataTypes, Model, Optional, Sequelize } from "sequelize";
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
  isActive: boolean;
  isLdap: boolean;
  isEmailVerified: boolean;
  userPreferences: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id" | "isActive" | "isLdap" | "isEmailVerified" | "userPreferences"> { }

// Définition du modèle
export class UserModel extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public isActive!: boolean;
  public isLdap!: boolean;
  public isEmailVerified!: boolean;
  public userPreferences!: UserPreferences;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Méthode custom
  public async comparePassword(value: string): Promise<boolean> {
    return compareValue(value, this.password);
  }

  public static initialize(sequelize: Sequelize): void {
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
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        },
        isLdap: {
          type: DataTypes.BOOLEAN,
          defaultValue: false
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
        underscored: true,  // colonnes snake_case
      }
    );

    UserModel.addScope("withPassword", {
      attributes: { include: ["password", "userPreferences"] },
    });

    
  }
}



