import { prisma } from '../src/db';
import { hashClave, futuro, politica } from '../src/utilidades/seguridad';
import { codigosImplementados, codigosGerencia, codigosSecretaria, codigosContador, dependenciasPermiso } from '../src/validaciones/permisos';
export async function sembrarM4() {
 if(process.env.NODE_ENV==='production') throw new Error('El seed de credenciales ficticias sólo se permite en desarrollo');
 const hash=await hashClave('Demostracion-M4-2026!');
 await prisma.$transaction(async tx=>{
  const permisos=new Map<string,bigint>();
  for(const codigo of codigosImplementados) {
   const permiso=await tx.permiso.upsert({where:{codigo_m4:codigo},update:{},create:{codigo_m4:codigo,activo_m4:true,permiso_modulo:Number(codigo.slice(2))>=59?'M4':Number(codigo.slice(2))>=42?'M3':Number(codigo.slice(2))>=12?'M2':'M1',permiso_nombre_del_permiso:codigo,permiso_descripcion:`Operación ${codigo}`,requiere_administrador:['CU65','CU66','CU74'].includes(codigo)}});
   permisos.set(codigo,permiso.permiso_id_permiso);
  }
  for(const [codigo,necesarios] of Object.entries(dependenciasPermiso)) for(const requerido of necesarios) await tx.permiso_dependencia.upsert({where:{id_permiso_id_requerido:{id_permiso:permisos.get(codigo)!,id_requerido:permisos.get(requerido)!}},update:{},create:{id_permiso:permisos.get(codigo)!,id_requerido:permisos.get(requerido)!}});
  const perfiles=new Map<string,bigint>();
  for(const [codigo,nombre,codigos] of [['gerencia','Gerencia',codigosGerencia],['secretaria','Secretaría',codigosSecretaria],['contador','Contador',codigosContador]] as const) {
   const perfil=await tx.perfil.upsert({where:{codigo_m4:codigo},update:{},create:{codigo_m4:codigo,perfil_nombre_perfil:nombre,activo_m4:true,admite_particulares:codigo!=='gerencia'}});perfiles.set(codigo,perfil.perfil_id_perfil);
   for(const permiso of codigos) await tx.perfil_permiso.upsert({where:{perfil_id_perfil_permiso_id_permiso:{perfil_id_perfil:perfil.perfil_id_perfil,permiso_id_permiso:permisos.get(permiso)!}},update:{},create:{perfil_id_perfil:perfil.perfil_id_perfil,permiso_id_permiso:permisos.get(permiso)!,perfil_permiso_activo:true}});
  }
  const cargo=await tx.cargo.upsert({where:{nombre_cargo:'Demostración M4'},update:{},create:{nombre_cargo:'Demostración M4',descripcion_cargo:'Representación mínima ficticia, sin implementar gestión de empleados'}});
  const vinculo=await tx.tipo_vinculo_laboral.upsert({where:{nombre_tipo_vinculo_laboral:'Demostración M4'},update:{},create:{nombre_tipo_vinculo_laboral:'Demostración M4'}});
  const ejemplos=[['Administración inicial','gerencia','activo',true],['Gerencia alternativa','gerencia','activo',false],['Secretaría','secretaria','activo',false],['Contabilidad','contador','activo',false],['Cuenta inactiva','secretaria','inactivo',false],['Cuenta bloqueada','contador','activo',false],['Accesos particulares','secretaria','activo',false],['Empleado sin cuenta','secretaria','activo',false]] as const;
  for(let i=0;i<ejemplos.length;i++) {
   const [nombre,perfil,estado,administrador]=ejemplos[i]!;
   const numero=String(98000001+i);let suma=0,factor=2;for(const digito of [...numero].reverse()){suma+=Number(digito)*factor;factor=factor===7?2:factor+1;}const dv=11-suma%11;const rut=`${numero}-${dv===11?'0':dv===10?'K':dv}`;
   await tx.empleado.upsert({where:{rut_empleado:rut},update:{},create:{rut_empleado:rut,nombres:`Demostración M4 ${nombre}`,apellido_paterno:'Ficticio',id_cargo:cargo.id_cargo,id_tipo_vinculo_laboral:vinculo.id_tipo_vinculo_laboral,fecha_ingreso:new Date('2026-01-01'),sueldo_base:0,estado_laboral:'activo'}});
   if(i===7) continue;
   if(await tx.usuario.findUnique({where:{acceso_m4:rut.toLowerCase()}})) continue;
   const cuenta=await tx.usuario.create({data:{acceso_m4:rut.toLowerCase(),empleado_m4:rut,empleado_rut_empleado:rut,usuario_username:rut,usuario_correo:`demostracion-m4-${i+1}@example.invalid`,usuario_estado_cuenta:estado,perfil_id_perfil:perfiles.get(perfil)!,usuario_es_administrador:administrador,administrador_original:i===0,configuracion_particular:i===6,usuario_fecha_de_creacion:new Date()}});
   await tx.usuario_contrasena.create({data:{usuario_id_usuario:cuenta.usuario_id_usuario,usuario_contrasena:hash,activa:true,temporal:false,vence:futuro(politica.vigenciaDias*1440)}});
   await tx.estado_seguridad_usuario.create({data:{id_usuario:cuenta.usuario_id_usuario,bloqueo_persistente:i===5,responsable:'Seed ficticio M4'}});
   if(i===6) for(const codigo of ['CU05','CU09']) await tx.usuario_permiso_particular.create({data:{id_usuario:cuenta.usuario_id_usuario,id_permiso:permisos.get(codigo)!}});
  }
  const cliente=await tx.cliente_financiero.findFirst({where:{nombre_razon_social_referencia:'Demostración I2 — Elena Robles'},include:{ficha_cliente:true}});
  const moneda=await tx.moneda.findUnique({where:{codigo_moneda:'CLP'}});
  if(cliente?.ficha_cliente && moneda) await tx.cotizacion.upsert({where:{referencia_demostracion:'I2-COT-B2C-EMITIDA-M4'},update:{},create:{referencia_demostracion:'I2-COT-B2C-EMITIDA-M4',id_ficha_cliente:cliente.ficha_cliente.id_ficha_cliente,id_moneda:moneda.id_moneda,fecha_emision:new Date(),fecha_vigencia:futuro(30*1440),estado_cotizacion:'emitida',monto_neto:100000,monto_impuesto:19000,monto_total_estimado:119000,exento_iva:false}});
 },{timeout:60000});
 console.log('Seed M4 completado, sin restablecer claves, permisos ni sesiones de cuentas existentes.');
}
