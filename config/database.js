import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';

// Load environment variables
dotenv.config();


const __dirname = new URL('.', import.meta.url).pathname;

const dbConfig = {
  development: {
    username: process.env.DB_USERNAME || 'db_manager',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'hipppie_saas_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,  // Disable logging in development
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: true,  // Allow self-signed certificates in production
        ca: process.env.NODE_ENV === 'production' ? fs.readFileSync(path.join(__dirname, 'rds-ca-2019-root.pem')).toString() : undefined,  // Only include CA certificate in production
      },
    },
  },
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {   // Use DATABASE_URL for production
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
