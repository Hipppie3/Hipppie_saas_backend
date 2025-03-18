import dotenv from 'dotenv';
// dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });


if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });  // Load .env.production in production
} else {
  dotenv.config();  // Load .env for development
}

import session from 'express-session';
import pgSession from 'connect-pg-simple';

// ✅ Session Store Configuration
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
  secure: process.env.NODE_ENV === 'production' ? true : false,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',  // Change for local
  maxAge: 24 * 60 * 60 * 1000,
}
,
});

export default sessionMiddleware;
