import session from 'express-session';
import pgSession from 'connect-pg-simple';
import dbConfig from './config.js';

// Ensure we're using the right environment
const env = process.env.NODE_ENV || 'development';
const dbSettings = dbConfig[env]; // ✅ Select correct database settings

console.log("🔍 Session Store Config:", dbSettings); // ✅ Debugging log

const sessionMiddleware = session({
  store: new (pgSession(session))({
    conObject: {
      user: dbSettings.username,
      password: dbSettings.password,
      host: dbSettings.host,
      database: dbSettings.database,
      port: dbSettings.port,
    },
    tableName: 'sessions',
  }),
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
cookie: {
  secure: process.env.NODE_ENV === 'production', // Enable secure cookies in production
  httpOnly: true, // Prevent client-side access to the cookies
  sameSite: 'None', // Necessary for cross-origin cookies in production
}
});

export default sessionMiddleware;
