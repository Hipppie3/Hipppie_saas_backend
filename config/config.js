import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  app: {
    port: process.env.PORT || 5122,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'defaultsecret',
  },
};

const dbConfig = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    port: process.env.PROD_DB_PORT,
    dialect: 'postgres',
  },
};

export default {
  development: dbConfig.development,
  production: dbConfig.production,
  ...baseConfig,
  jwt: {
    secret: env === 'production' ? process.env.PROD_JWT_SECRET : process.env.JWT_SECRET,
  },
};