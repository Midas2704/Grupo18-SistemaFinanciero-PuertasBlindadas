const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const clientesReales = [
  // B2B
  { rut: '76111222-3', razonSocial: 'Inmobiliaria Los Andes SPA', correo: 'contacto@losandes.cl', tel: '+56912345671', b2b: true },
  { rut: '76222333-4', razonSocial: 'Constructora Bicentenario', correo: 'operaciones@bicentenario.cl', tel: '+56912345672', b2b: true },
  { rut: '76333444-5', razonSocial: 'Arquitectura y Diseño Sur', correo: 'proyectos@arquisur.cl', tel: '+56912345673', b2b: true },
  { rut: '76444555-6', razonSocial: 'Seguridad Corporativa S.A.', correo: 'ventas@seguridadcorp.cl', tel: '+56912345674', b2b: true },
  { rut: '76555666-7', razonSocial: 'Gestión Inmobiliaria Norte', correo: 'gerencia@gestionnorte.cl', tel: '+56912345675', b2b: true },
  { rut: '76666777-8', razonSocial: 'Constructora Pacífico', correo: 'finanzas@pacificoconstructora.cl', tel: '+56912345676', b2b: true },
  { rut: '76777888-9', razonSocial: 'Diseño de Interiores Zen', correo: 'contacto@zeninteriores.cl', tel: '+56912345677', b2b: true },
  { rut: '76888999-0', razonSocial: 'Edificios Inteligentes LTDA', correo: 'proyectos@edificiosint.cl', tel: '+56912345678', b2b: true },
  { rut: '76999000-1', razonSocial: 'Inversiones Patrimoniales', correo: 'inversiones@patrimoniales.cl', tel: '+56912345679', b2b: true },
  { rut: '76000111-2', razonSocial: 'Mantención Industrial ABC', correo: 'servicios@abcindustrial.cl', tel: '+56912345680', b2b: true },
  // B2C
  { rut: '15111222-K', razonSocial: 'Carlos Alberto Rojas', correo: 'carlos.rojas@gmail.com', tel: '+56988881111', b2b: false },
  { rut: '16222333-1', razonSocial: 'María Ignacia Soto', correo: 'maria.soto99@hotmail.com', tel: '+56988882222', b2b: false },
  { rut: '17333444-2', razonSocial: 'Juan Pablo Pérez', correo: 'jp.perez@yahoo.com', tel: '+56988883333', b2b: false },
  { rut: '18444555-3', razonSocial: 'Camila Andrea Silva', correo: 'cami.silva.arq@gmail.com', tel: '+56988884444', b2b: false },
  { rut: '19555666-4', razonSocial: 'Felipe Ignacio Gómez', correo: 'felipe.gomez@empresa.com', tel: '+56988885555', b2b: false },
];

const materialesReales = [
  { sku: 'MAT-PB-001', nombre: 'Plancha de Acero Balístico 2mm', costo: 150000 },
  { sku: 'MAT-PB-002', nombre: 'Cerradura Multipunto Keso', costo: 250000 },
  { sku: 'MAT-PB-003', nombre: 'Bisagras de Seguridad con Rodamiento', costo: 45000 },
  { sku: 'MAT-PB-004', nombre: 'Panel MDF Nogal', costo: 85000 },
  { sku: 'MAT-PB-005', nombre: 'Aislante Acústico Lana de Roca', costo: 35000 },
];

async function main() {
  console.log('Iniciando Seedeo Realista V2...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 0. Monedas y Tipos de Cliente
    await client.query(`
      INSERT INTO finanzas.moneda (id_moneda, codigo_moneda, nombre_moneda)
      OVERRIDING SYSTEM VALUE
      VALUES (1, 'CLP', 'Peso Chileno'), (2, 'USD', 'Dólar Americano'), (3, 'EUR', 'Euro')
      ON CONFLICT (id_moneda) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO finanzas.tipo_cliente_financiero (id_tipo_cliente_financiero, nombre_tipo_cliente_financiero)
      OVERRIDING SYSTEM VALUE
      VALUES (1, 'Empresa'), (2, 'Persona Natural')
      ON CONFLICT (id_tipo_cliente_financiero) DO NOTHING;
    `);

    // 1. Clientes Terreno
    for (const c of clientesReales) {
      await client.query(`
        INSERT INTO terreno.cliente (
          cliente_cliente_rut, cliente_razon_social, cliente_correo, cliente_telefono,
          cliente_es_cliente_b2b, cliente_es_cliente_b2c
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (cliente_cliente_rut) DO UPDATE SET 
          cliente_razon_social = EXCLUDED.cliente_razon_social,
          cliente_correo = EXCLUDED.cliente_correo;
      `, [c.rut, c.razonSocial, c.correo, c.tel, c.b2b, !c.b2b]);
    }

    // 2. Inventario
    for (const m of materialesReales) {
      await client.query(`
        INSERT INTO inventario.material (material_sku, material_nombre_material)
        VALUES ($1, $2) ON CONFLICT (material_sku) DO NOTHING;
      `, [m.sku, m.nombre]);

      await client.query(`
        INSERT INTO finanzas.historial_precio_material (material_sku, id_moneda, precio_unitario, fecha_vigencia_inicio, estado_precio)
        VALUES ($1, 1, $2, current_date, 'vigente') ON CONFLICT DO NOTHING;
      `, [m.sku, m.costo]);
    }

    // 3. Cliente Financiero y Ficha
    for (const c of clientesReales) {
      const idTipo = c.b2b ? 1 : 2; // 1: Empresa, 2: Persona Natural
      
      const resCf = await client.query(`
        INSERT INTO finanzas.cliente_financiero (rut_cliente, id_tipo_cliente_financiero, nombre_razon_social_referencia)
        VALUES ($1, $2, $3)
        ON CONFLICT (rut_cliente) DO UPDATE SET nombre_razon_social_referencia = EXCLUDED.nombre_razon_social_referencia
        RETURNING id_cliente_financiero;
      `, [c.rut, idTipo, c.razonSocial]);

      let id_cliente_financiero = resCf.rows[0]?.id_cliente_financiero;
      
      if (!id_cliente_financiero) {
        const existing = await client.query(`SELECT id_cliente_financiero FROM finanzas.cliente_financiero WHERE rut_cliente = $1`, [c.rut]);
        id_cliente_financiero = existing.rows[0].id_cliente_financiero;
      }

      await client.query(`
        INSERT INTO finanzas.ficha_cliente (id_cliente_financiero, estado_ficha)
        VALUES ($1, 'activa')
        ON CONFLICT (id_cliente_financiero) DO NOTHING;
      `, [id_cliente_financiero]);
    }

    // 4. Notas de Venta y Morosidad (para los primeros 13 clientes)
    let nvCount = 100;
    for (let i = 0; i < 13; i++) {
      const c = clientesReales[i];
      const resFicha = await client.query(`
        SELECT f.id_ficha_cliente 
        FROM finanzas.ficha_cliente f 
        JOIN finanzas.cliente_financiero cf ON f.id_cliente_financiero = cf.id_cliente_financiero 
        WHERE cf.rut_cliente = $1
      `, [c.rut]);
      const id_ficha = resFicha.rows[0].id_ficha_cliente;

      const numNotas = Math.floor(Math.random() * 5) + 1; // 1 to 5
      
      for (let j = 0; j < numNotas; j++) {
        // Montos entre 500k y 3.5M
        const montoNeto = Math.floor(Math.random() * 3000000) + 500000;
        const tieneIva = Math.random() > 0.2;
        const montoImpuesto = tieneIva ? montoNeto * 0.19 : 0;
        const montoTotal = montoNeto + montoImpuesto;
        
        const estado = Math.random() > 0.15 ? 'emitida' : 'anulada'; // 85% emitidas, 15% anuladas
        const idMoneda = Math.random() > 0.85 ? 2 : 1; // 15% en USD
        const tasaCambio = idMoneda === 1 ? 1 : (Math.floor(Math.random() * 100) + 850); // 850 a 950 CLP/USD
        
        const nvRes = await client.query(`
          INSERT INTO finanzas.nota_venta (
            id_ficha_cliente, numero_nota_venta, estado_nota_venta,
            id_moneda, tipo_cambio_usado, monto_neto, monto_total, monto_impuesto, fecha_emision
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, current_date - (random() * 90)::integer)
          RETURNING id_nota_venta;
        `, [
          id_ficha, `NV-REAL-${String(nvCount++).padStart(4, '0')}`, estado, idMoneda,
          tasaCambio, montoNeto, montoTotal, montoImpuesto
        ]);
        
        const id_nv = nvRes.rows[0].id_nota_venta;

        // Pagos para generar morosidad
        if (estado === 'emitida') {
            const perfilPago = Math.random();
            let porcentajePago = 0;
            
            if (perfilPago > 0.6) {
              porcentajePago = 1; // 40% pagan todo
            } else if (perfilPago > 0.3) {
              porcentajePago = Math.random() * 0.8 + 0.1; // 30% pago parcial (10% a 90%)
            } else {
              porcentajePago = 0; // 30% no pagan nada (deuda total)
            }

            const montoPagado = montoTotal * porcentajePago;

            if (montoPagado > 0) {
                await client.query(`
                    INSERT INTO finanzas.pago_cliente (
                        id_ficha_cliente, monto_pago, id_moneda, tipo_cambio_usado, id_medio_pago, fecha_pago
                    ) VALUES ($1, $2, $3, $4, 1, current_date - (random() * 30)::integer);
                `, [id_ficha, montoPagado, idMoneda, tasaCambio]);
            }
        }
      }
    }

    // 5. Cotizaciones
    let cotCount = 100;
    for (let i = 0; i < 10; i++) {
        const c = clientesReales[i];
        const resFicha = await client.query(`
            SELECT f.id_ficha_cliente 
            FROM finanzas.ficha_cliente f 
            JOIN finanzas.cliente_financiero cf ON f.id_cliente_financiero = cf.id_cliente_financiero 
            WHERE cf.rut_cliente = $1
        `, [c.rut]);
        const id_ficha = resFicha.rows[0].id_ficha_cliente;

        // "borrador", "aprobada", "rechazada" - asumiendo "borrador" y "aprobada"
        const estadosPosibles = ['borrador', 'aprobada', 'borrador'];
        const estadoCot = estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)];

        // Generar monto estimado con materiales reales
        let subtotalCostos = 0;
        const matUsados = Math.floor(Math.random() * 3) + 2; // 2 a 4 materiales
        for(let k=0; k<matUsados; k++) {
          subtotalCostos += materialesReales[k].costo * (Math.floor(Math.random() * 3) + 1);
        }
        const totalEstimado = (subtotalCostos / 0.7) * 1.19; // 30% margen e IVA

        await client.query(`
            INSERT INTO finanzas.cotizacion (
                id_ficha_cliente, estado_cotizacion,
                id_moneda, subtotal_costos_estimados, monto_total_estimado,
                fecha_emision, fecha_vigencia
            ) VALUES ($1, $2, 1, $3, $4, current_date - (random() * 15)::integer, current_date + 15)
        `, [id_ficha, estadoCot, subtotalCostos, totalEstimado]);
    }

    await client.query('COMMIT');
    console.log('Seedeo Realista Completado con Éxito!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante el seedeo:', error);
  } finally {
    client.release();
    pool.end();
  }
}

main();
