import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db/pool.js';
import juegosRouter from './routes/juegos.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    application: 'SaleVicio API'
  });
});

app.get('/api/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      status: 'ok',
      database: 'connected'
    });
  } catch (error) {
    console.error('Error de PostgreSQL:', error.message);

    res.status(503).json({
      status: 'error',
      database: 'unavailable'
    });
  }
});

app.use('/api/juegos', juegosRouter);

app.listen(PORT, () => {
  console.log(`API funcionando en http://localhost:${PORT}`);
});