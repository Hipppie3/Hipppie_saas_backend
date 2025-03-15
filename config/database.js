import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// Load the correct .env file based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });  // Load production environment variables
} else {
  dotenv.config();  // Load default local environment variables
}

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {   // Use DATABASE_URL for production
      dialect: 'postgres',
      logging: false,  // Disable logging in production
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: true,
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
        logging: console.log,  // Enable query logging for local development
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
