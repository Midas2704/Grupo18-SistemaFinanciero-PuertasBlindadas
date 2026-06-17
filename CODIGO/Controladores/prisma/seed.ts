import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const B2B = [
  { rut: "76.432.123-K", razon: "Constructora Bicentenario", correo: "contacto@constructora.cl", tel: "+56912345678" },
  { rut: "19.876.543-2", razon: "Inmobiliaria Los Andes SPA", correo: "ventas@inmobiliaria.cl", tel: "+56987654321" },
  { rut: "77.555.444-1", razon: "Arquitectura Sur", correo: "proyectos@arquitecturasur.cl", tel: "+56911112222" },
  { rut: "15.222.333-8", razon: "Seguridad Delta", correo: "gerencia@seguridaddelta.cl", tel: "+56933334444" },
  { rut: "78.111.222-3", razon: "Edificios Austral", correo: "contacto@edificiosaustral.cl", tel: "+56955556666" }
];

const B2C = [
  { rut: "18.000.001-K", razon: "Carlos Alberto Rojas", correo: "crojas@gmail.com", tel: "+56911122233" },
  { rut: "18.000.002-8", razon: "María Ignacia Soto", correo: "msoto@hotmail.com", tel: "+56944455566" },
  { rut: "18.000.003-6", razon: "Pedro Pablo Perez", correo: "pperez@yahoo.com", tel: "+56977788899" },
  { rut: "18.000.004-4", razon: "Camila Andrea Silva", correo: "camila.silva@gmail.com", tel: "+56900011122" },
  { rut: "18.000.005-2", razon: "Juan Carlos Tapia", correo: "jctapia@gmail.com", tel: "+56933344455" }
];

const materiales = [
  { nombre: "Plancha Acero Balístico 2mm", costo: 150000 },
  { nombre: "Cerradura Multipunto Keso", costo: 250000 },
  { nombre: "Bisagras Alta Tensión", costo: 45000 },
  { nombre: "Panel MDF Nogal", costo: 85000 }
];

const tipos_productos = [
  "Puerta Normal", 
  "Puerta Strong", 
  "Puerta Semi-strong", 
  "Puerta Bunker", 
  "Puerta Bunker Strong", 
  "Puerta Semi-bunker", 
  "Persiana"
];

async function main() {
  console.log("Iniciando seedeo profesional (TS)...");

  // Limpieza de tablas
  console.log("Limpiando datos existentes...");
  await prisma.asignacion_pago_cliente.deleteMany();
  await prisma.pago_cliente.deleteMany();
  await prisma.documento_tributario.deleteMany();
  await prisma.nota_venta.deleteMany();
  await prisma.detalle_costo_material_cotizacion.deleteMany();
  await prisma.detalle_cotizacion.deleteMany();
  await prisma.cotizacion.deleteMany();
  await prisma.ficha_cliente.deleteMany();
  await prisma.cliente_financiero.deleteMany();

  // 1. Moneda, Tipos de Cliente y Medios de Pago
  await prisma.$executeRawUnsafe(`
    INSERT INTO finanzas.moneda (id_moneda, codigo_moneda, nombre_moneda)
    OVERRIDING SYSTEM VALUE
    VALUES (1, 'CLP', 'Peso Chileno'), (2, 'USD', 'Dólar Americano'), (3, 'EUR', 'Euro')
    ON CONFLICT DO NOTHING;
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO finanzas.tipo_cliente_financiero (id_tipo_cliente_financiero, nombre_tipo_cliente_financiero)
    OVERRIDING SYSTEM VALUE
    VALUES (1, 'Empresa'), (2, 'Persona Natural')
    ON CONFLICT DO NOTHING;
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO finanzas.medio_pago (id_medio_pago, nombre_medio_pago)
    OVERRIDING SYSTEM VALUE
    VALUES (1, 'transferencia'), (2, 'cheque'), (3, 'credito')
    ON CONFLICT DO NOTHING;
  `);

  // Insertar tipos de productos
  for (let i = 0; i < tipos_productos.length; i++) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO terreno.item_comercial (id_item_comercial, nombre_item, descripcion_item, tipo_item)
      OVERRIDING SYSTEM VALUE
      VALUES (${i+1}, $1, $2, 'puerta') ON CONFLICT DO NOTHING;
    `, tipos_productos[i], tipos_productos[i]);
  }

  // 2. Materiales en inventario y finanzas
  const materialsInfo = [];
  for (let i = 0; i < materiales.length; i++) {
    const sku = `MAT-PRO-${i + 1}`;
    
    await prisma.$executeRawUnsafe(`
      INSERT INTO inventario.material (material_sku, material_nombre_material)
      VALUES ($1, $2) ON CONFLICT DO NOTHING;
    `, sku, materiales[i].nombre);

    await prisma.$executeRawUnsafe(`
      INSERT INTO finanzas.historial_precio_material (material_sku, id_moneda, precio_unitario, fecha_vigencia_inicio, estado_precio)
      VALUES ($1, 1, $2, current_date, 'vigente') ON CONFLICT DO NOTHING;
    `, sku, materiales[i].costo);

    const m = await prisma.$queryRawUnsafe<any[]>(`SELECT id_historial_precio_material, precio_unitario FROM finanzas.historial_precio_material WHERE material_sku = $1 LIMIT 1`, sku);
    if(m.length > 0) materialsInfo.push({ id: m[0].id_historial_precio_material, costo: Number(m[0].precio_unitario), nombre: materiales[i].nombre });
  }

  const clientes = [...B2B.map(c => ({...c, isB2b: true})), ...B2C.map(c => ({...c, isB2b: false}))];
  
  const notasVentaTotales: any[] = [];

  for (let i = 0; i < clientes.length; i++) {
    const data = clientes[i];
    const rut = data.rut;

    // Insert en terreno
    await prisma.$executeRawUnsafe(`
      INSERT INTO terreno.cliente (cliente_cliente_rut, cliente_razon_social, cliente_correo, cliente_telefono, cliente_es_cliente_b2b, cliente_es_cliente_b2c)
      VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING;
    `, rut, data.razon, data.correo, data.tel, data.isB2b, !data.isB2b);

    const resCf = await prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO finanzas.cliente_financiero (rut_cliente, id_tipo_cliente_financiero, nombre_razon_social_referencia, correo_financiero, telefono_financiero)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (rut_cliente) DO UPDATE SET 
        nombre_razon_social_referencia = EXCLUDED.nombre_razon_social_referencia,
        correo_financiero = EXCLUDED.correo_financiero,
        telefono_financiero = EXCLUDED.telefono_financiero
      RETURNING id_cliente_financiero;
    `, rut, data.isB2b ? 1 : 2, data.razon, data.correo, data.tel);
    
    let id_cliente_financiero = resCf[0]?.id_cliente_financiero;
    if(!id_cliente_financiero) {
      const existing = await prisma.$queryRawUnsafe<any[]>(`SELECT id_cliente_financiero FROM finanzas.cliente_financiero WHERE rut_cliente = $1`, rut);
      id_cliente_financiero = existing[0].id_cliente_financiero;
    }

    // Ficha
    await prisma.$executeRawUnsafe(`
      INSERT INTO finanzas.ficha_cliente (id_cliente_financiero, estado_ficha)
      VALUES ($1, 'activa') ON CONFLICT DO NOTHING;
    `, id_cliente_financiero);

    const ficha = await prisma.$queryRawUnsafe<any[]>(`SELECT id_ficha_cliente FROM finanzas.ficha_cliente WHERE id_cliente_financiero = $1`, id_cliente_financiero);
    const id_ficha = ficha[0].id_ficha_cliente;

    // Proyectos (1 a 2)
    const numProyectos = Math.floor(Math.random() * 2) + 1;
    for(let p = 0; p < numProyectos; p++) {
        const estOp = Math.random() > 0.5 ? 'activo' : 'terminado';
        const estProd = estOp === 'terminado' ? 'despachado' : 'en_proceso';
        await prisma.$executeRawUnsafe(`
            INSERT INTO terreno.proyecto (rut_cliente, proyecto_nombre_referencia, proyecto_estado_operacional, proyecto_estado_produccion, proyecto_fecha_ingreso)
            VALUES ($1, $2, $3, $4, current_date - (random() * 100)::integer)
        `, rut, `Proyecto ${data.razon.split(' ')[0]} ${p+1}`, estOp, estProd);
    }

    // Cotizaciones (1 a 3)
    const numCotizaciones = Math.floor(Math.random() * 3) + 1;
    for(let c = 0; c < numCotizaciones; c++) {
        const estCot = Math.random() > 0.5 ? 'aprobada' : 'borrador';
        
        let subtotal = 0;
        const matIdx = Math.floor(Math.random() * materialsInfo.length);
        const qty = Math.floor(Math.random() * 3) + 1;
        subtotal = materialsInfo[matIdx].costo * qty;
        
        const totalEstimado = (subtotal / 0.7) * 1.19;

        const resCot = await prisma.$queryRawUnsafe<any[]>(`
            INSERT INTO finanzas.cotizacion (id_ficha_cliente, estado_cotizacion, id_moneda, subtotal_costos_estimados, monto_total_estimado, fecha_emision, fecha_vigencia)
            VALUES ($1, $2, 1, $3, $4, current_date - (random() * 30)::integer, current_date + 15)
            RETURNING id_cotizacion;
        `, id_ficha, estCot, subtotal, totalEstimado);
        
        const id_cot = resCot[0].id_cotizacion;

        const tipoProdIdx = Math.floor(Math.random() * tipos_productos.length);
        await prisma.$executeRawUnsafe(`
            INSERT INTO finanzas.detalle_cotizacion (id_cotizacion, id_item_comercial, descripcion_item_cotizado, cantidad_item, subtotal_item_estimado)
            VALUES ($1, $2, $3, $4, $5)
        `, id_cot, tipoProdIdx + 1, tipos_productos[tipoProdIdx], qty, subtotal);
    }

    // Generar notas de venta con fechas aleatorias para simular estados
    const numNotas = Math.floor(Math.random() * 3) + 1;
    for(let nv = 0; nv < numNotas; nv++) {
        const montoNeto = Math.floor(Math.random() * 2700000) + 800000;
        const montoImpuesto = montoNeto * 0.19;
        const montoTotal = montoNeto + montoImpuesto;
        
        const diasEmision = Math.floor(Math.random() * 90) + 1;
        const diasVencimiento = diasEmision - 45; 
        
        const resNv = await prisma.$queryRawUnsafe<any[]>(`
            INSERT INTO finanzas.nota_venta (id_ficha_cliente, numero_nota_venta, estado_nota_venta, estado_pago, id_moneda, tipo_cambio_usado, monto_neto, monto_total, monto_impuesto, fecha_emision, fecha_vencimiento)
            VALUES ($1, $2, 'emitida', 'pendiente', 1, 1, $3, $4, $5, current_date - $6::integer, current_date - $7::integer)
            RETURNING id_nota_venta;
        `, id_ficha, `NV-${data.rut.split('-')[0]}-${Math.floor(Math.random() * 1000000)}`, montoNeto, montoTotal, montoImpuesto, diasEmision, diasVencimiento);

        const id_nv = resNv[0].id_nota_venta;
        notasVentaTotales.push({
          id_nv,
          id_ficha,
          montoTotal
        });
    }
  }

  // Simular pagos y deudas
  for (let i = 0; i < notasVentaTotales.length; i++) {
    const nv = notasVentaTotales[i];
    
    // Determinamos el escenario según el índice
    let escenario = '';
    const rnd = Math.random();
    if (rnd < 0.3) escenario = 'total';
    else if (rnd < 0.7) escenario = 'parcial';
    else escenario = 'nada';

    if (escenario === 'nada') {
      continue; // Sin pagos
    }

    let saldoPendiente = nv.montoTotal;
    
    let numPagos = 1;
    if (escenario === 'parcial') {
      numPagos = Math.floor(Math.random() * 3) + 1; // 1 a 3 abonos parciales
    } else {
      // Total, puede ser en 1 o 2 pagos
      numPagos = Math.floor(Math.random() * 2) + 1;
    }
    
    for (let p = 0; p < numPagos; p++) {
      if (saldoPendiente <= 0) break;
      
      let montoAbono = 0;
      if (escenario === 'total') {
        if (p === numPagos - 1) montoAbono = saldoPendiente;
        else montoAbono = Math.floor(saldoPendiente / 2);
      } else { // Parcial
        // Pagamos un % de lo que falta, dejando deuda sí o sí al final
        montoAbono = Math.floor(saldoPendiente * (Math.random() * 0.4 + 0.1)); 
      }

      if (montoAbono <= 0) break;
      
      const idMedioPago = Math.floor(Math.random() * 3) + 1;

      const resPago = await prisma.$queryRawUnsafe<any[]>(`
        INSERT INTO finanzas.pago_cliente (id_ficha_cliente, monto_pago, id_moneda, tipo_cambio_usado, id_medio_pago, fecha_pago)
        VALUES ($1, $2, 1, 1, $3, current_date - (random() * 10)::integer)
        RETURNING id_pago_cliente;
      `, nv.id_ficha, montoAbono, idMedioPago);
      
      const id_pago = resPago[0].id_pago_cliente;
      
      await prisma.$executeRawUnsafe(`
        INSERT INTO finanzas.asignacion_pago_cliente (id_pago_cliente, id_nota_venta, monto_asignado)
        VALUES ($1, $2, $3);
      `, id_pago, nv.id_nv, montoAbono);
      
      saldoPendiente -= montoAbono;
    }
    
    // Calcular estado
    let finalEstadoPago = 'pendiente';
    if (saldoPendiente <= 0) finalEstadoPago = 'pagada';
    else if (saldoPendiente < nv.montoTotal) finalEstadoPago = 'parcial';

    await prisma.$executeRawUnsafe(`
      UPDATE finanzas.nota_venta SET estado_pago = $1 WHERE id_nota_venta = $2;
    `, finalEstadoPago, nv.id_nv);
  }

  console.log("Seedeo Profesional TS completado exitosamente.");
}

main().catch(e => {
  console.error("Error en seedeo:", e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
