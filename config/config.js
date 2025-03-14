import dotenv from 'dotenv';
dotenv.config();

const dbConfig =
  process.env.NODE_ENV === "production"
    ? {
        connectionString: process.env.DATABASE_URL, // Use AWS RDS when in production
        dialect: "postgres",
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false, // Required for AWS RDS
          },
        },
      }
    : {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
      };

export default dbConfig;
