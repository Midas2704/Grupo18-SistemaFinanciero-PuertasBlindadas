import { Router } from 'express';

export const remuneracionController = Router();

// TODO: Implementar endpoints de remuneración
remuneracionController.get('/', (_req, res) => {
  res.json({ controller: 'remuneracion', status: 'skeleton' });
});
