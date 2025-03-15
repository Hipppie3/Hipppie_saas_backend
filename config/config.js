import dotenv from 'dotenv';
import fs from 'fs';  // Import fs to read the certificate file

dotenv.config({ path: '../.env' });

const caCert = fs.readFileSync('./rds-ca-2019-root.pem'); // Read the RDS CA certificate

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
        rejectUnauthorized: true,  // Ensure SSL verification is enabled
        ca: caCert,  // Provide the CA certificate for validation
      },
    },
  },
};

export default dbConfig;
