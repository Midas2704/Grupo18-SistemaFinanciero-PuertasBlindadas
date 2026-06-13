import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout
import DashboardWrapper from './views/DashboardWrapper/DashboardWrapper';

// Views
import DashboardPrincipal from './views/DashboardPrincipal/DashboardPrincipal';
import CatalogoClientes from './views/CatalogoClientes/CatalogoClientes';
import VerFicha from './views/VerFicha/VerFicha';
import ArmarCotizacion from './views/ArmarCotizacion/ArmarCotizacion';
import NotaDeVentaDirecta from './views/NotaDeVentaDirecta/NotaDeVentaDirecta';
import BandejaAprobacionGerencia from './views/BandejaAprobacion/BandejaAprobacionGerencia';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardWrapper />}>
          <Route index element={<DashboardPrincipal />} />
          <Route path="clientes" element={<CatalogoClientes />} />
          <Route path="clientes/:rut" element={<VerFicha />} />
          <Route path="cotizacion/nueva" element={<ArmarCotizacion />} />
          <Route path="venta/directa" element={<NotaDeVentaDirecta />} />
          <Route path="aprobaciones" element={<BandejaAprobacionGerencia />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
