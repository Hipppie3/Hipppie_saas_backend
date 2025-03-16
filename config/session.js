import dotenv from 'dotenv';

// ✅ Explicitly load the correct environment file
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });

import session from 'express-session';
import pgSession from 'connect-pg-simple';

// ✅ Production-Only Session Configuration
const sessionMiddleware = session({
  store: new (pgSession(session))({
    conObject: {
      connectionString: process.env.DATABASE_URL,  // ✅ Correctly loaded from `.env.production`
      ssl: { rejectUnauthorized: false },
    },
    tableName: 'sessions',
  }),
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,  // ✅ Required for HTTPS in production
    httpOnly: true,
    sameSite: 'None',  // ✅ Needed for cross-origin cookies
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
  },
});

export default sessionMiddleware;
