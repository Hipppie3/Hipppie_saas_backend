import session from 'express-session';
import pgSession from 'connect-pg-simple';
import dbConfig from './config.js'; // ✅ Use centralized config


const sessionMiddleware = session({
  store: new (pgSession(session))({
    conObject: {
      user: dbConfig.username,
      password: dbConfig.password,
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port,
    },
    tableName: 'sessions', // Default is session but since we name our table session(s)
  }),
  secret: process.env.SESSION_SECRET || 'supersecretkey', // ✅ Still using env for security
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // ✅ Secure in production
    httpOnly: true, // ✅ Prevents XSS attacks
  },
});

export default sessionMiddleware;


/*
1. Import express-session and connect-pg-simple
2. Get database credentials from config.js
3. Create a session store using pgSession, connected to PostgreSQL
4. Set session options:
  - Use PostgreSQL store
  - Set a secret key
  - Disable resaving unchanged sessions
  - Save only initialized sessions
  - Define cookie security settings
5. Export the session middleware for use in server.js
*/