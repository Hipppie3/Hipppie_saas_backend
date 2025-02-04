import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
};

const jwtConfig = {
  secret: process.env.JWT_SECRET,
};

if (!jwtConfig.secret) {
  throw new Error('JWT_SECRET is not defined in the environment variables.');
}

export { dbConfig, jwtConfig };
