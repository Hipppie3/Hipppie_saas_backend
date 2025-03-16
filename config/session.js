import dotenv from 'dotenv';
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
  scookie: {
  secure: process.env.NODE_ENV === 'production',  // `secure: true` for production (HTTPS), `false` for local (HTTP)
  httpOnly: true,
  sameSite: 'Lax',  // Use 'Lax' for both local and production
  maxAge: 24 * 60 * 60 * 1000,  // 24 hours
}

}
,
});

export default sessionMiddleware;
