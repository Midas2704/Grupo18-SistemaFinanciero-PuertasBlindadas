import { Router } from 'express';

export const authController = Router();

// TODO: Implementar endpoints de autenticación
authController.get('/', (_req, res) => {
  res.json({ controller: 'auth', status: 'skeleton' });
});
