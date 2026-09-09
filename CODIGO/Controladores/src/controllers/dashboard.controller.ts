import { Router } from 'express';
import { prisma } from '../db';

export const dashboardController = Router();

// GET /api/finanzas/dashboard/stats
dashboardController.get('/stats', async (req, res) => {
  try {
    const clientesActivos = await prisma.ficha_cliente.count({
      where: { estado_ficha: 'activa' }
    });

    const notasVenta = await prisma.nota_venta.findMany({
      select: { monto_total: true, monto_convertido: true },
      where: {
        estado_nota_venta: {
          in: ['emitida', 'aprobada', 'vigente']
        }
      }
    });
    const ingresosTotales = notasVenta.reduce((acc, nv) => {
      const val = nv.monto_convertido != null ? Number(nv.monto_convertido) : Number(nv.monto_total);
      return acc + val;
    }, 0);

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
