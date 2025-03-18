import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });  // Load .env.production in production
} else {
  dotenv.config();  // Load .env for development
}

const __dirname = new URL('.', import.meta.url).pathname;

const sequelize = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,  // Disable logging in production
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,  // Fix for self-signed certificate in Heroku production
        },
      },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USERNAME,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST || '127.0.0.1',  // Default to localhost for local development
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,  // Disable logging in development
      }
    );


// Function to connect to the database
const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

export { sequelize, connectDb };
