import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, CreditCard, FileText, Activity, Briefcase, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import ModalDetalleDocumento from '../../components/ModalDetalleDocumento';

interface FichaCompleta {
  resumen: {
    rut_cliente: string;
    nombre_razon_social_referencia: string;
    telefono_financiero: string;
    correo_financiero: string;
    nombre_tipo_cliente_financiero: string;
    estado_ficha: string;
    fecha_creacion: string;
    saldoDeudor: number;
    limite_credito_vigente: number;
    isMoroso?: boolean;
  };
  resumen_dashboard: {
    total_ventas: number;
    total_deuda: number;
    total_pagado: number;
    proyectos_activos: number;
    proyectos_terminados: number;
    cotizaciones: any[];
    notas_venta: any[];
  };
  historial: any[];
}

const getRutFromUrl = () => {
  const parts = window.location.pathname.split('/');
  return parts[parts.length - 1];
};

const VerFicha: React.FC = () => {
  const [data, setData] = useState<FichaCompleta | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeModal, setActiveModal] = useState<{ tipo: 'cotizacion' | 'nota_venta', data: any } | null>(null);
  const [folioNC, setFolioNC] = useState('');
  const [showNCInput, setShowNCInput] = useState(false);
  const [modalMsg, setModalMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const rut = getRutFromUrl();
    if (!rut || rut === 'clientes') return;

    fetch(`http://localhost:3000/api/finanzas/clients/${rut}/ficha`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando ficha...</div>;
  if (!data || !data.resumen) return <div className="p-8 text-center text-red-500">Ficha no encontrada.</div>;

  const { resumen, resumen_dashboard } = data;

  // Inject ficha_cliente stub from resumen so the universal modal always has nombre and rut
  const fichaClienteStub = {
    cliente_financiero: {
      nombre_razon_social_referencia: resumen.nombre_razon_social_referencia,
      rut_cliente: resumen.rut_cliente
    }
  };

  const openModalCotizacion = (cotizacion: any) => {
    const enriched = cotizacion.ficha_cliente
      ? cotizacion
      : { ...cotizacion, ficha_cliente: fichaClienteStub };
    setActiveModal({ tipo: 'cotizacion', data: enriched });
  };

  const openModalNotaVenta = (id_nota_venta: number) => {
    const nv = resumen_dashboard.notas_venta?.find(n => Number(n.id_nota_venta) === Number(id_nota_venta));
    if (nv) {
      const enriched = nv.ficha_cliente
        ? nv
        : { ...nv, ficha_cliente: fichaClienteStub };
      setActiveModal({ tipo: 'nota_venta', data: enriched });
      setFolioNC('');
      setShowNCInput(false);
      setModalMsg({ text: '', type: '' });
    }
  };



  const handleAnular = async () => {
    if (!window.confirm('¿Está seguro de anular esta Nota de Venta?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/finanzas/billing/nota-venta/${activeModal?.data.id_nota_venta}/anular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folio_nota_credito: folioNC })
      });
      const d = await res.json();
      if (!res.ok) {
        if (d.error.includes('Nota de Crédito')) {
          setShowNCInput(true);
        }
        throw new Error(d.error);
      }
      setModalMsg({ text: 'Nota de Venta anulada', type: 'success' });
      setActiveModal(prev => prev ? { ...prev, data: { ...prev.data, estado_nota_venta: 'anulada' } } : null);
      setData(prev => prev ? { 
        ...prev, 
        resumen_dashboard: {
          ...prev.resumen_dashboard,
          notas_venta: prev.resumen_dashboard.notas_venta.map((nv: any) => nv.id_nota_venta === activeModal?.data.id_nota_venta ? { ...nv, estado_nota_venta: 'anulada' } : nv)
        }
      } : null);
    } catch (e: any) {
      setModalMsg({ text: e.message, type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans bg-slate-50 min-h-screen relative">
      <button
        onClick={() => window.location.href = '/'}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al catálogo
      </button>

      {/* Header Ficha */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{resumen.nombre_razon_social_referencia}</h1>
                {resumen.isMoroso ? (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Moroso</span>
                ) : (
                  <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">Al Día</span>
                )}
              </div>
              <p className="text-primary-100 flex items-center gap-2 mt-2">
                <User className="w-4 h-4" /> {resumen.rut_cliente} | {resumen.nombre_tipo_cliente_financiero}
              </p>
              <div className="flex gap-4 mt-4">
                <span className="flex items-center gap-2 text-sm text-primary-100"><Phone className="w-4 h-4"/> {resumen.telefono_financiero || 'N/A'}</span>
                <span className="flex items-center gap-2 text-sm text-primary-100"><Mail className="w-4 h-4"/> {resumen.correo_financiero || 'N/A'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-primary-200 uppercase tracking-wider font-semibold">Estado de Ficha</div>
              <div className="text-xl font-bold capitalize mt-1">{resumen.estado_ficha}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Dashboard Cards */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary-600" />
        Resumen Financiero y Operativo
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total Comprado</div>
            <div className="font-bold text-2xl text-gray-900">${resumen_dashboard?.total_ventas?.toLocaleString('es-CL') || 0}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign className="w-6 h-6" /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total Pagado</div>
            <div className="font-bold text-2xl text-gray-900">${resumen_dashboard?.total_pagado?.toLocaleString('es-CL') || 0}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><CreditCard className="w-6 h-6" /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Deuda Vigente</div>
            <div className="font-bold text-2xl text-red-600">${resumen_dashboard?.total_deuda?.toLocaleString('es-CL') || 0}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Briefcase className="w-6 h-6" /></div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Proyectos Activos / Ter.</div>
            <div className="font-bold text-2xl text-gray-900">{resumen_dashboard?.proyectos_activos || 0} <span className="text-gray-400 text-lg">/ {resumen_dashboard?.proyectos_terminados || 0}</span></div>
          </div>
        </div>
      </div>

      {/* Cotizaciones Históricas */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 mt-8">
        <FileText className="w-5 h-5 text-primary-600" />
        Cotizaciones Históricas
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-6 font-semibold text-gray-600 text-sm">ID / Folio</th>
                <th className="py-3 px-6 font-semibold text-gray-600 text-sm">Emisión</th>
                <th className="py-3 px-6 font-semibold text-gray-600 text-sm">Vigencia</th>
                <th className="py-3 px-6 font-semibold text-gray-600 text-sm">Estado</th>
                <th className="py-3 px-6 font-semibold text-gray-600 text-sm text-right">Monto Estimado</th>
              </tr>
            </thead>
            <tbody>
              {resumen_dashboard?.cotizaciones?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No hay cotizaciones registradas.</td>
                </tr>
              ) : (
                resumen_dashboard?.cotizaciones?.map((cot, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6 text-sm">
                      <span
                        onClick={() => openModalCotizacion(cot)}
                        className="text-orange-600 hover:underline cursor-pointer font-medium"
                      >
                        COT-{cot.id_cotizacion}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-900">
                      {new Date(cot.fecha_emision).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-500">
                      {cot.fecha_vigencia ? new Date(cot.fecha_vigencia).toLocaleDateString('es-CL') : 'N/A'}
                    </td>
                    <td className="py-3 px-6 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${cot.estado_cotizacion === 'aprobada' ? 'bg-green-100 text-green-700' :
                          cot.estado_cotizacion === 'borrador' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                        {cot.estado_cotizacion}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-right font-medium text-gray-900">
                      ${Number(cot.monto_total_estimado).toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notas de Venta */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary-600" />
        Notas de Venta y Pagos
      </h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-6 font-semibold text-gray-600 text-sm">ID / Folio</th>
                <th className="py-3 px-6 font-semibold text-gray-600 text-sm">Fecha</th>
                <th className="py-3 px-6 font-semibold text-gray-600 text-sm">Estado</th>
                <th className="py-3 px-6 font-semibold text-gray-600 text-sm text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {(!resumen_dashboard?.notas_venta || resumen_dashboard.notas_venta.length === 0) ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No hay Notas de Venta registradas.</td>
                </tr>
              ) : (
                resumen_dashboard.notas_venta.map((nv, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6 text-sm">
                      <span
                        onClick={() => openModalNotaVenta(nv.id_nota_venta)}
                        className="text-orange-600 hover:underline cursor-pointer font-medium"
                      >
                        NV-{nv.id_nota_venta}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-900">
                      {new Date(nv.fecha_emision).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-6 text-sm">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${nv.estado_nota_venta === 'PAGADA' ? 'bg-green-100 text-green-700' :
                          nv.estado_nota_venta === 'PARCIAL' ? 'bg-yellow-100 text-yellow-700' :
                          nv.estado_nota_venta === 'anulada' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {nv.estado_nota_venta}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-right font-medium text-gray-900">
                      ${Number(nv.monto_total).toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Desglose Universal */}
      <ModalDetalleDocumento activeModal={activeModal} onClose={() => setActiveModal(null)}>
        {/* Administración del Documento (Solo NV no anulada) */}
        {activeModal && activeModal.tipo === 'nota_venta' && activeModal.data.estado_nota_venta !== 'anulada' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            {modalMsg.text && (
              <div className={`p-3 mb-4 text-sm rounded-lg ${modalMsg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {modalMsg.text}
              </div>
            )}
            <h4 className="font-semibold text-gray-900 mb-4">Administración del Documento</h4>
            <div className="flex justify-end">
              <div className="w-1/2 bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col justify-center">
                {showNCInput && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-red-800 mb-1">Folio Nota de Crédito Obligatorio:</label>
                    <input
                      type="text"
                      placeholder="Ej. NC-987"
                      value={folioNC}
                      onChange={e => setFolioNC(e.target.value)}
                      className="w-full p-2 border border-red-300 rounded outline-none text-sm"
                    />
                  </div>
                )}
                {!showNCInput ? (
                  <button
                    onClick={() => setShowNCInput(true)}
                    className="w-full px-4 py-2 bg-white text-red-600 border border-red-200 rounded hover:bg-red-50 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" /> Anular Nota de Venta
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowNCInput(false)}
                      className="flex-1 px-3 py-2 bg-white text-gray-600 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAnular}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold shadow-sm"
                    >
                      Confirmar Anulación
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ModalDetalleDocumento>
    </div>
  );
};

export default VerFicha;
