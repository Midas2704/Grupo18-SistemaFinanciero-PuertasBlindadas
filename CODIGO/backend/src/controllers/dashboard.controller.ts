import { Router } from 'express';
import { prisma } from '../db';

export const dashboardController = Router();

// GET /api/finanzas/dashboard/stats
dashboardController.get('/stats', async (req, res) => {
  try {
    const clientesActivos = await prisma.ficha_cliente.count({
      where: { estado_ficha: 'activa' }
    });

    const notasVenta = await prisma.nota_venta.aggregate({
      _sum: {
        monto_total: true
      },
      where: {
        estado_nota_venta: {
          in: ['emitida', 'aprobada', 'vigente']
        }
      }
    });
    const ingresosTotales = notasVenta._sum.monto_total ? Number(notasVenta._sum.monto_total) : 0;

    const cotizacionesPendientes = await prisma.cotizacion.count({
      where: {
        estado_cotizacion: {
          in: ['borrador', 'pendiente', 'emitida']
        }
      }
    });

    res.json({
      clientesActivos,
      ingresosTotales,
      cotizacionesPendientes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener estadísticas del dashboard' });
  }
});
