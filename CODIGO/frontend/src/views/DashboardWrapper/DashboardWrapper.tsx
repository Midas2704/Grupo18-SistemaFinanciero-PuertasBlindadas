import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileSignature, Receipt, ShieldCheck, CheckSquare } from 'lucide-react';

const DashboardWrapper: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/clientes', label: 'Catálogo de Clientes', icon: <Users className="w-5 h-5" /> },
    { path: '/cotizacion/nueva', label: 'Armar Cotización', icon: <FileSignature className="w-5 h-5" /> },
    { path: '/venta/directa', label: 'Nueva Venta Directa', icon: <Receipt className="w-5 h-5" /> },
    { path: '/aprobaciones', label: 'Gestión', icon: <CheckSquare className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#111111] text-gray-300 flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-primary-600 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Finanzas PBlindadas</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? 'bg-primary-600/10 text-primary-500' 
                    : 'hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-800 text-sm text-gray-500">
          Módulo ERP v1.0 <br />
          © 2026 Puertas Blindadas
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardWrapper;
