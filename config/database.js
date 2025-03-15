import { Sequelize } from 'sequelize';
import fs from 'fs';
import dbConfig from './config.js';

const { connectionString } = dbConfig;

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false, // Set to true for debugging SQL queries if needed
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
      ca: fs.readFileSync('./rds-ca.pem').toString(), // AWS RDS CA Certificate
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
