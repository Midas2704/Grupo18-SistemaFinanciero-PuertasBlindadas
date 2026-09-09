import { Router } from 'express';

export const operarioController = Router();

// TODO: Implementar endpoints de operarios
operarioController.get('/', (_req, res) => {
  res.json({ controller: 'operario', status: 'skeleton' });
});
