const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const client = await pool.connect();
  const res = await client.query("SELECT pg_get_viewdef('finanzas.v_ficha_cliente_movimientos', true) as def;");
  console.log(res.rows[0].def);
  client.release();
  pool.end();
}
run();
