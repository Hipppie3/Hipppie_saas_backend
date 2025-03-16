import dotenv from 'dotenv';

// ✅ Ensure the correct `.env` file is loaded
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

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
    secure: process.env.NODE_ENV === 'production', // ✅ True for HTTPS, false for localhost
    httpOnly: true,
    sameSite: 'None', // ✅ Required for cross-origin session cookies
    domain: 'hipppieleague.netlify.app',  // ✅ Explicitly set your domain
    maxAge: 24 * 60 * 60 * 1000, // ✅ 24-hour session persistence
  },
});

export default sessionMiddleware;
