const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  console.log('Iniciando Seedeo Masivo...');
  
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 0. Monedas
    await client.query(`
      INSERT INTO finanzas.moneda (id_moneda, codigo_moneda, nombre_moneda)
      OVERRIDING SYSTEM VALUE
      VALUES (1, 'CLP', 'Peso Chileno'), (2, 'USD', 'Dólar Americano'), (3, 'EUR', 'Euro')
      ON CONFLICT (id_moneda) DO NOTHING;
    `);

    // 1. Clientes Terreno
    for (let i = 1; i <= 15; i++) {
      const rut = `1${i.toString().padStart(7, '0')}-K`;
      await client.query(`
        INSERT INTO terreno.cliente (
          cliente_cliente_rut, cliente_razon_social, cliente_correo, cliente_telefono,
          cliente_es_cliente_b2b, cliente_es_cliente_b2c
        ) VALUES ($1, $2, $3, $4, true, false)
        ON CONFLICT (cliente_cliente_rut) DO NOTHING;
      `, [rut, `Empresa Comercial ${i} S.A.`, `contacto${i}@empresa.cl`, `+569888877${i.toString().padStart(2, '0')}`]);
    }

    // 2. Inventario
    for (let i = 1; i <= 5; i++) {
      const sku = `MAT-00${i}`;
      await client.query(`
        INSERT INTO inventario.material (material_sku, material_nombre_material)
        VALUES ($1, $2) ON CONFLICT DO NOTHING;
      `, [sku, `Material de Prueba ${i}`]);

      await client.query(`
        INSERT INTO finanzas.historial_precio_material (material_sku, id_moneda, precio_unitario, fecha_vigencia_inicio, estado_precio)
        VALUES ($1, 1, $2, current_date, 'vigente') ON CONFLICT DO NOTHING;
      `, [sku, 50000 * i]);
    }

    // 3. Cliente Financiero y Ficha
    for (let i = 1; i <= 15; i++) {
      const rut = `1${i.toString().padStart(7, '0')}-K`;
      
      const resCf = await client.query(`
        INSERT INTO finanzas.cliente_financiero (rut_cliente, id_tipo_cliente_financiero, nombre_razon_social_referencia)
        VALUES ($1, 1, $2)
        ON CONFLICT (rut_cliente) DO NOTHING
        RETURNING id_cliente_financiero;
      `, [rut, `Empresa Comercial ${i} S.A.`]);

      let id_cliente_financiero = resCf.rows[0]?.id_cliente_financiero;
      
      if (!id_cliente_financiero) {
        const existing = await client.query(`SELECT id_cliente_financiero FROM finanzas.cliente_financiero WHERE rut_cliente = $1`, [rut]);
        id_cliente_financiero = existing.rows[0].id_cliente_financiero;
      }

      await client.query(`
        INSERT INTO finanzas.ficha_cliente (id_cliente_financiero, estado_ficha)
        VALUES ($1, 'activa')
        ON CONFLICT (id_cliente_financiero) DO NOTHING;
      `, [id_cliente_financiero]);
    }

    // 4. Notas de Venta (para 13 clientes)
    let nvCount = 1;
    for (let i = 1; i <= 13; i++) {
      const rut = `1${i.toString().padStart(7, '0')}-K`;
      const resFicha = await client.query(`
        SELECT f.id_ficha_cliente 
        FROM finanzas.ficha_cliente f 
        JOIN finanzas.cliente_financiero c ON f.id_cliente_financiero = c.id_cliente_financiero 
        WHERE c.rut_cliente = $1
      `, [rut]);
      const id_ficha = resFicha.rows[0].id_ficha_cliente;

      const numNotas = Math.floor(Math.random() * 5) + 1; // 1 to 5
      
      for (let j = 0; j < numNotas; j++) {
        const montoNeto = Math.floor(Math.random() * 3000000) + 500000;
        const tieneIva = Math.random() > 0.2;
        const montoTotal = tieneIva ? montoNeto * 1.19 : montoNeto;
        const estado = Math.random() > 0.3 ? 'emitida' : 'anulada';
        const idMoneda = Math.random() > 0.8 ? 2 : 1;
        const tasaCambio = idMoneda === 1 ? 1 : 950;
        
        const nvRes = await client.query(`
          INSERT INTO finanzas.nota_venta (
            id_ficha_cliente, numero_nota_venta, estado_nota_venta,
            id_moneda, tipo_cambio_usado, monto_neto, monto_total, monto_impuesto, fecha_emision
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, current_date)
          RETURNING id_nota_venta;
        `, [
          id_ficha, `NV-2026-${String(nvCount++).padStart(4, '0')}`, estado, idMoneda,
          tasaCambio, montoNeto, montoTotal, tieneIva ? montoNeto * 0.19 : 0
        ]);
        
        const id_nv = nvRes.rows[0].id_nota_venta;

        // Pagos (generar morosidad)
        if (estado === 'emitida') {
            const porcentajePago = Math.random() > 0.4 ? 1 : (Math.random() > 0.5 ? 0.5 : 0);
            const montoPagado = montoTotal * porcentajePago;

            if (montoPagado > 0) {
                await client.query(`
                    INSERT INTO finanzas.pago_cliente (
                        id_ficha_cliente, monto_pago, id_moneda, tipo_cambio_usado, id_medio_pago, fecha_pago
                    ) VALUES ($1, $2, $3, $4, 1, current_date);
                `, [id_ficha, montoPagado, idMoneda, tasaCambio]);
            }
        }
      }
    }

    // 5. Cotizaciones
    let cotCount = 1;
    for (let i = 1; i <= 10; i++) {
        const rut = `1${i.toString().padStart(7, '0')}-K`;
        const resFicha = await client.query(`
            SELECT f.id_ficha_cliente 
            FROM finanzas.ficha_cliente f 
            JOIN finanzas.cliente_financiero c ON f.id_cliente_financiero = c.id_cliente_financiero 
            WHERE c.rut_cliente = $1
        `, [rut]);
        const id_ficha = resFicha.rows[0].id_ficha_cliente;

        const estadoCot = i % 2 === 0 ? 'borrador' : 'aprobada';

        await client.query(`
            INSERT INTO finanzas.cotizacion (
                id_ficha_cliente, estado_cotizacion,
                id_moneda, subtotal_costos_estimados, monto_total_estimado,
                fecha_emision, fecha_vigencia
            ) VALUES ($1, $2, 1, 1500000, 1785000, current_date, current_date + 15)
        `, [id_ficha, estadoCot]);
    }

    await client.query('COMMIT');
    console.log('Seedeo completado con éxito!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante el seedeo:', error);
  } finally {
    client.release();
    pool.end();
  }
}

main();
