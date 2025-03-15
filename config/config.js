import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const dbConfig = {
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // AWS RDS SSL fix
      },
    },
  },
};

export default dbConfig;
