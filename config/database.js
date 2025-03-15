import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load environment variables
dotenv.config({ path: '../.env' });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.PGSSLMODE ? { require: true, rejectUnauthorized: false } : false,
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
