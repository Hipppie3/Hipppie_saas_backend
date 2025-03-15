const dbConfig = {
  connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: process.env.NODE_ENV === 'production', // Only use SSL in production (AWS RDS)
      rejectUnauthorized: false, // Needed for AWS RDS SSL connection
    },
  },
};

export default dbConfig;
