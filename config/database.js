import { Sequelize } from 'sequelize';
import config from './config.js';

// Connect to PostgreSQL using config values
const sequelize = new Sequelize(
  config.db.name,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    dialect: config.db.dialect,
    port: config.db.port,
    logging: false, // Set to true if you want SQL logs
  }
);

// Test Database Connection
try {
  await sequelize.authenticate();
  console.log('✅ Database connected successfully!');
} catch (error) {
  console.error('❌ Unable to connect to the database:', error);
}

export default sequelize;
