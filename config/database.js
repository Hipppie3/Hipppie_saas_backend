import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '../.env' });

// Ensure the RDS CA Certificate is available
const sslOptions = {
  require: true,
  rejectUnauthorized: true, // Now verifying the self-signed cert
  ca: fs.readFileSync('rds-ca.pem').toString(), // Load the AWS certificate
};

// Force SSL to be used with the certificate
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
