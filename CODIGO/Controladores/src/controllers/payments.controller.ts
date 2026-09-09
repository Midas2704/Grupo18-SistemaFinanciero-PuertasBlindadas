import { Router } from 'express';

export const paymentsController = Router();

// TODO: Implementar endpoints de pagos
paymentsController.get('/', (_req, res) => {
  res.json({ controller: 'payments', status: 'skeleton' });
});
