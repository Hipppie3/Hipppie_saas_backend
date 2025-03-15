import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Explicitly load .env from the project root
dotenv.config({ path: '../.env' });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Allows AWS RDS SSL connection
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
