import dotenv from 'dotenv';
// dotenv.config()
// dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' }); // ✅ Load .env.production in production, .env for development
if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });  // Load .env.production in production
} else {
  dotenv.config();  // Load .env for development
}
import express from 'express';
import cors from 'cors';
import { connectDb } from './config/database.js'; // ✅ Load database first
import sessionMiddleware from './config/session.js'; // ✅ Load session after DB
import userRoutes from './routes/userRoutes.js';
import leagueRoutes from './routes/leagueRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import sportRoutes from './routes/sportRoutes.js';
import statRoutes from './routes/statRoutes.js';
import gameRoutes from './routes/gameRoutes.js';
import playerGameStatRoutes from './routes/playerGameStatRoutes.js';
import gamePeriodRoutes from './routes/gamePeriodRoutes.js';
import PlayerAttributeRoutes from './routes/playerAttributeRoutes.js';
import seasonRoutes from './routes/seasonRoutes.js';
import viewModeRoutes from './routes/userPreferences.js';
import scheduleRoutes from './routes/scheduleRoutes.js';

const app = express();
app.set('trust proxy', 1); // 🔥 This is required when using secure cookies behind a proxy (Netlify/Heroku)
app.use(express.json()); // 🔥 Required to parse JSON POST bodies

const PORT = process.env.PORT || 5122;

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://sportinghip.netlify.app",
  "https://sportinghip.com",
  "https://www.sportinghip.com"
];

// ✅ CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// ✅ Preflight handler
app.options('*', cors());




// ✅ Connect to Database BEFORE setting up session
await connectDb();
// ✅ Apply Session Middleware AFTER DB Connection
app.use(sessionMiddleware);
app.set('trust proxy', 1); // Trust Heroku's proxy

// ✅ Register Routes
app.use('/api/users', userRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/playerGameStats', playerGameStatRoutes);
app.use('/api/gamePeriods', gamePeriodRoutes);
app.use('/api/playerAttributes', PlayerAttributeRoutes)
app.use('/api/seasons', seasonRoutes)
app.use('/api/preferences', viewModeRoutes)
app.use('/api/schedules', scheduleRoutes)

app.get('/', (req, res) => {
  res.send("App is running!");
});

app.get('/api/test', (req, res) => {
  console.log('GET /api/test route hit'); // Ensure it's being triggered
  res.json({ message: "Test API working!" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("Server initialized");
});

app.get('/api/test-session', (req, res) => {
  console.log('Current session:', req.session);
  res.json({ session: req.session });
});
