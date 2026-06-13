"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
BigInt.prototype.toJSON = function () {
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
async function main() {
    console.log("Iniciando seedeo profesional (TS)...");
    // 1. Moneda y Tipos de Cliente
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
        const m = await prisma.$queryRawUnsafe(`SELECT id_historial_precio_material, precio_unitario FROM finanzas.historial_precio_material WHERE material_sku = $1 LIMIT 1`, sku);
        if (m.length > 0)
            materialsInfo.push({ id: m[0].id_historial_precio_material, costo: Number(m[0].precio_unitario), nombre: materiales[i].nombre });
    }
    const clientes = [...B2B.map(c => ({ ...c, isB2b: true })), ...B2C.map(c => ({ ...c, isB2b: false }))];
    for (let i = 0; i < clientes.length; i++) {
        const data = clientes[i];
        const rut = data.rut;
        // Insert en terreno
        await prisma.$executeRawUnsafe(`
      INSERT INTO terreno.cliente (cliente_cliente_rut, cliente_razon_social, cliente_correo, cliente_telefono, cliente_es_cliente_b2b, cliente_es_cliente_b2c)
      VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING;
    `, rut, data.razon, data.correo, data.tel, data.isB2b, !data.isB2b);
        // Finanzas cliente: HERE IS WHERE WE INSERT CORREO AND TELEFONO SO IT SHOWS IN THE VIEW
        const resCf = await prisma.$queryRawUnsafe(`
      INSERT INTO finanzas.cliente_financiero (rut_cliente, id_tipo_cliente_financiero, nombre_razon_social_referencia, correo_financiero, telefono_financiero)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (rut_cliente) DO UPDATE SET 
        nombre_razon_social_referencia = EXCLUDED.nombre_razon_social_referencia,
        correo_financiero = EXCLUDED.correo_financiero,
        telefono_financiero = EXCLUDED.telefono_financiero
      RETURNING id_cliente_financiero;
    `, rut, data.isB2b ? 1 : 2, data.razon, data.correo, data.tel);
        let id_cliente_financiero = resCf[0]?.id_cliente_financiero;
        if (!id_cliente_financiero) {
            const existing = await prisma.$queryRawUnsafe(`SELECT id_cliente_financiero FROM finanzas.cliente_financiero WHERE rut_cliente = $1`, rut);
            id_cliente_financiero = existing[0].id_cliente_financiero;
        }
        // Ficha
        await prisma.$executeRawUnsafe(`
      INSERT INTO finanzas.ficha_cliente (id_cliente_financiero, estado_ficha)
      VALUES ($1, 'activa') ON CONFLICT DO NOTHING;
    `, id_cliente_financiero);
        const ficha = await prisma.$queryRawUnsafe(`SELECT id_ficha_cliente FROM finanzas.ficha_cliente WHERE id_cliente_financiero = $1`, id_cliente_financiero);
        const id_ficha = ficha[0].id_ficha_cliente;
        // Proyectos (1 a 2)
        const numProyectos = Math.floor(Math.random() * 2) + 1;
        for (let p = 0; p < numProyectos; p++) {
            const estOp = Math.random() > 0.5 ? 'activo' : 'terminado';
            const estProd = estOp === 'terminado' ? 'despachado' : 'en_proceso';
            await prisma.$executeRawUnsafe(`
            INSERT INTO terreno.proyecto (rut_cliente, proyecto_nombre_referencia, proyecto_estado_operacional, proyecto_estado_produccion, proyecto_fecha_ingreso)
            VALUES ($1, $2, $3, $4, current_date - (random() * 100)::integer)
        `, rut, `Proyecto ${data.razon.split(' ')[0]} ${p + 1}`, estOp, estProd);
        }
        // Cotizaciones (1 a 3)
        const numCotizaciones = Math.floor(Math.random() * 3) + 1;
        for (let c = 0; c < numCotizaciones; c++) {
            const estCot = Math.random() > 0.5 ? 'aprobada' : 'borrador';
            let subtotal = 0;
            const matIdx = Math.floor(Math.random() * materialsInfo.length);
            const qty = Math.floor(Math.random() * 3) + 1;
            subtotal = materialsInfo[matIdx].costo * qty;
            const totalEstimado = (subtotal / 0.7) * 1.19;
            const resCot = await prisma.$queryRawUnsafe(`
            INSERT INTO finanzas.cotizacion (id_ficha_cliente, estado_cotizacion, id_moneda, subtotal_costos_estimados, monto_total_estimado, fecha_emision, fecha_vigencia)
            VALUES ($1, $2, 1, $3, $4, current_date - (random() * 30)::integer, current_date + 15)
            RETURNING id_cotizacion;
        `, id_ficha, estCot, subtotal, totalEstimado);
            const id_cot = resCot[0].id_cotizacion;
            // Detalle Cotizacion
            await prisma.$executeRawUnsafe(`
            INSERT INTO terreno.item_comercial (id_item_comercial, nombre_item, descripcion_item, tipo_item)
            OVERRIDING SYSTEM VALUE
            VALUES (1, 'Puerta Blindada', 'Puerta Blindada', 'puerta') ON CONFLICT DO NOTHING;
        `);
            await prisma.$executeRawUnsafe(`
            INSERT INTO finanzas.detalle_cotizacion (id_cotizacion, id_item_comercial, descripcion_item_cotizado, cantidad_item, subtotal_item_estimado)
            VALUES ($1, 1, $2, $3, $4)
        `, id_cot, materialsInfo[matIdx].nombre, qty, subtotal);
        }
        // Notas de Venta (1 a 3)
        const numNotas = Math.floor(Math.random() * 3) + 1;
        for (let nv = 0; nv < numNotas; nv++) {
            const montoNeto = Math.floor(Math.random() * 2700000) + 800000;
            const montoImpuesto = montoNeto * 0.19;
            const montoTotal = montoNeto + montoImpuesto;
            const resNv = await prisma.$queryRawUnsafe(`
            INSERT INTO finanzas.nota_venta (id_ficha_cliente, numero_nota_venta, estado_nota_venta, id_moneda, tipo_cambio_usado, monto_neto, monto_total, monto_impuesto, fecha_emision)
            VALUES ($1, $2, 'emitida', 1, 1, $3, $4, $5, current_date - (random() * 90)::integer)
            RETURNING id_nota_venta;
        `, id_ficha, `NV-${data.rut.split('-')[0]}-${nv + 1}`, montoNeto, montoTotal, montoImpuesto);
            const id_nv = resNv[0].id_nota_venta;
            // Pagos (morosos)
            const pagoRand = Math.random();
            let pagado = 0;
            if (pagoRand > 0.6)
                pagado = montoTotal; // 40% pagan todo
            else if (pagoRand > 0.3)
                pagado = montoTotal * 0.5; // 30% la mitad
            if (pagado > 0) {
                await prisma.$executeRawUnsafe(`
                INSERT INTO finanzas.pago_cliente (id_ficha_cliente, monto_pago, id_moneda, tipo_cambio_usado, id_medio_pago, fecha_pago)
                VALUES ($1, $2, 1, 1, 1, current_date - (random() * 10)::integer)
            `, id_ficha, pagado);
            }
        }
    }
    console.log("Seedeo Profesional TS completado exitosamente.");
}
main().catch(e => {
    console.error("Error en seedeo:", e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map