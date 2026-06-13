import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye } from 'lucide-react';

interface Cliente {
  id_ficha_cliente: number;
  rut: string;
  razonSocial: string;
  telefono: string;
  correo: string;
  saldoDeudor: number;
  isMoroso?: boolean;
}

const CatalogoClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [deudaOnly, setDeudaOnly] = useState(false);
  const [morososOnly, setMorososOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const url = new URL('http://localhost:3000/api/finanzas/clients');
      if (search) url.searchParams.append('search', search);
      if (deudaOnly) url.searchParams.append('deuda', 'true');
      if (morososOnly) url.searchParams.append('morosos', 'true');
      
      const res = await fetch(url.toString());
      const data = await res.json();
      setClientes(data);
    } catch (error) {
      console.error('Error fetching clients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [search, deudaOnly, morososOnly]);

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catálogo de Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">Gestión de clientes financieros y saldos</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Buscar por RUT o Razón Social..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
            />
          </div>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-3 cursor-pointer select-none bg-orange-50 px-4 py-2.5 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={deudaOnly}
                  onChange={(e) => setDeudaOnly(e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${deudaOnly ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${deudaOnly ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="font-medium text-orange-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Con Deuda
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none bg-red-50 px-4 py-2.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only" 
                  checked={morososOnly}
                  onChange={(e) => setMorososOnly(e.target.checked)}
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${morososOnly ? 'bg-red-600' : 'bg-gray-300'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${morososOnly ? 'translate-x-4' : ''}`}></div>
              </div>
              <span className="font-medium text-red-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Morosos
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">RUT</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Razón Social</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Contacto</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-right">Saldo Deudor</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm text-center">Ficha Cliente</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">Cargando clientes...</td>
                </tr>
              ) : clientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">No se encontraron clientes.</td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id_ficha_cliente} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{c.rut}</td>
                    <td className="py-4 px-6 text-sm text-gray-700">{c.razonSocial}</td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      <div>{c.telefono || '-'}</div>
                      <div className="text-xs">{c.correo || '-'}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-medium">
                      <div className="flex flex-col items-end gap-1">
                        <span className={c.saldoDeudor > 0 ? 'text-orange-600 bg-orange-50 px-2 py-1 rounded' : 'text-green-600'}>
                          ${c.saldoDeudor.toLocaleString('es-CL')}
                        </span>
                        {c.isMoroso && (
                          <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded uppercase">
                            Moroso
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => window.location.href = `/clientes/${c.rut}`}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors inline-flex"
                        title="Ver Ficha"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CatalogoClientes;
