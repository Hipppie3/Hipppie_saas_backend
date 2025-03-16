import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import dbConfig from './config.js';  // Import configuration from config.js

// Load environment variables
dotenv.config();

// Choose the correct config based on the environment
const environment = process.env.NODE_ENV || 'development';
const config = dbConfig[environment];

// Use DATABASE_URL for production (Heroku, AWS RDS) and fallback to local config
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {   // Use DATABASE_URL for production
      dialect: 'postgres',
      logging: false,  // Disable logging in production
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,  // Allow self-signed certificates (Heroku, AWS RDS)
        },
      },
    })
  : new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        logging: config.logging,  // Enable logging in development
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
