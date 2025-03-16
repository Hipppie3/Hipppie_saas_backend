import dotenv from 'dotenv';

// ✅ Explicitly load the correct environment file
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { Sequelize } from 'sequelize';

// Session Store Connection for Production (Heroku) and Local (localhost)
const sessionMiddleware = session({
 store: new (pgSession(session))({
      conObject: process.env.NODE_ENV === 'production'
        ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
        : { user: process.env.DB_USERNAME, password: process.env.DB_PASSWORD, host: process.env.DB_HOST, database: process.env.DB_NAME, port: process.env.DB_PORT },
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use false for local development
      httpOnly: true,
      sameSite: 'None', // This is necessary for cross-origin cookies
    },
  })


export default sessionMiddleware;
