import express from 'express';
import cors from 'cors';
import { connectDb, sequelize } from './config/database.js'; 
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5122;

// ✅ 1. Middleware (Parse JSON, Enable CORS)
app.use(express.json());
app.use(cors());

// ✅ 2. Connect to Database (before handling any requests)
await connectDb();

// ✅ 3. Register Routes
app.use('/api/users', userRoutes);

// ✅ 4. Basic Test Route
app.get('/api', (req, res) => {
  res.send({ message: 'Hippie SaaS Backend is running!' });
});

// ✅ 5. Sync Database Models (after DB connection)
// sequelize.sync({ alter: true })
// .then(() => console.log('✅ Database synchronized'))
// .catch((err) => console.error('❌ Error syncing database:', err));

// ✅ 6. Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
