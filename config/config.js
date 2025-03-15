const dbConfig = {
  connectionString: process.env.DATABASE_URL || 
    `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // Always require SSL for AWS RDS
      rejectUnauthorized: false, // Allows self-signed certificates
    },
  },
};

export default dbConfig;
