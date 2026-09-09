/** Catálogo técnico de operaciones implementadas. Los perfiles no se editan desde la interfaz. */
export const operacionesPermiso: Record<string, string> = {
 buscarClientes:'CU06',filtrarEstado:'CU07',filtrarFinanzas:'CU08',listarClientes:'CU05', abrirFicha:'CU09', dashboard:'CU05', crearCliente:'CU01', actualizarCliente:'CU02', desactivarCliente:'CU03', reactivarCliente:'CU04', inventario:'CU15', productos:'CU14', monedas:'CU28',
 bandeja:'CU20', historial:'CU20', guardarCotizacion:'CU19', editarCotizacion:'CU20', crearVentaDirecta:'CU27', registrarClienteDesdeCotizacion:'CU13', emitirCotizacion:'CU18', reactivarCotizacion:'CU21', formalizarClienteB2C:'CU23', aprobarCotizacionB2B:'CU24', configurarEtapasCobro:'CU40', modificarGuia:'CU35', definirCondicionesCobro:'CU39', configurarUmbral:'CU41', consultarUmbral:'CU41',
 anularVenta:'CU37', registrarDocumento:'CU36', descartarBorrador:'CU22', aprobarCotizacion:'CU24', aprobarVenta:'CU27', tipoCambio:'CU47',
 consultarPago:'CU55', consultarSaldo:'CU49', catalogosPago:'CU45', contextoPago:'CU42', consolidarB2C:'CU25', revertirVenta:'CU38', registrarPago:'CU43', anularPago:'CU51', revertirPago:'CU52', aplicarSaldoFavor:'CU54', consultarMorosidad:'CU56', generarComprobante:'CU57', conciliarPago:'CU58',
 usuarios:'CU67', catalogosUsuarios:'CU59', registrarUsuario:'CU59', desactivarUsuario:'CU60', reactivarUsuario:'CU61',
 cambiarConfiguracion:'CU62', asignarPermisos:'CU63', retirarPermisos:'CU64', asignarAdministrador:'CU65', retirarAdministrador:'CU66',
 restablecerClave:'CU71', desbloquearUsuario:'CU72', consultarSesiones:'CU73', cerrarSesionAdministrativa:'CU74',
};
export const permisosM4 = Array.from({length:16}, (_, indice) => `CU${indice + 59}`).filter(codigo => !['CU68','CU69','CU70'].includes(codigo));
export const codigosImplementados = [...new Set([...Object.values(operacionesPermiso), 'CU31','CU33'])];
export const dependenciasPermiso: Record<string, string[]> = {
 CU02:['CU05'],CU03:['CU05'],CU04:['CU05'],CU06:['CU05'],CU07:['CU05'],CU08:['CU05'],CU09:['CU05'], CU20:['CU05'], CU19:['CU05','CU14','CU15','CU28'], CU27:['CU05'], CU22:['CU20'], CU24:['CU20'], CU25:['CU20'], CU35:['CU09'],CU36:['CU09'],CU37:['CU09'],CU38:['CU09'],CU39:['CU09'],CU41:['CU09'],
 CU13:['CU19'],CU18:['CU19'],CU21:['CU20'],CU23:['CU09'],CU31:['CU19'], CU33:['CU27'], CU40:['CU09'],CU42:['CU05'],CU43:['CU05','CU49','CU45'], CU51:['CU43'],CU52:['CU43'],CU54:['CU43'],CU56:['CU49'],CU57:['CU55'],CU58:['CU43'],
 CU60:['CU67'],CU61:['CU67'],CU62:['CU67'],CU63:['CU67'],CU64:['CU67'],CU65:['CU67'],CU66:['CU67'],CU71:['CU67'],CU72:['CU67'],CU74:['CU73'],
};
export const codigosGerencia = codigosImplementados;
export const codigosSecretaria = codigosImplementados.filter(codigo => Number(codigo.slice(2)) < 59 && !['CU31','CU33','CU37','CU38'].includes(codigo));
export const codigosContador = ['CU05','CU06','CU07','CU08','CU09','CU37','CU38','CU43','CU45','CU47','CU49','CU55'];

