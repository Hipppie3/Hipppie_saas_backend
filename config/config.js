import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '../.env' });

// Get the current directory path
const __dirname = new URL('.', import.meta.url).pathname;

const dbConfig = {
  development: {
    username: process.env.DB_USERNAME || 'db_manager',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'hipppie_saas_db',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres', // ✅ Needed for local development
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // AWS RDS SSL fix
        ca: fs.readFileSync(path.join(__dirname, 'rds-ca-2019-root.pem')).toString(), // Use the downloaded certificate
      },
    },
  },
};

export default dbConfig;
