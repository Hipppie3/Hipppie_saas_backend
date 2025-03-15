import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // AWS RDS SSL fix
    },
  },
};

export default dbConfig;
