"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
// Parche global para BigInt
BigInt.prototype.toJSON = function () {
    return this.toString();
};
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Iniciando Seedeo Masivo...');
    // 1. Crear 15 Clientes B2B/B2C en Terreno
    const rutBase = 12000000;
    for (let i = 1; i <= 15; i++) {
        const rut = `${rutBase + i}-K`;
        // Check if exists
        const exists = await prisma.cliente.findUnique({ where: { cliente_cliente_rut: rut } });
        if (exists)
            continue;
        await prisma.cliente.create({
            data: {
                cliente_cliente_rut: rut,
                cliente_razon_social: `Empresa Comercial ${i} S.A.`,
                cliente_correo: `contacto${i}@empresa.cl`,
                cliente_telefono: `+569888877${i.toString().padStart(2, '0')}`,
                cliente_es_cliente_b2b: true,
                cliente_es_cliente_b2c: false,
                cliente_id_rubro: null,
            }
        });
        // 2. Crear Cliente Financiero (finanzas)
        await prisma.cliente_financiero.create({
            data: {
                rut: rut,
                id_tipo_cliente: 1, // asumiendo 1 es empresa
                nombre_razon_social: `Empresa Comercial ${i} S.A.`,
                direccion_facturacion: `Avenida Central ${100 * i}, Santiago`,
                telefono_principal: `+569888877${i.toString().padStart(2, '0')}`,
                correo_facturacion: `facturacion${i}@empresa.cl`,
            }
        });
        // 3. Crear Ficha Cliente
        await prisma.ficha_cliente.create({
            data: {
                rut: rut,
                estado_ficha: 'activa',
                ejecutivo_asignado: null,
                observaciones: 'Cliente generado mediante seed.',
                fecha_creacion: new Date(new Date().getTime() - Math.random() * 10000000000)
            }
        });
    }
    // Obtener todos los ruts
    const clientes = await prisma.cliente_financiero.findMany();
    // 4. Inventario / Materiales
    for (let i = 1; i <= 5; i++) {
        const sku = `MAT-00${i}`;
        const exists = await prisma.historial_precio_material.findFirst({ where: { material_sku: sku } });
        if (!exists) {
            await prisma.historial_precio_material.create({
                data: {
                    material_sku: sku,
                    id_proveedor: null,
                    id_moneda: 1, // CLP
                    precio_unitario: 50000 * i,
                    fecha_vigencia_desde: new Date(),
                    precio_vigente: true
                }
            });
        }
    }
    // 5. Crear Notas de Venta y Pagos
    for (let i = 0; i < 13; i++) { // A 13 clientes
        const rut = clientes[i].rut;
        const maxNotas = Math.floor(Math.random() * 5) + 1; // 1 a 5 notas
        for (let j = 0; j < maxNotas; j++) {
            const montoNeto = Math.floor(Math.random() * 3000000) + 500000;
            const tieneIva = Math.random() > 0.2;
            const montoTotal = tieneIva ? montoNeto * 1.19 : montoNeto;
            const estado = Math.random() > 0.3 ? 'aprobada' : (Math.random() > 0.5 ? 'pagada' : 'anulada');
            const idMoneda = Math.random() > 0.8 ? 2 : 1; // 1 CLP, 2 USD
            const nv = await prisma.nota_venta.create({
                data: {
                    rut: rut,
                    id_cotizacion: null,
                    fecha_emision: new Date(new Date().getTime() - Math.random() * 5000000000),
                    estado_nota_venta: estado,
                    id_moneda: idMoneda,
                    tasa_cambio: idMoneda === 1 ? 1 : 950,
                    monto_neto: montoNeto,
                    monto_total: montoTotal,
                    exento_iva: !tieneIva,
                    descuento_global_tipo: 'porcentaje',
                    descuento_global_valor: 0,
                    monto_pagado: estado === 'pagada' ? montoTotal : (estado === 'aprobada' ? montoTotal * 0.5 : 0)
                }
            });
            // Crear pago cliente si pagó algo
            if (nv.monto_pagado && Number(nv.monto_pagado) > 0) {
                await prisma.pago_cliente.create({
                    data: {
                        rut: rut,
                        id_nota_venta: nv.id_nota_venta,
                        fecha_pago: new Date(),
                        monto_pago: nv.monto_pagado,
                        id_moneda: idMoneda,
                        tasa_cambio: nv.tasa_cambio,
                        id_medio_pago: 1, // transferencia
                        comprobante: `COMPR-${nv.id_nota_venta}`
                    }
                });
            }
        }
    }
    // 6. Generar Cotizaciones
    const materiales = await prisma.historial_precio_material.findMany();
    for (let i = 0; i < 10; i++) {
        const rut = clientes[i].rut;
        const cotizacion = await prisma.cotizacion.create({
            data: {
                rut: rut,
                fecha_emision: new Date(),
                fecha_vigencia: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000),
                estado_cotizacion: i % 2 === 0 ? 'borrador' : 'aprobada',
                id_moneda: 1,
                monto_subtotal: 0,
                monto_descuento: 0,
                monto_total: 0,
                margen_ganancia_estimado: 30
            }
        });
        let totalCosto = 0;
        // Agregar 2 materiales
        for (let k = 0; k < 2; k++) {
            const mat = materiales[k];
            const qty = Math.floor(Math.random() * 5) + 1;
            await prisma.detalle_cotizacion.create({
                data: {
                    id_cotizacion: cotizacion.id_cotizacion,
                    tipo_item: 'material',
                    id_item_referencia: mat.id_historial_precio_material,
                    descripcion_item: `Material ${mat.material_sku}`,
                    cantidad: qty,
                    precio_unitario: mat.precio_unitario,
                    subtotal: Number(mat.precio_unitario) * qty
                }
            });
            totalCosto += Number(mat.precio_unitario) * qty;
        }
        const precioSugerido = totalCosto / (1 - 0.3);
        await prisma.cotizacion.update({
            where: { id_cotizacion: cotizacion.id_cotizacion },
            data: {
                monto_subtotal: precioSugerido,
                monto_total: precioSugerido * 1.19
            }
        });
    }
    console.log('¡Seedeo masivo completado con éxito!');
}
main()
    .catch(e => {
    console.error('Error en seedeo: ', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-massive.js.map