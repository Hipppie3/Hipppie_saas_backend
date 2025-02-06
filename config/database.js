import { Sequelize } from 'sequelize';
import  dbConfig  from './config.js';

const { database, username, password, host, dialect, port } = dbConfig;

const sequelize = new Sequelize(database, username, password, {
  host,
  dialect,
  port,
  logging: false,
});

const connectDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

export { sequelize, connectDb };
