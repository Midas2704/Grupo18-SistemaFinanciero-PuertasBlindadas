import { Router } from 'express';

export const treasuryController = Router();

// TODO: Implementar endpoints de tesorería
treasuryController.get('/', (_req, res) => {
  res.json({ controller: 'treasury', status: 'skeleton' });
});
