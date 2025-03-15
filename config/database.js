import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '../.env' });

// Load AWS RDS CA certificate
const sslOptions = {
  require: true,
  rejectUnauthorized: true, // Verify the certificate
  ca: fs.readFileSync('rds-ca.pem').toString(), // Load the AWS certificate
};

// Create the Sequelize instance with SSL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: sslOptions,
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
