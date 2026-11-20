import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db/pool.js';
import juegosRouter from './routes/juegos.routes.js';
import comunidadRouter from './routes/comunidad.routes.js';
import authRouter from './routes/auth.routes.js';
import forosRouter from './routes/foros.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const origenesPermitidos = [
  process.env.FRONTEND_URL,
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: origenesPermitidos
}));

app.use(express.json({limit:'16kb'}));
app.disable('x-powered-by');
app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Referrer-Policy','no-referrer');next();});

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

app.use('/api/auth',authRouter);
app.use('/api/juegos', juegosRouter);

app.use('/api', comunidadRouter);
app.use('/api', forosRouter);


app.listen(PORT, '0.0.0.0', () => {
  console.log(`SaleVicio API ejecutándose en puerto ${PORT}`);
});