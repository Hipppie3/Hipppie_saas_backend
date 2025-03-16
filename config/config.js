import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const __dirname = new URL('.', import.meta.url).pathname;

const dbConfig = {
  development: {
    database: process.env.DB_NAME || 'hipppie_saas_db',
    username: process.env.DB_USERNAME || 'db_manager',
    password: process.env.DB_PASSWORD || 'db_manager',
    host: process.env.DB_HOST || '127.0.0.1',  // Use localhost for local development
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,  // Log SQL queries for debugging in local
  },
  production: {
    use_env_variable: 'DATABASE_URL',  // Use the DATABASE_URL environment variable for production
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,  // AWS RDS SSL fix
        ca: fs.readFileSync(path.join(__dirname, 'rds-ca-2019-root.pem')).toString(), // Use the SSL certificate
      },
    },
  },
};

export default dbConfig;
