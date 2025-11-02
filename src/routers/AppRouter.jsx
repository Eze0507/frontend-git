import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "@/pages/layout"; // <-- CORREGIDO
import Dashboard from "@/pages/dashboard/dashboard.jsx"; // <-- CORREGIDO
import UserPage from "@/pages/usuario/UserPage.jsx"; // <-- CORREGIDO
import CargoPage from "@/pages/cargo/cargoPage.jsx"; // <-- CORREGIDO
import HomePage from "@/pages/home/HomePage.jsx"; // <-- CORREGIDO
import LoginPage from "@/pages/login/loginPage.jsx"; // <-- CORREGIDO
import RegisterPage from "@/pages/register/RegisterPage.jsx"; // <-- CORREGIDO
import EmpleadoPage from "@/pages/empleados/EmpleadoPage.jsx"; // <-- CORREGIDO
import RolePage from "@/pages/roles/rolePage.jsx"; // <-- CORREGIDO
import ClientePage from "@/pages/cliente/ClientePage.jsx"; // <-- CORREGIDO
import OrdenPage from "@/pages/ordenes/OrdenPage.jsx"; // <-- CORREGIDO
import OrdenDetalle from "@/pages/ordenes/OrdenDetalle.jsx"; // <-- CORREGIDO
import PresupuestoPage from "@/pages/presupuestos/PresupuestoPage.jsx"; // <-- CORREGIDO
import PresupuestoDetalle from "@/pages/presupuestos/PresupuestoDetalle.jsx"; // <-- CORREGIDO
import PresupuestoForm from "../pages/presupuestos/PresupuestoForm.jsx";
import ItemTallerPage from "@/pages/itemtaller/ItemTallerPage.jsx"; // <-- CORREGIDO
import ItemVentaPage from "@/pages/itemventa/ItemVentaPage.jsx"; // <-- CORREGIDO
import ServicioPage from "@/pages/servicios/ServicioPage.jsx"; // <-- CORREGIDO
import AreaPage from "@/pages/area/areaPage.jsx"; // <-- CORREGIDO
import VehiculoPage from "@/pages/vehiculos/VehiculoPage.jsx"; // <-- CORREGIDO
import BitacoraPage from "@/pages/bitacora/BitacoraPage.jsx"; // <-- CORREGIDO
import PagosList from "@/pages/pagos/PagosList.jsx"; // <-- Módulo de Pagos
import PagoDetalle from "@/pages/pagos/PagoDetalle.jsx"; // <-- Módulo de Pagos
import PagoCheckout from "@/pages/pagos/PagoCheckout.jsx"; // <-- Módulo de Pagos
import ReconocimientoPage from "@/pages/reconocimiento/ReconocimientoPage.jsx"; // <-- RECONOCIMIENTO DE PLACAS
import ProveedorPage from "@/pages/proveedor/ProveedorPage.jsx"; // <-- Módulo de Proveedores

const AdminRoutes = () => {
  const isAuthenticated = !!localStorage.getItem("access");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const AppRouter = () => {
  // Esta comprobación se hace ahora dentro de cada ruta protegida o en el redirect
  const isAuthenticated = !!localStorage.getItem("access");
  const rawRole = (localStorage.getItem("userRole") || '').toLowerCase();
  const role = rawRole === 'administrador' ? 'admin' : rawRole;

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto */}
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />
        <Route path="/register" element={<RegisterPage />} />

        {/* Ruta de login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Página Home independiente (sin sidebar) */}
        <Route path="/admin/home" element={<HomePage />} />

        {/* Páginas del panel de administrador */}
        <Route element={<AdminRoutes />}>
          {/* Dashboard: admin y empleado */}
          <Route path="/admin/dashboard" element={(role === 'admin' || role === 'empleado') ? <Dashboard /> : <Navigate to="/admin/home" replace />} />
          {/* Administración: solo admin */}
          <Route path="/admin/usuarios" element={(role === 'admin') ? <UserPage /> : <Navigate to="/admin/home" replace />} />
          <Route path="/admin/cargos" element={(role === 'admin') ? <CargoPage /> : <Navigate to="/admin/home" replace />} />
          <Route path="/admin/empleados" element={(role === 'admin') ? <EmpleadoPage /> : <Navigate to="/admin/home" replace />} />
          <Route path="/admin/roles" element={(role === 'admin') ? <RolePage /> : <Navigate to="/admin/home" replace />} />
          {/* Clientes: admin y empleado */}
          <Route path="/admin/clientes" element={(role === 'admin' || role === 'empleado') ? <ClientePage /> : <Navigate to="/admin/home" replace />} />
          {/* Operaciones: admin y empleado */}
          <Route path="/admin/operaciones/vehiculos" element={(role === 'admin' || role === 'empleado') ? <VehiculoPage /> : <Navigate to="/admin/home" replace />} />
          <Route path="/ordenes" element={(role === 'admin' || role === 'empleado') ? <OrdenPage /> : <Navigate to="/admin/home" replace />} />
          <Route path="/ordenes/:id" element={(role === 'admin' || role === 'empleado') ? <OrdenDetalle /> : <Navigate to="/admin/home" replace />} />
          <Route path="/presupuestos" element={(role === 'admin' || role === 'empleado') ? <PresupuestoPage /> : <Navigate to="/admin/home" replace />} />
          <Route path="/presupuestos/nuevo" element={(role === 'admin' || role === 'empleado') ? <PresupuestoForm /> : <Navigate to="/admin/home" replace />} />
          <Route path="/presupuestos/:id" element={(role === 'admin' || role === 'empleado') ? <PresupuestoDetalle /> : <Navigate to="/admin/home" replace />} />
          <Route path="/presupuestos/:id/editar" element={(role === 'admin' || role === 'empleado') ? <PresupuestoForm /> : <Navigate to="/admin/home" replace />} />
          {/* Ruta para ítems de taller */}
          <Route path="/admin/operaciones/inventario/taller" element={(role === 'admin' || role === 'empleado') ? <ItemTallerPage /> : <Navigate to="/admin/home" replace />} />
          {/* Ruta para ítems de venta */}
          <Route path="/admin/operaciones/inventario/venta" element={(role === 'admin' || role === 'empleado') ? <ItemVentaPage /> : <Navigate to="/admin/home" replace />} />
          {/* Ruta para servicios */}
          <Route path="/admin/operaciones/servicios" element={(role === 'admin' || role === 'empleado') ? <ServicioPage /> : <Navigate to="/admin/home" replace />} />
          {/* Ruta para áreas */}
          <Route path="/admin/operaciones/area" element={(role === 'admin' || role === 'empleado') ? <AreaPage /> : <Navigate to="/admin/home" replace />} />
          {/* Ruta para bitácora */}
          <Route path="/admin/bitacora" element={(role === 'admin') ? <BitacoraPage /> : <Navigate to="/admin/home" replace />} />
          {/* Rutas para el módulo de Pagos */}
          <Route path="/pagos" element={(role === 'admin') ? <PagosList /> : <Navigate to="/admin/home" replace />} />
          <Route path="/pagos/:pagoId" element={(role === 'admin') ? <PagoDetalle /> : <Navigate to="/admin/home" replace />} />
          <Route path="/pagos/checkout/:ordenId" element={(role === 'admin') ? <PagoCheckout /> : <Navigate to="/admin/home" replace />} />
          {/* Ruta para reconocimiento de placas */}
          <Route path="/admin/reconocimiento" element={(role === 'admin' || role === 'empleado') ? <ReconocimientoPage /> : <Navigate to="/admin/home" replace />} />
          {/* Ruta para proveedores */}
          <Route path="/admin/proveedores" element={(role === 'admin' || role === 'empleado') ? <ProveedorPage /> : <Navigate to="/admin/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
