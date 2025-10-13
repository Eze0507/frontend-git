import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "../pages/layout";
import Dashboard from "../pages/dashboard/dashboard.jsx";
import UserPage from "../pages/usuario/UserPage.jsx";
import CargoPage from "../pages/cargo/cargoPage.jsx";
import HomePage from "../pages/home/HomePage.jsx";
import LoginPage from "../pages/login/loginPage.jsx"; // 👈 importar login
import RegisterPage from "../pages/register/RegisterPage.jsx";
import EmpleadoPage from "../pages/empleados/EmpleadoPage.jsx";
import RolePage from "../pages/roles/rolePage.jsx";
import ClientePage from "../pages/cliente/ClientePage.jsx";
import OrdenPage from "../pages/ordenes/OrdenPage.jsx";
import OrdenDetalle from "../pages/ordenes/OrdenDetalle.jsx";
import PresupuestoPage from "../pages/presupuestos/PresupuestoPage.jsx";
import PresupuestoDetalle from "../pages/presupuestos/PresupuestoDetalle.jsx";
import ItemTallerPage from "../pages/ItemTaller/ItemTallerPage.jsx";
import ItemVentaPage from "../pages/ItemVenta/ItemVentaPage.jsx";
import ServicioPage from "../pages/Servicios/ServicioPage.jsx";
import AreaPage from "../pages/area/areaPage.jsx";
import VehiculoPage from "../pages/vehiculos/VehiculoPage.jsx";
import BitacoraPage from "../pages/bitacora/BitacoraPage.jsx";

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
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/usuarios" element={<UserPage />} />
          <Route path="/admin/cargos" element={<CargoPage />} />
          <Route path="/admin/empleados" element={<EmpleadoPage />} />
          <Route path="/admin/clientes" element={<ClientePage />} />
          <Route path="/admin/operaciones/vehiculos" element={<VehiculoPage />} />
          <Route path="/admin/roles" element={<RolePage />} />
          <Route path="/ordenes" element={<OrdenPage />} />
          <Route path="/ordenes/:id" element={<OrdenDetalle />} />
          <Route path="/presupuestos" element={<PresupuestoPage />} />
          <Route path="/presupuestos/:id" element={<PresupuestoDetalle />} />
          {/* Ruta para ítems de taller */}
          <Route path="/admin/operaciones/inventario/taller" element={<ItemTallerPage />} />
          {/* Ruta para ítems de venta */}
          <Route path="/admin/operaciones/inventario/venta" element={<ItemVentaPage />} />
          {/* Ruta para servicios */}
          <Route path="/admin/operaciones/servicios" element={<ServicioPage />} />
          {/* Ruta para áreas */}
          <Route path="/admin/operaciones/area" element={<AreaPage />} />
          {/* Ruta para bitácora */}
          <Route path="/admin/bitacora" element={<BitacoraPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
