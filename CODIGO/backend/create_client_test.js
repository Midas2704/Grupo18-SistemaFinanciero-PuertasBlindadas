const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rutTest = "12345678-9";
  
  // Create cliente
  await prisma.cliente.create({
    data: {
      cliente_cliente_rut: rutTest,
      cliente_razon_social: "Cliente Sin Historial (Prueba Excepción)",
      cliente_contacto_principal: "Juan Perez",
      cliente_correo: "juan@sinespecial.com",
      cliente_telefono: "+56912345678",
      cliente_es_cliente_b2c: true
    }
  });

  // Create cliente_financiero
  const cliFin = await prisma.cliente_financiero.create({
    data: {
      rut_cliente: rutTest,
      id_tipo_cliente_financiero: 1, // Assuming 1 exists
      nombre_razon_social_referencia: "Cliente Sin Historial (Prueba Excepción)",
      contacto_financiero: "Juan Perez",
      correo_financiero: "juan@sinespecial.com",
      telefono_financiero: "+56912345678",
      estado_financiero: "activo"
    }
  });

  // Create ficha_cliente
  const ficha = await prisma.ficha_cliente.create({
    data: {
      id_cliente_financiero: cliFin.id_cliente_financiero,
      estado_ficha: "activa",
      observacion_financiera_general: "Cliente creado para pruebas de excepción."
    }
  });

  console.log("Cliente creado exitosamente. ID Ficha:", ficha.id_ficha_cliente);
}

main().catch(console.error).finally(() => prisma.$disconnect());
