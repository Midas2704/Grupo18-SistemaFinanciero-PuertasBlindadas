import { Router } from 'express';
import { prisma } from '../db';

export const clientsController = Router();

// a) Listar clientes activos, b) Búsqueda, c) Filtro morosos
clientsController.get('/', async (req, res) => {
  try {
    const { search, deuda, morosos } = req.query;

    let whereClause: any = {
      estado_ficha: 'activa',
    };

    if (search) {
      const searchStr = String(search).toLowerCase();
      whereClause = {
        ...whereClause,
        OR: [
          { rut_cliente: { contains: searchStr } },
          { nombre_razon_social_referencia: { contains: searchStr, mode: 'insensitive' } },
        ],
      };
    }

    let clientesRaw = await prisma.v_ficha_cliente_resumen.findMany({
      where: whereClause,
      select: {
        id_ficha_cliente: true,
        rut_cliente: true,
        nombre_razon_social_referencia: true,
        telefono_financiero: true,
        correo_financiero: true,
        total_notas_venta: true,
        total_pagado_cliente: true,
      },
    });

    let result = clientesRaw.map((c) => {
      const notas = Number(c.total_notas_venta || 0);
      const pagado = Number(c.total_pagado_cliente || 0);
      const saldoDeudor = notas - pagado;
      
      return {
        id_ficha_cliente: c.id_ficha_cliente,
        rut: c.rut_cliente,
        razonSocial: c.nombre_razon_social_referencia,
        telefono: c.telefono_financiero,
        correo: c.correo_financiero,
        saldoDeudor: saldoDeudor > 0 ? saldoDeudor : 0,
        isMoroso: false // Por defecto
      };
    });

    if (deuda === 'true' || morosos === 'true') {
      result = result.filter(c => c.saldoDeudor > 0);
    }

    if (morosos === 'true') {
      // Buscar clientes que tienen facturas vencidas
      const expiredInvoices = await prisma.nota_venta.findMany({
        where: {
          id_ficha_cliente: { in: result.map(c => Number(c.id_ficha_cliente)) },
          estado_pago: { not: 'pagada' },
          fecha_vencimiento: { lt: new Date() }
        },
        select: { id_ficha_cliente: true }
      });
      const morososIds = new Set(expiredInvoices.map(nv => nv.id_ficha_cliente));
      result = result.filter(c => morososIds.has(Number(c.id_ficha_cliente)));
      
      // Actualizar el estado
      result = result.map(c => ({ ...c, isMoroso: true }));
    } else {
      // Mostrar el estado incluso si no se filtra por morosos
      const expiredInvoices = await prisma.nota_venta.findMany({
        where: {
          id_ficha_cliente: { in: result.map(c => Number(c.id_ficha_cliente)) },
          estado_pago: { not: 'pagada' },
          fecha_vencimiento: { lt: new Date() }
        },
        select: { id_ficha_cliente: true }
      });
      const morososIds = new Set(expiredInvoices.map(nv => nv.id_ficha_cliente));
      result = result.map(c => ({ ...c, isMoroso: morososIds.has(Number(c.id_ficha_cliente)) }));
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// d) Obtener la Ficha Financiera
clientsController.get('/:rut/ficha', async (req, res) => {
  try {
    const { rut } = req.params;

    // Obtener datos del resumen
    const resumen = await prisma.v_ficha_cliente_resumen.findFirst({
      where: { rut_cliente: rut },
    });

    if (!resumen) {
      return res.status(404).json({ error: 'Ficha de cliente no encontrada' });
    }

    // Obtener historial de movimientos desde la otra vista
    const movimientos = await prisma.v_ficha_cliente_movimientos.findMany({
      where: { rut_cliente: rut },
      orderBy: { fecha_movimiento: 'desc' },
    });

    const total_ventas = Number(resumen.total_notas_venta || 0);
    const total_pagado = Number(resumen.total_pagado_cliente || 0);
    const total_deuda = total_ventas - total_pagado;
    
    const proyectos = await prisma.proyecto.findMany({ where: { rut_cliente: rut }});
    const proyectos_activos = proyectos.filter(p => p.proyecto_estado_operacional === 'activo').length;
    const proyectos_terminados = proyectos.filter(p => p.proyecto_estado_operacional === 'terminado').length;

    const cotizaciones = await prisma.cotizacion.findMany({
      where: { id_ficha_cliente: Number(resumen.id_ficha_cliente) },
      include: {
        ficha_cliente: { include: { cliente_financiero: true } },
        detalle_cotizacion: {
          include: {
            item_comercial: true,
            detalle_costo_material_cotizacion: {
              include: {
                historial_precio_material: {
                  include: { material: true }
                }
              }
            }
          }
        }
      },
      orderBy: { fecha_emision: 'desc' }
    });

    const notas_venta = await prisma.nota_venta.findMany({
      where: { id_ficha_cliente: Number(resumen.id_ficha_cliente) },
      include: {
        asignacion_pago_cliente: {
          include: { 
            pago_cliente: {
              include: { medio_pago: true }
            } 
          }
        }
      },
      orderBy: { fecha_emision: 'desc' }
    });

    const notas_venta_mapped = notas_venta.map(nv => {
      const totalPagado = nv.asignacion_pago_cliente.reduce((sum: number, asig: any) => sum + Number(asig.monto_asignado), 0);
      const montoTotal = Number(nv.monto_total);
      const saldo = montoTotal - totalPagado;
      
      let estadoVisual = 'EMITIDA';
      if (saldo <= 0) estadoVisual = 'PAGADA';
      else if (saldo > 0 && totalPagado > 0) estadoVisual = 'PARCIAL';
      else if (totalPagado === 0) estadoVisual = 'EMITIDA';

      return {
        ...nv,
        estado_nota_venta: estadoVisual
      };
    });

    const isMoroso = notas_venta_mapped.some(nv => nv.estado_nota_venta !== 'PAGADA' && nv.fecha_vencimiento && new Date(nv.fecha_vencimiento) < new Date());

    res.json({
      resumen: {
        ...resumen,
        saldoDeudor: total_deuda,
        isMoroso
      },
      historial: movimientos,
      resumen_dashboard: {
        total_ventas,
        total_deuda,
        total_pagado,
        proyectos_activos,
        proyectos_terminados,
        cotizaciones,
        notas_venta: notas_venta_mapped
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener ficha' });
  }
});
