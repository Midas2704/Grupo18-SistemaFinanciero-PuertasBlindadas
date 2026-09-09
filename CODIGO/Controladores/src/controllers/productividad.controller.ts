import { Router } from 'express';

export const productividadController = Router();

// TODO: Implementar endpoints de productividad
productividadController.get('/', (_req, res) => {
  res.json({ controller: 'productividad', status: 'skeleton' });
});
