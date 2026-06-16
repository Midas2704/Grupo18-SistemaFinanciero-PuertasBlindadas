import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { finanzasRouter } from './controllers/finanzas.controller';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', module: 'Puertas Blindadas - Finanzas', timestamp: new Date().toISOString() });
});

import { prisma } from './db';
app.get('/api/testdb', async (_req, res) => {
  try {
    const count = await prisma.ficha_cliente.count();
    res.json({ count });
  } catch(e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Rutas principales
app.use('/api/finanzas', finanzasRouter);

// Start
const server = app.listen(PORT, () => {
  console.log(`[Finanzas] Servidor corriendo en http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('Error al iniciar el servidor:', err);
});

export default app;
