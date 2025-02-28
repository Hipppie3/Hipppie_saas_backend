import dotenv from 'dotenv';
dotenv.config(); // ✅ Load env variables here
import express from 'express';
import cors from 'cors';
import { connectDb } from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import leagueRoutes from './routes/leagueRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import sportRoutes from './routes/sportRoutes.js';
import statRoutes from './routes/statRoutes.js';
import sessionMiddleware from './config/session.js';



const app = express();
const PORT = process.env.PORT || 5122;

// ✅ Apply Middleware
app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));

// ✅ Connect to Database
await connectDb();

// Middleware to set cache headers
app.use((req, res, next) => {
  const domain = req.query.domain;
  
  if (!domain) {
    // Private content: prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }

  next();
});



// ✅ Apply Session Middleware
app.use(sessionMiddleware);

// ✅ Register Routes
app.use('/api/users', userRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/stats', statRoutes);


// ✅ Start Server
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));

