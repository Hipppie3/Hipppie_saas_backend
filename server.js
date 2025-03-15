import dotenv from 'dotenv';
dotenv.config(); // ✅ Load environment variables first

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

const app = express();
const PORT = process.env.PORT || 5122;

// ✅ Apply Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://hipppieleague.netlify.app"],
    credentials: true,
  })
);
const allowedOrigins = [
  "http://localhost:5173", 
  "https://hipppieleague.netlify.app" // ✅ Add "https://"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);



// ✅ Connect to Database BEFORE setting up session
await connectDb(); 

// ✅ Apply Session Middleware AFTER DB Connection
app.use(sessionMiddleware);

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

// ✅ Start Server
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));

app.get('/api/test', (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.get('/health-check', (req, res) => {
  res.json({ message: 'Server is up and running!' });
});
