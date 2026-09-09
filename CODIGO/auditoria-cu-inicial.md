# Auditoría inicial de cobertura CU01 a CU74

Matriz levantada antes de la segunda pasada de implementación, contrastando las dos fuentes DOCX entregadas con las rutas, vistas, fachada y controladores actuales.

| CU | Nombre | Módulo | Backend | Frontend | Persistencia | Validaciones | Estado |
|---|---|---|---|---|---|---|---|
| CU01 | Registrar cliente | M1 | `M1Controller.crearCliente` | Catálogo / Nuevo cliente | CLIENTE_FINANCIERO, FICHA_CLIENTE | tipo, duplicidad, campos | PARCIAL |
| CU02 | Actualizar cliente | M1 | `M1Controller.actualizarCliente` | Catálogo / Editar | CLIENTE_FINANCIERO | campos editables | PARCIAL |
| CU03 | Desactivar cliente | M1 | `M1Controller.cambiarEstadoCliente` | Catálogo / acción | CLIENTE_FINANCIERO | operaciones abiertas | PARCIAL |
| CU04 | Reactivar cliente | M1 | `M1Controller.cambiarEstadoCliente` | Catálogo / acción | CLIENTE_FINANCIERO | estado previo | PARCIAL |
| CU05 | Consultar catálogo | M1 | `listarClientes` | `/clientes` | CLIENTE_FINANCIERO, FICHA | sesión y permiso | IMPLEMENTADO |
| CU06 | Buscar cliente | M1 | `listarClientes` | buscador | CLIENTE_FINANCIERO | búsqueda RUT/nombre | IMPLEMENTADO |
| CU07 | Filtrar por estado | M1 | `listarClientes` | selector estado | CLIENTE_FINANCIERO | autorización CU07 | IMPLEMENTADO |
| CU08 | Filtrar situación financiera | M1 | `listarClientes` | deuda/morosos | NV y pagos | autorización CU08 | IMPLEMENTADO |
| CU09 | Visualizar ficha | M1 | `abrirFicha` | `/clientes/:rut` | CLIENTE, COTIZACION, NV, PAGO, PROYECTO | existencia y permiso | IMPLEMENTADO |
| CU10 | Filtrar/ordenar ficha | M1 | consulta parcial | ficha | historial compuesto | filtro/orden no completo | PARCIAL |
| CU11 | Filtrar/ordenar catálogo | M1 | orden fijo | catálogo | CLIENTE_FINANCIERO | orden no configurable | PARCIAL |
| CU12 | Seleccionar cliente para cotización | M2 | `guardarCotizacion` | Armar Cotización | CLIENTE/FICHA | cliente activo | IMPLEMENTADO |
| CU13 | Registrar cliente desde cotización | M2 | no existe | no existe | — | — | NO IMPLEMENTADO |
| CU14 | Productos y especificaciones | M2 | `guardarCotizacion` | formulario productos | ITEM, DETALLE_COTIZACION | medidas/materiales | PARCIAL |
| CU15 | Costo base | M2 | costeo en `guardarCotizacion` | resultado costeo | HISTORIAL_PRECIO_MATERIAL | costo vigente/moneda | PARCIAL |
| CU16 | Precio sugerido | M2 | cálculo en `guardarCotizacion` | resultado | COTIZACION | margen | PARCIAL |
| CU17 | Vigencia | M2 | validación de fecha | formulario | COTIZACION | fecha futura | IMPLEMENTADO |
| CU18 | Emitir cotización | M2 | no hay emisión separada | botón no completo | COTIZACION | completitud | NO IMPLEMENTADO |
| CU19 | Guardar borrador | M2 | `guardarCotizacion` | Armar Cotización | COTIZACION | datos mínimos | IMPLEMENTADO |
| CU20 | Retomar borrador | M2 | `editarCotizacion` parcial | bandeja/modal | COTIZACION | estado borrador | PARCIAL |
| CU21 | Reactivar vencida | M2 | no existe | no existe | — | — | NO IMPLEMENTADO |
| CU22 | Descartar borrador | M2 | `descartarBorrador` | bandeja | COTIZACION | sólo borrador | IMPLEMENTADO |
| CU23 | Formalizar B2C provisional | M2 | no existe | ficha incompleta sin acción | CLIENTE_FINANCIERO | datos formales | NO IMPLEMENTADO |
| CU24 | NV B2B mediante OC | M2 | `aprobarCotizacionB2B` | aceptación B2B | OC_B2B, NV | folio/respaldo | PARCIAL |
| CU25 | NV B2C mediante anticipo | M2 | `consolidarB2C` | detalle de cotización | NV, PAGO, DTE | atomicidad/pago | IMPLEMENTADO |
| CU26 | Seleccionar cliente NV directa | M2 | `crearVentaDirecta` | Venta directa | FICHA | cliente formal | IMPLEMENTADO |
| CU27 | Crear NV directa | M2 | `crearVentaDirecta` | Venta directa | NV | montos/moneda | IMPLEMENTADO |
| CU28 | Moneda cotización | M2 | `guardarCotizacion` | Armar Cotización | MONEDA/COTIZACION | moneda habilitada | IMPLEMENTADO |
| CU29 | Moneda NV directa | M2 | `crearVentaDirecta` | Venta directa | MONEDA/NV | moneda habilitada | IMPLEMENTADO |
| CU30 | IVA/exención cotización | M2 | `importes` | Armar Cotización | COTIZACION | booleano IVA | IMPLEMENTADO |
| CU31 | Descuento cotización | M2 | `importes` + permiso | Armar Cotización | COTIZACION | límites/permiso | IMPLEMENTADO |
| CU32 | IVA/exención NV directa | M2 | `importes` | Venta directa | NV | booleano IVA | IMPLEMENTADO |
| CU33 | Descuento NV directa | M2 | `importes` + permiso | Venta directa | NV | límites/permiso | IMPLEMENTADO |
| CU34 | Generar guía | M2 | `registrarDocumento` | gestión/bandeja | GUIA_DESPACHO | NV válida | PARCIAL |
| CU35 | Modificar guía | M2 | `modificarGuia` | sin vista dedicada | GUIA_DESPACHO | folio | PARCIAL |
| CU36 | Documento tributario | M2 | `registrarDocumento` | bandeja | DTE/NV | tipo/folio | IMPLEMENTADO |
| CU37 | Anular NV sin pagos | M2 | `anularVenta` | bandeja/ficha | NV | sin pagos | IMPLEMENTADO |
| CU38 | Revertir NV con pagos | M2 | `revertirVenta` | detalle | reversión/saldo | PDF/excedente | IMPLEMENTADO |
| CU39 | Condiciones cobro B2B | M2 | `definirCondicionesCobro` | sin vista dedicada | NV | fecha | PARCIAL |
| CU40 | Etapas cobro B2C | M2 | no existe | no existe | HITO_COBRO | — | NO IMPLEMENTADO |
| CU41 | Umbral por vencer | M2 | `configurarUmbral` | sin vista dedicada | CONFIG_UMBRAL | días | PARCIAL |
| CU42 | Seleccionar cliente para pago | M3 | catálogos por ficha | sin vista de pagos | FICHA | cliente activo | PARCIAL |
| CU43 | Asociar pago a NV | M3 | `registrarPago` | operaciones de ficha | ASIGNACION_PAGO | saldo/sobrepago | PARCIAL |
| CU44 | Categoría sugerida/editable | M3 | `prepararPago` | catálogo sin formulario completo | PAGO/CATEGORIA | categoría | PARCIAL |
| CU45 | Medio de pago | M3 | `prepararPago` | catálogo sin formulario completo | MEDIO/PAGO | medio activo | PARCIAL |
| CU46 | Cuotas tarjeta | M3 | `prepararPago` | sin vista completa | PAGO | cuotas | PARCIAL |
| CU47 | USD a CLP | M3 | entrada manual en `prepararPago` | sin flujo completo | PAGO | factor positivo | PARCIAL |
| CU48 | Documento tributario pago | M3 | `registrarPago` | selección no completa | DTE/ASIGNACION | mismo cliente | PARCIAL |
| CU49 | Recalcular saldo | M3 | `recalcularSaldo` | respuesta API | NV | monto vigente | IMPLEMENTADO |
| CU50 | Estado de pago | M3 | `recalcularSaldo` | respuesta API | NV | pendiente/parcial/pagada | IMPLEMENTADO |
| CU51 | Anular pago | M3 | `anularPago` | sin vista de pago dedicada | ANULACION_PAGO | respaldo/motivo | PARCIAL |
| CU52 | Revertir pago | M3 | `revertirPago` | sin vista de pago dedicada | REVERSION_PAGO | límite/motivo | PARCIAL |
| CU53 | Saldo a favor | M3 | `procesarExcedente` | mensaje sin gestión dedicada | SALDO_FAVOR | elección explícita | PARCIAL |
| CU54 | Aplicar saldo a favor | M3 | `aplicarSaldoFavor` | sin vista | APLICACION_SALDO | mismo cliente/saldos | PARCIAL |
| CU55 | Detalle de pago | M3 | `consultarPago` | modal parcial | PAGO | permiso | PARCIAL |
| CU56 | Morosidad | M3 | `consultarMorosidad` | ficha resume, sin acción NV | NV | vencimiento/saldo | PARCIAL |
| CU57 | Comprobante PDF | M3 | `generarComprobante` | sin descarga conectada | PAGO | pago existente | PARCIAL |
| CU58 | Conciliar pago | M3 | `conciliarPago` | sin vista | CONCILIACION/PAGO | diferencia/evidencia | PARCIAL |
| CU59 | Registrar usuario | M4 | `registrarUsuario` | Usuarios | USUARIO/CREDENCIAL | empleado/configuración | IMPLEMENTADO |
| CU60 | Desactivar usuario | M4 | `modificarUsuario` | Usuarios | USUARIO/SESION | continuidad | IMPLEMENTADO |
| CU61 | Reactivar usuario | M4 | `modificarUsuario` | Usuarios | USUARIO/CREDENCIAL | empleado/permisos | IMPLEMENTADO |
| CU62 | Configuración base | M4 | `modificarUsuario` | Usuarios | USUARIO/PERMISOS | continuidad | IMPLEMENTADO |
| CU63 | Asignar permisos | M4 | `modificarUsuario` | Usuarios | PERMISO_PARTICULAR | dependencias | IMPLEMENTADO |
| CU64 | Retirar permisos | M4 | `modificarUsuario` | Usuarios | PERMISO_PARTICULAR | dependencias | IMPLEMENTADO |
| CU65 | Asignar Administrador | M4 | `modificarUsuario` | Usuarios | USUARIO | reautenticación | IMPLEMENTADO |
| CU66 | Retirar Administrador | M4 | `modificarUsuario` | Usuarios | USUARIO | continuidad | IMPLEMENTADO |
| CU67 | Consultar usuarios | M4 | `usuarios` | `/usuarios` | USUARIO/PERFIL | autorización | IMPLEMENTADO |
| CU68 | Iniciar sesión | M4 | `iniciarSesion` | `/login` | SESION/CREDENCIAL | bloqueo/temporal | IMPLEMENTADO |
| CU69 | Cambiar contraseña | M4 | `cambiarClave` | `/cuenta/clave` | CREDENCIAL | historial | IMPLEMENTADO |
| CU70 | Recuperar contraseña | M4 | recuperación | `/recuperar` | TOKEN/CREDENCIAL | token/seguridad | IMPLEMENTADO |
| CU71 | Restablecer contraseña | M4 | `modificarUsuario` | Usuarios | CREDENCIAL/SESION | cuenta habilitada | IMPLEMENTADO |
| CU72 | Desbloquear cuenta | M4 | `modificarUsuario` | Usuarios | SEGURIDAD/CREDENCIAL | bloqueo persistente | IMPLEMENTADO |
| CU73 | Consultar sesiones | M4 | `consultarSesiones` | `/sesiones` | SESION/USUARIO | autorización | IMPLEMENTADO |
| CU74 | Cerrar sesión admin | M4 | `cerrarSesionAdministrativa` | `/sesiones` | SESION | confirmación | IMPLEMENTADO |
