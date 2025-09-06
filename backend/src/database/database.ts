import { Dialect, Sequelize } from "sequelize";
import { config } from "../config/app.config";

const { NAME, USER, PASSWORD, HOST, PORT, DIALECT } = config.DATABASE;

export const sequelize = new Sequelize(NAME, USER, PASSWORD, {
  host: HOST,
  port: PORT as unknown as number,
  dialect: DIALECT as Dialect,
  logging: false,
});

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL database");
  } catch (error) {
    console.error("❌ Error connecting to MySQL database:", error);
    process.exit(1);
  }
};

export default connectDatabase;
