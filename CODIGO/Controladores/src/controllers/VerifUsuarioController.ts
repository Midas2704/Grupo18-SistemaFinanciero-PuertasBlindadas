import { Router } from 'express';

export const verifUsuarioController = Router();

// TODO: Implementar endpoints de verificación de usuario
verifUsuarioController.get('/', (_req, res) => {
  res.json({ controller: 'VerifUsuario', status: 'skeleton' });
});
