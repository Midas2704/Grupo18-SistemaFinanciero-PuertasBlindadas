import { Router } from 'express';
import { authController } from './auth.controller';
import { billingController } from './billing.controller';
import { clientsController } from './clients.controller';
import { operarioController } from './operario.controller';
import { paymentsController } from './payments.controller';
import { productividadController } from './productividad.controller';
import { remuneracionController } from './remuneracion.controller';
import { tareaController } from './tarea.controller';
import { treasuryController } from './treasury.controller';
import { verifUsuarioController } from './VerifUsuarioController';

import { dashboardController } from './dashboard.controller';

export const finanzasRouter = Router();

// Sub-rutas del módulo Finanzas
finanzasRouter.use('/dashboard', dashboardController);
finanzasRouter.use('/auth', authController);
finanzasRouter.use('/billing', billingController);
finanzasRouter.use('/clients', clientsController);
finanzasRouter.use('/operario', operarioController);
finanzasRouter.use('/payments', paymentsController);
finanzasRouter.use('/productividad', productividadController);
finanzasRouter.use('/remuneracion', remuneracionController);
finanzasRouter.use('/tarea', tareaController);
finanzasRouter.use('/treasury', treasuryController);
finanzasRouter.use('/verif-usuario', verifUsuarioController);
