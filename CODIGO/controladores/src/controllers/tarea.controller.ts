import { Router } from 'express';

export const tareaController = Router();

// TODO: Implementar endpoints de tareas
tareaController.get('/', (_req, res) => {
  res.json({ controller: 'tarea', status: 'skeleton' });
});
