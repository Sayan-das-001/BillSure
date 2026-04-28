import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import billRoutes from './routes/billRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', billRoutes);

app.listen(PORT, () => {
  console.log(`🚀 BillBiopsy server running on http://localhost:${PORT}`);
  console.log(`📊 Features: Dynamic Rate Card & Self-Learning History enabled`);
});
