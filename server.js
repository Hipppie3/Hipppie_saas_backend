import dotenv from 'dotenv';
dotenv.config(); // ✅ Load env variables here
import express from 'express';
import cors from 'cors';
import { connectDb } from './config/database.js';
import userRoutes from './routes/userRoutes.js';
import leagueRoutes from './routes/leagueRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import sessionMiddleware from './config/session.js';


const app = express();
const PORT = process.env.PORT || 5122;

// ✅ Apply Middleware
app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));

// ✅ Connect to Database
await connectDb();


// ✅ Apply Session Middleware
app.use(sessionMiddleware);

// ✅ Register Routes
app.use('/api/users', userRoutes);
app.use('/api/leagues', leagueRoutes);
app.use('/api/teams', teamRoutes);

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

