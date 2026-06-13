const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function cleanDB() {
  console.log('Iniciando limpieza de la base de datos...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // TRUNCATE CASCADE will recursively clear all child tables that depend on these
    const tables = [
      'finanzas.nota_venta',
      'finanzas.pago_cliente',
      'finanzas.cotizacion',
      'finanzas.detalle_cotizacion',
      'finanzas.ficha_cliente',
      'finanzas.cliente_financiero',
      'finanzas.historial_precio_material',
      'terreno.cliente',
      'inventario.material',
      'finanzas.moneda',
      'finanzas.tipo_cliente_financiero'
    ];

    for (const table of tables) {
      console.log(`Borrando datos de ${table} con CASCADE...`);
      // Use CASCADE to delete related rows across the schema
      await client.query(`TRUNCATE TABLE ${table} CASCADE;`);
    }

    await client.query('COMMIT');
    console.log('Limpieza completada con éxito.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al limpiar la base de datos:', error);
  } finally {
    client.release();
    pool.end();
  }
}

cleanDB();
