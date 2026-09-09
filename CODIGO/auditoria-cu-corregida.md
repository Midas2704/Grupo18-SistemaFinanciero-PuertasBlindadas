# Auditoría conservadora de cobertura CU01–CU74

La matriz se basa en el código y las pruebas presentes en el repositorio. `No` en cualquiera de las cinco columnas de cobertura obliga a clasificar el CU como `PARCIAL`. Una compilación no se considera prueba funcional.

| CU | Estado | UI | Backend | Persistencia | Excepciones | Prueba automática | Flujo y controlador modular | Evidencia / observación |
|---|---|---:|---:|---:|---:|---:|---|---|
| CU01 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes` → `C_Finanzas.crearCliente` → `M1Controller.crearCliente` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU02 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes` → `C_Finanzas.actualizarCliente` → `M1Controller.actualizarCliente` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU03 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes` → `C_Finanzas.desactivarCliente` → `M1Controller.cambiarEstadoCliente` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU04 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes` → `C_Finanzas.reactivarCliente` → `M1Controller.cambiarEstadoCliente` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU05 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/clientes` → `C_Finanzas.listarClientes` → `M1Controller.listarClientes` | `listado real: activos, inactivos, búsqueda parcial y cliente provisional sin RUT` |
| CU06 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/clientes` → `C_Finanzas.listarClientes` → `M1Controller.listarClientes` | `listado real: activos, inactivos, búsqueda parcial y cliente provisional sin RUT` |
| CU07 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/clientes` → `C_Finanzas.listarClientes` → `M1Controller.listarClientes` | `listado real: activos, inactivos, búsqueda parcial y cliente provisional sin RUT` |
| CU08 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/clientes` → `C_Finanzas.listarClientes` → `M1Controller.listarClientes` | `ficha real reconcilia mora, deuda, anulación y reversión sin sumar CLP con USD` |
| CU09 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/clientes/:rut` → `C_Finanzas.abrirFicha` → `M1Controller.abrirFicha` | `ficha real reconcilia mora, deuda, anulación y reversión sin sumar CLP con USD` |
| CU10 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.abrirFicha` → `M1Controller.abrirFicha` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU11 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes` → `C_Finanzas.listarClientes` → `M1Controller.listarClientes` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU12 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion/nueva` → `C_Finanzas.guardarCotizacion` → `M2Controller.guardarCotizacion` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU13 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion/nueva` → `C_Finanzas.registrarClienteDesdeCotizacion` → `M2Controller.registrarClienteDesdeCotizacion` | Formulario B2B/B2C, obligatorios, duplicidad RUT, confirmación y asociación inmediata al borrador; SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU14 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion/nueva` → `C_Finanzas.guardarCotizacion` → `M2Controller.guardarCotizacion` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU15 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion/nueva` → `C_Finanzas.guardarCotizacion` → `M2Controller.guardarCotizacion` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU16 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion/nueva` → `C_Finanzas.guardarCotizacion` → `M2Controller.guardarCotizacion` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU17 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion/nueva` → `C_Finanzas.guardarCotizacion` → `M2Controller.guardarCotizacion` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU18 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion/nueva` → `C_Finanzas.emitirCotizacion` → `M2Controller.emitirCotizacion` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU19 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion/nueva` → `C_Finanzas.guardarCotizacion` → `M2Controller.guardarCotizacion` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU20 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion` → `C_Finanzas.editarCotizacion` → `M2Controller.editarCotizacion` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU21 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/aprobaciones` → `C_Finanzas.reactivarCotizacion` → `M2Controller.reactivarCotizacion` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU22 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/aprobaciones` → `C_Finanzas.descartarBorrador` → `M2Controller.descartarBorrador` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU23 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.formalizarClienteB2C` → `M2Controller.formalizarClienteB2C` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU24 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/aprobaciones` → `C_Finanzas.aprobarCotizacionB2B` → `M2Controller.aprobarCotizacionB2B` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU25 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/aprobaciones` → `C_Finanzas.aprobarCotizacionB2B` → `M2Controller.aprobarCotizacionB2B` | `CU25 éxito conserva cotización, NV y pago atómicamente`; `CU25 falla de pago no deja NV ni aprueba cotización` |
| CU26 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/venta/directa` → `C_Finanzas.crearVentaDirecta` → `M2Controller.crearVentaDirecta` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU27 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/venta/directa` → `C_Finanzas.crearVentaDirecta` → `M2Controller.crearVentaDirecta` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU28 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/venta/directa` → `C_Finanzas.crearVentaDirecta` → `M2Controller.crearVentaDirecta` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU29 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/venta/directa` → `C_Finanzas.crearVentaDirecta` → `M2Controller.crearVentaDirecta` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU30 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion/nueva` → `C_Finanzas.guardarCotizacion` → `M2Controller.guardarCotizacion` | Utilidad adicional: `calcularImportes`/`importes`; no sustituye al controlador. SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU31 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/cotizacion/nueva` → `C_Finanzas.guardarCotizacion` → `M2Controller.guardarCotizacion` | Utilidad adicional: `calcularImportes`/`importes`; no sustituye al controlador. SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU32 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/venta/directa` → `C_Finanzas.crearVentaDirecta` → `M2Controller.crearVentaDirecta` | Utilidad adicional: `calcularImportes`/`importes`; no sustituye al controlador. SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU33 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/venta/directa` → `C_Finanzas.crearVentaDirecta` → `M2Controller.crearVentaDirecta` | Utilidad adicional: `calcularImportes`/`importes`; no sustituye al controlador. SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU34 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.registrarDocumento` → `M2Controller.registrarDocumento` | Generar guía tiene acción de interfaz y persistencia `GUIA_DESPACHO`. SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU35 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.modificarGuia` → `M2Controller.modificarGuia` | Detalle de guía, editar campos permitidos, guardar y recargar asociación NV; SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU36 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.registrarDocumento` → `M2Controller.registrarDocumento` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU37 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.anularVenta` → `M2Controller.anularVenta` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU38 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/clientes/:rut` → `C_Finanzas.revertirVenta` → `M2Controller.registrarReversion` + `M3Controller.procesarExcedente` | `CU38 fachada coordina excedente y saldo a favor sin perder monto original` |
| CU39 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.definirCondicionesCobro` → `M2Controller.definirCondicionesCobro` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU40 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.configurarEtapasCobro` → `M2Controller.configurarEtapasCobro` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU41 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/configuracion/umbral` → `C_Finanzas.consultarUmbral/configurarUmbral` → `M2Controller.consultarUmbral/configurarUmbral` | Carga, muestra, valida, guarda y vuelve a mostrar el valor vigente; SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU42 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/pagos` → `C_Finanzas.contextoPago` → `M3Controller.contextoPago` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU43 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/pagos` → `C_Finanzas.registrarPago` → `M3Controller.registrarPago` | `CU43 admite parcial y rechaza NV cerrada y sobrepago` |
| CU44 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/pagos` → `C_Finanzas.registrarPago` → `M3Controller.registrarPago` | Utilidad adicional: `prepararPago`; no sustituye al controlador. SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU45 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/pagos` → `C_Finanzas.registrarPago` → `M3Controller.registrarPago` | Utilidad adicional: `prepararPago`; no sustituye al controlador. SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU46 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/pagos` → `C_Finanzas.registrarPago` → `M3Controller.registrarPago` | `prepararPago` valida tarjeta, cuota seleccionada y monto; SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU47 | PARCIAL EXTERNO | Sí | Sí | Sí | Sí | Sí | `/pagos` → `C_Finanzas.registrarPago/tipoCambio` → `M3Controller.registrarPago/consultarTipoCambio` → `C_BancoCentral` | Adaptador externo implementado y probado con mock; fallback manual identificado. Endpoint/credenciales reales no configurados en este entorno. |
| CU48 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/pagos` → `C_Finanzas.registrarPago` → `M3Controller.registrarPago` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU49 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/clientes/:rut` → `C_Finanzas.anularPago` → `M3Controller.anularPago` | `CU49/CU50 usan monto vigente y no cambian estado comercial` |
| CU50 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/clientes/:rut` → `C_Finanzas.revertirPago` → `M3Controller.revertirPago` | `CU49/CU50 usan monto vigente y no cambian estado comercial` |
| CU51 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.anularPago` → `M3Controller.anularPago` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU52 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.revertirPago` → `M3Controller.revertirPago` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU53 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/clientes/:rut` → `C_Finanzas.revertirVenta` → `M3Controller.procesarExcedente` | `CU38 fachada coordina excedente y saldo a favor sin perder monto original` |
| CU54 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.aplicarSaldoFavor` → `M3Controller.aplicarSaldoFavor` | Selector visible de saldo/NV/monto; valida cliente, elegibilidad, saldo disponible y saldo pendiente dentro de transacción; SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU55 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | ficha/cartera → `C_Finanzas.consultarPago` → `M3Controller.consultarPago` | Acción Ver detalle y modal de solo lectura con pago, NV, medio, moneda, equivalencia, documento, estado y movimientos; SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU56 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.consultarMorosidad` → `M3Controller.consultarMorosidad` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU57 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.generarComprobante` → `M3Controller.generarComprobante` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU58 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/clientes/:rut` → `C_Finanzas.conciliarPago` → `M3Controller.conciliarPago` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU59 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/usuarios` → `C_Finanzas.registrarUsuario` → `M4Controller.registrarUsuario` | `CU59 registra cuenta con temporal y CU71 la restablece` |
| CU60 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/usuarios` → `C_Finanzas.modificarUsuario` → `M4Controller.modificarUsuario` | `configuración, desactivación y reactivación` |
| CU61 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/usuarios` → `C_Finanzas.modificarUsuario` → `M4Controller.modificarUsuario` | `configuración, desactivación y reactivación` |
| CU62 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/usuarios` → `C_Finanzas.modificarUsuario` → `M4Controller.modificarUsuario` | `configuración, desactivación y reactivación` |
| CU63 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/usuarios` → `C_Finanzas.asignarPermisos` → `M4Controller.modificarUsuario` | `asignar permiso convierte a particular e invalida sesión` |
| CU64 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/usuarios` → `C_Finanzas.retirarPermisos` → `M4Controller.modificarUsuario` | `CU64 retira permiso independiente y CU66 retira rol manteniendo continuidad` |
| CU65 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/usuarios` → `C_Finanzas.asignarAdministrador` → `M4Controller.modificarUsuario` | `asignar Administrador requiere reautenticación y preserva Gerencia` |
| CU66 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/usuarios` → `C_Finanzas.retirarAdministrador` → `M4Controller.modificarUsuario` | `CU64 retira permiso independiente y CU66 retira rol manteniendo continuidad` |
| CU67 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/usuarios` → `C_Finanzas.usuarios` → `M4Controller.usuarios` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU68 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/login` → `C_Finanzas.iniciarSesion` → `M4Controller.iniciarSesion` | `login exitoso sin autorización previa` |
| CU69 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/cuenta/clave` → `C_Finanzas.cambiarClave` → `M4Controller.cambiarClave` | `cambio de contraseña invalida sesión y rechaza reutilización` |
| CU70 | IMPLEMENTADO — proveedor correo provisional | Sí | Sí | Sí | Sí | Sí | `/recuperar` → `C_Finanzas.solicitar/validar/recuperar` → `M4Controller.solicitarRecuperacion`, `validarRecuperacion`, `recuperarClave` | Flujo funcional completo, token único/vigente, cambio de clave e invalidación de sesiones; proveedor físico de correo provisional. `recuperación genérica y token único que invalida sesiones` |
| CU71 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/usuarios` → `C_Finanzas.restablecerClave` → `M4Controller.modificarUsuario` | `CU59 registra cuenta con temporal y CU71 la restablece` |
| CU72 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/usuarios` → `C_Finanzas.desbloquearUsuario` → `M4Controller.modificarUsuario` | `desbloqueo reinicia estado, genera temporal y limita uso normal` |
| CU73 | IMPLEMENTADO | Sí | Sí | Sí | Sí | No | `/sesiones` → `C_Finanzas.consultarSesiones` → `M4Controller.consultarSesiones` | SIN PRUEBA AUTOMATIZADA — validado manualmente |
| CU74 | IMPLEMENTADO | Sí | Sí | Sí | Sí | Sí | `/sesiones` → `C_Finanzas.cerrarSesionAdministrativa` → `M4Controller.cerrarSesionAdministrativa` | `cierre administrativo invalida sólo sesión seleccionada` |

## Límites de la evidencia

- `npm run build`, `tsc -b` y la suite de 39 pruebas sirven como verificación técnica, pero no se contabilizan como prueba funcional de un CU salvo cuando se cita el nombre exacto de una prueba automatizada.
- CU47 mantiene el tipo de cambio manual; no existe integración implementada con `C_BancoCentral`.
- CU70 usa un proveedor de correo provisional/injectable; no se presenta como integración externa terminada.

