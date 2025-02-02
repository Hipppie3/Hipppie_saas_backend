import { Sequelize } from 'sequelize';
import config from './config.js';

// Destructure database configuration
const { database, username, password, host, dialect, port } = config.db;

// Connect to PostgreSQL using config values
const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
  port,
  logging: false, // Set to true if you want SQL logs
});

// Test Database Connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

await connectDB();

export default sequelize;
