import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import sequelize from './config/database.js';

const app = express();

// ✅ Enable CORS
app.use(cors());

// Parse incoming JSON
app.use(express.json());

// Basic Test Route
app.get('/api', (req, res) => {
  res.send({ message: 'Hippie SaaS Backend is running!' }); // ✅ Wrapped in an object
});
// Sync Database Models
sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synchronized'))
  .catch((err) => console.error('Error syncing database:', err));

app.listen(config.app.port, () =>
  console.log(`Server running on port ${config.app.port}`)
);
