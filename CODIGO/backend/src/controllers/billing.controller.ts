import { Router } from 'express';
import { prisma } from '../db';

export const billingController = Router();

// 1. (RF06) Listar catálogo de inventario (solo lectura)
billingController.get('/inventory', async (req, res) => {
  try {
    const inventario = await prisma.historial_precio_material.findMany({
      where: { estado_precio: 'vigente' },
      include: {
        material: true,
      },
    });

    const result = inventario.map(item => ({
      id_historial_precio_material: item.id_historial_precio_material,
      sku: item.material_sku,
      nombre: item.material?.material_nombre_material || 'Material sin nombre',
      precio_unitario: Number(item.precio_unitario),
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// Traer tipos de productos (item_comercial)
billingController.get('/products', async (req, res) => {
  try {
    const items = await prisma.item_comercial.findMany({
      where: { estado_item: 'activo' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// 2. (RF05, RF07, RF08, RF09, RF10) Crear Cotización
billingController.post('/quotes', async (req, res) => {
  try {
    const { rut_cliente, fecha_vigencia, margen_esperado, productos, descuento_tipo, descuento_valor, id_moneda, exento_iva, userRole } = req.body;

    if (!rut_cliente) return res.status(400).json({ error: 'RUT de cliente es obligatorio' });
    if (!productos || productos.length === 0) return res.status(400).json({ error: 'Debe incluir al menos un producto' });

    const vigenciaDate = new Date(fecha_vigencia);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (vigenciaDate <= hoy) return res.status(400).json({ error: 'La fecha de vigencia debe ser mayor a hoy' });

    // Buscar ficha del cliente (se asume que si ingresan RUT, lo buscamos)
    let ficha = await prisma.ficha_cliente.findFirst({
      where: { cliente_financiero: { rut_cliente } },
    });

    // Si no existe ficha, la creamos asumiendo un cliente existente
    if (!ficha) {
      const clienteFin = await prisma.cliente_financiero.findFirst({ where: { rut_cliente } });
      if (!clienteFin) return res.status(404).json({ error: 'Cliente financiero no encontrado para ese RUT' });
      ficha = await prisma.ficha_cliente.create({
        data: { id_cliente_financiero: clienteFin.id_cliente_financiero, estado_ficha: 'activa' }
      });
    }

    let subtotal_costos_global = 0;
    const detallesCotizacionData: any[] = [];

    // Obtener un item_comercial generico, si no existe lo creamos para usar como fallback
    let itemGenerico = await prisma.item_comercial.findFirst();
    if (!itemGenerico) {
      itemGenerico = await prisma.item_comercial.create({
        data: { nombre_item: 'Producto Genérico', estado_item: 'activo' }
      });
    }

    const margenDecimal = Number(margen_esperado) / 100;

    // Iterar por cada producto
    for (const prod of productos) {
      let subtotal_costos_prod = 0;
      const detallesMateriales: any[] = [];

      for (const mat of prod.materiales) {
        const historial = await prisma.historial_precio_material.findUnique({
          where: { id_historial_precio_material: mat.id_historial_precio_material }
        });
        if (!historial) throw new Error(`Material ${mat.id_historial_precio_material} no encontrado`);
        
        const cantidad = Number(mat.cantidad);
        const precio = Number(historial.precio_unitario);
        const subtotal = cantidad * precio;
        subtotal_costos_prod += subtotal;

        detallesMateriales.push({
          id_historial_precio_material: historial.id_historial_precio_material,
          cantidad_material_estimada: cantidad,
          precio_unitario_usado: precio,
          subtotal_material_estimado: subtotal,
        });
      }

      subtotal_costos_global += subtotal_costos_prod;
      const precio_sugerido_prod = margenDecimal < 1 ? subtotal_costos_prod / (1 - margenDecimal) : 0;

      // Parse medidas: el frontend manda algo como "120x80x5"
      const medidasStr = prod.medidas || '0x0x0';
      const medidasParts = String(medidasStr).split(/[xX]/).map(s => Number(s.trim()) || 0);
      const altoParsed = medidasParts[0] || 0;
      const anchoParsed = medidasParts[1] || 0;
      const espesorParsed = medidasParts[2] || 0;

      const descItem = `${prod.tipo_producto || 'Producto'} ${medidasStr ? `(${medidasStr})` : ''}`.trim();

      detallesCotizacionData.push({
        id_item_comercial: itemGenerico.id_item_comercial,
        cantidad_item: 1,
        descripcion_item_cotizado: descItem,
        medida_alto_referencial: altoParsed,
        medida_ancho_referencial: anchoParsed,
        medida_espesor_referencial: espesorParsed,
        subtotal_item_estimado: precio_sugerido_prod,
        detalle_costo_material_cotizacion: {
          create: detallesMateriales,
        }
      });
    }

    const precio_sugerido_global = margenDecimal < 1 ? subtotal_costos_global / (1 - margenDecimal) : 0;

    let desc_val = Number(descuento_valor) || 0;
    if (descuento_tipo === 'porcentaje' && desc_val > 100) return res.status(400).json({ error: 'Descuento porcentual excede el 100%' });
    if (descuento_tipo === 'monto_fijo' && desc_val > precio_sugerido_global) return res.status(400).json({ error: 'Descuento fijo excede el precio sugerido' });

    let base_imponible = precio_sugerido_global;
    if (descuento_tipo === 'porcentaje') {
      base_imponible = base_imponible * (1 - (desc_val / 100));
    } else if (descuento_tipo === 'monto_fijo') {
      base_imponible = base_imponible - desc_val;
    }
    
    if (base_imponible < 0) base_imponible = 0;
    
    const iva = exento_iva ? 0 : base_imponible * 0.19;
    const monto_total_final = base_imponible + iva;

    const obsText = `IVA: ${exento_iva ? 'Exento' : iva.toFixed(2)} | Descuento: ${desc_val} ${descuento_tipo}`;

    let estadoCot = 'borrador';
    if (userRole === 'Secretaria') {
      estadoCot = 'borrador'; // 'borrador' instead of 'pendiente_aprobacion'
    } else {
      estadoCot = 'aprobada';
    }

    // Crear la cotización en DB en una transacción
    const nuevaCotizacion = await prisma.$transaction(async (tx) => {
      const cot = await tx.cotizacion.create({
        data: {
          id_ficha_cliente: ficha.id_ficha_cliente,
          id_moneda: Number(id_moneda) || 1,
          fecha_emision: new Date(),
          fecha_vigencia: vigenciaDate,
          subtotal_costos_estimados: subtotal_costos_global,
          margen_esperado: margen_esperado,
          precio_sugerido: precio_sugerido_global,
          monto_total_estimado: monto_total_final,
          estado_cotizacion: estadoCot,
          observacion: obsText,
          detalle_cotizacion: {
            create: detallesCotizacionData
          }
        }
      });
      return cot;
    });

    res.json(nuevaCotizacion);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: 'Error al generar la cotización: Datos inválidos o restricción de estado.' });
  }
});

// 3. (RF11, RF12) Bandeja de Aprobación
billingController.get('/pending-approvals', async (req, res) => {
  try {
    const cotizaciones = await prisma.cotizacion.findMany({
      where: { estado_cotizacion: 'borrador' },
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
      }
    });

    // En nota_venta, 'emitida' significa que está en la bandeja (no confirmada)
    // Se requiere que no tenga folios (documento_tributario) asignados aún para considerarse pendiente de gestión.
    const notas_venta = await prisma.nota_venta.findMany({
      where: {
        estado_nota_venta: 'emitida',
        documento_tributario: { none: {} },
        observacion: 'PENDIENTE_APROBACION'
      },
      include: { ficha_cliente: { include: { cliente_financiero: true } } }
    });

    res.json({ cotizaciones, notas_venta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching pending approvals' });
  }
});

billingController.get('/history', async (req, res) => {
  try {
    // Cotizaciones: 'aprobada' o 'anulada' o 'rechazada'
    const cotizaciones = await prisma.cotizacion.findMany({
      where: { estado_cotizacion: { in: ['aprobada', 'anulada', 'rechazada'] } },
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
      orderBy: { fecha_emision: 'desc' },
      take: 50
    });
    console.log(`History Cotizaciones Fetched: ${cotizaciones.length}`);

    // Notas de venta: 'confirmada' (aprobada), 'anulada', 'cerrada'
    const notas_venta = await prisma.nota_venta.findMany({
      where: { estado_nota_venta: { in: ['confirmada', 'anulada', 'cerrada'] } },
      include: { 
        ficha_cliente: { include: { cliente_financiero: true } },
        asignacion_pago_cliente: {
          include: { 
            pago_cliente: {
              include: { medio_pago: true }
            } 
          }
        }
      },
      orderBy: { fecha_emision: 'desc' },
      take: 50
    });
    console.log(`History Notas de Venta Fetched: ${notas_venta.length}`);

    res.json({ cotizaciones, notas_venta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching history' });
  }
});

// Aprobar y Convertir a Nota de Venta (o aprobar NV directa)
billingController.post('/quotes/:id/approve', async (req, res) => {
  try {
    const id_cotizacion = parseInt(req.params.id);

    const { plazo_pago } = req.body;

    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id_cotizacion }
    });

    if (!cotizacion) return res.status(404).json({ error: 'Cotización no encontrada' });
    if (cotizacion.estado_cotizacion === 'aprobada') return res.status(400).json({ error: 'Cotización ya aprobada' });

    await prisma.$transaction(async (tx) => {
      // Aprobar cotización
      await tx.cotizacion.update({
        where: { id_cotizacion },
        data: { estado_cotizacion: 'aprobada' }
      });

      // Crear nota de venta (RF12)
      const neto = Number(cotizacion.monto_total_estimado || 0);
      const impuesto = neto * 0.19;
      const total = neto + impuesto;

      let fechaVencimiento = new Date();
      if (plazo_pago) {
        fechaVencimiento.setDate(fechaVencimiento.getDate() + Number(plazo_pago));
      } else {
        fechaVencimiento.setDate(fechaVencimiento.getDate() + 30); // default
      }

      await tx.nota_venta.create({
        data: {
          id_ficha_cliente: cotizacion.id_ficha_cliente,
          id_cotizacion: cotizacion.id_cotizacion,
          id_moneda: cotizacion.id_moneda,
          numero_nota_venta: `NV-${Date.now()}`,
          fecha_emision: new Date(),
          fecha_vencimiento: fechaVencimiento,
          monto_neto: neto,
          monto_impuesto: impuesto,
          monto_total: total,
          estado_nota_venta: 'emitida',
          estado_pago: 'pendiente',
        }
      });
    });

    res.json({ message: 'Cotización aprobada y Nota de Venta generada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al aprobar cotización' });
  }
});

// Editar Cotizacion
billingController.put('/quotes/:id', async (req, res) => {
  try {
    const id_cotizacion = parseInt(req.params.id);
    const { 
      margen_esperado, observacion, 
      medidas, // legacy string
      medida_alto_referencial, medida_ancho_referencial, medida_espesor_referencial,
      id_item_comercial, materiales
    } = req.body;

    const data: any = {};
    if (margen_esperado !== undefined) data.margen_esperado = Number(margen_esperado);
    if (observacion !== undefined) data.observacion = observacion;

    if (Object.keys(data).length > 0) {
      await prisma.cotizacion.update({
        where: { id_cotizacion },
        data
      });
    }

    const detalle = await prisma.detalle_cotizacion.findFirst({ where: { id_cotizacion } });
    if (detalle) {
      const updateData: any = {};
      if (medidas !== undefined) updateData.descripcion_item_cotizado = String(medidas);
      if (medida_alto_referencial !== undefined) updateData.medida_alto_referencial = Number(medida_alto_referencial);
      if (medida_ancho_referencial !== undefined) updateData.medida_ancho_referencial = Number(medida_ancho_referencial);
      if (medida_espesor_referencial !== undefined) updateData.medida_espesor_referencial = Number(medida_espesor_referencial);
      if (id_item_comercial !== undefined) updateData.id_item_comercial = Number(id_item_comercial);

      if (Object.keys(updateData).length > 0) {
        await prisma.detalle_cotizacion.update({
          where: { id_detalle_cotizacion: detalle.id_detalle_cotizacion },
          data: updateData
        });
      }

      if (Array.isArray(materiales)) {
        for (const mat of materiales) {
          if (mat.id_detalle_costo_material_cotizacion) {
            await prisma.detalle_costo_material_cotizacion.update({
              where: { id_detalle_costo_material_cotizacion: mat.id_detalle_costo_material_cotizacion },
              data: {
                cantidad_material_estimada: Number(mat.cantidad),
                precio_unitario_usado: Number(mat.precio),
                subtotal_material_estimado: Number(mat.cantidad) * Number(mat.precio)
              }
            });
          }
        }
      }
    }

    res.json({ message: 'Cotización actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cotizacion' });
  }
});

// Aprobar Nota de Venta Directa
billingController.post('/nota-venta/:id/approve', async (req, res) => {
  try {
    const id_nota_venta = parseInt(req.params.id);
    const nv = await prisma.nota_venta.findUnique({ where: { id_nota_venta } });
    if (!nv) return res.status(404).json({ error: 'Nota de venta no encontrada' });
    
    await prisma.nota_venta.update({
      where: { id_nota_venta },
      data: { estado_nota_venta: 'confirmada' }
    });
    res.json({ message: 'Nota de Venta aprobada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al aprobar nota de venta' });
  }
});

// Rechazar Cotizacion
billingController.post('/quotes/:id/reject', async (req, res) => {
  try {
    const id_cotizacion = parseInt(req.params.id);
    await prisma.cotizacion.update({
      where: { id_cotizacion },
      data: { estado_cotizacion: 'rechazada' }
    });
    res.json({ message: 'Cotización rechazada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar cotizacion' });
  }
});

// Rechazar Nota de Venta
billingController.post('/nota-venta/:id/reject', async (req, res) => {
  try {
    const id_nota_venta = parseInt(req.params.id);
    await prisma.nota_venta.update({
      where: { id_nota_venta },
      data: { estado_nota_venta: 'anulada' }
    });
    res.json({ message: 'Nota de Venta rechazada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al rechazar nota de venta' });
  }
});

// Obtener tipo de cambio
billingController.get('/exchange-rate/:currency', async (req, res) => {
  try {
    const { currency } = req.params;
    let rate = 1;
    const targetIndicator = currency.toLowerCase() === 'usd' ? 'dolar' : (currency.toLowerCase() === 'eur' ? 'euro' : null);

    if (targetIndicator) {
      try {
        const response = await fetch(`https://mindicador.cl/api/${targetIndicator}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.serie && data.serie.length > 0) {
            rate = data.serie[0].valor;
          }
        } else {
          throw new Error('API request failed');
        }
      } catch (err) {
        // Fallback en caso de que la API falle
        console.error('Error fetching mindicador.cl API, using fallback', err);
        rate = currency.toLowerCase() === 'usd' ? 950.5 : 1050.2;
      }
    }
    
    res.json({ currency: currency.toUpperCase(), rate });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching exchange rate' });
  }
});

// Crear Nota de Venta Directa
billingController.post('/nota-venta', async (req, res) => {
  try {
    const { id_cliente, monto_neto, moneda, tasa_cambio, exento_iva, descuento, userRole } = req.body;

    if (!id_cliente || !monto_neto) return res.status(400).json({ error: 'Faltan campos obligatorios' });

    // Validar rol (RF20)
    let estadoNV = 'emitida';
    if (userRole === 'Gerente') {
      estadoNV = 'confirmada';
    }

    const netoBase = Number(monto_neto);
    const tasa = Number(tasa_cambio) || 1;
    let netoCLP = netoBase * tasa;

    let montoDescuento = 0;
    if (descuento && descuento.valor > 0) {
      if (descuento.tipo === 'porcentaje') {
        if (descuento.valor > 100) return res.status(400).json({ error: 'Descuento porcentual excede el 100%' });
        montoDescuento = netoCLP * (Number(descuento.valor) / 100);
      } else {
        if (descuento.valor > netoCLP) return res.status(400).json({ error: 'Descuento fijo excede el monto neto' });
        montoDescuento = Number(descuento.valor) * tasa;
      }
    }

    const netoConDescuento = netoCLP - montoDescuento;
    const impuesto = exento_iva ? 0 : netoConDescuento * 0.19;
    const total = netoConDescuento + impuesto;

    let monedaDb = await prisma.moneda.findFirst({ where: { codigo_moneda: moneda?.toUpperCase() || 'CLP' } });
    if (!monedaDb) {
      monedaDb = await prisma.moneda.findFirst({ where: { codigo_moneda: 'CLP' } });
    }

    const ficha = await prisma.ficha_cliente.findUnique({
      where: { id_ficha_cliente: Number(id_cliente) }
    });
    if (!ficha) return res.status(404).json({ error: 'Ficha de cliente no encontrada' });

    const nv = await prisma.nota_venta.create({
      data: {
        id_ficha_cliente: ficha.id_ficha_cliente,
        id_moneda: monedaDb!.id_moneda,
        numero_nota_venta: `NVD-${Date.now()}`,
        fecha_emision: new Date(),
        monto_neto: netoCLP,
        descuento_aplicado: montoDescuento,
        monto_impuesto: impuesto,
        monto_total: total,
        tipo_cambio_usado: tasa,
        estado_nota_venta: estadoNV,
        estado_pago: 'pendiente',
        observacion: (userRole === 'Secretaria' && montoDescuento > 0) ? 'PENDIENTE_APROBACION' : null
      }
    });

    res.json(nv);
  } catch (error: any) {
    console.error('ERROR EN NOTA VENTA:', error);
    res.status(400).json({ error: 'Error al emitir nota de venta: Datos inválidos o restricción de estado.', details: error.message });
  }
});

// Agregar folios a documento
billingController.put('/nota-venta/:id/folios', async (req, res) => {
  try {
    const id_nota_venta = parseInt(req.params.id);
    const { guias_despacho, facturas } = req.body;

    const nv = await prisma.nota_venta.findUnique({ where: { id_nota_venta }});
    if (!nv) return res.status(404).json({ error: 'Nota de venta no encontrada' });

    let tipoFactura = await prisma.tipo_documento.findFirst({ where: { nombre_tipo_documento: 'Factura Electrónica' } });
    if (!tipoFactura) {
      tipoFactura = await prisma.tipo_documento.create({ data: { nombre_tipo_documento: 'Factura Electrónica', codigo_sii: '33', aplica_impuesto: true, estado_tipo: 'activo' }});
    }

    for (const folio of (facturas || [])) {
      await prisma.documento_tributario.create({
        data: {
          id_ficha_cliente: nv.id_ficha_cliente,
          id_nota_venta: nv.id_nota_venta,
          id_tipo_documento: tipoFactura.id_tipo_documento,
          id_moneda: nv.id_moneda,
          folio_documento: folio,
          fecha_emision: new Date(),
          estado_documento: 'emitido'
        }
      });
    }

    res.json({ message: 'Folios agregados correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar folios' });
  }
});

// Anular Nota de Venta
billingController.post('/nota-venta/:id/anular', async (req, res) => {
  try {
    const id_nota_venta = parseInt(req.params.id);
    const { folio_nota_credito } = req.body;

    const tipoFactura = await prisma.tipo_documento.findFirst({ where: { nombre_tipo_documento: 'Factura Electrónica' } });
    
    if (tipoFactura) {
      const facturas = await prisma.documento_tributario.findMany({
        where: { id_nota_venta, id_tipo_documento: tipoFactura.id_tipo_documento }
      });

      if (facturas.length > 0 && !folio_nota_credito) {
        return res.status(400).json({ error: 'Debe ingresar el folio de la Nota de Crédito para anular una NV con facturas' });
      }
    }

    const nv = await prisma.nota_venta.update({
      where: { id_nota_venta },
      data: {
        estado_nota_venta: 'anulada',
        monto_neto: 0,
        monto_impuesto: 0,
        monto_total: 0,
        descuento_aplicado: 0,
        fecha_anulacion: new Date(),
        motivo_anulacion: folio_nota_credito ? `Nota de Crédito: ${folio_nota_credito}` : 'Anulación directa'
      }
    });

    res.json({ message: 'Nota de venta anulada', nota: nv });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al anular Nota de Venta' });
  }
});
