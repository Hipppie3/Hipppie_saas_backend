import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Explicitly load environment variables
const envLoaded = dotenv.config({ path: '../.env' });
console.log("🔍 dotenv loaded:", envLoaded);
console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL);

// Ensure DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in environment variables!");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // AWS RDS SSL fix
    },
  },
});

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

export { sequelize, connectDb };
