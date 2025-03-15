import { Sequelize } from 'sequelize';
import dbConfig from './config.js';

const { connectionString } = dbConfig;
const sequelize = new Sequelize(connectionString, {
  logging: false,  // Set to true for debugging SQL queries if needed
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



