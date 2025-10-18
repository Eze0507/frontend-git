import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "@/pages/layout"; // <-- CORREGIDO
import Dashboard from "@/pages/dashboard/dashboard.jsx"; // <-- CORREGIDO
import UserPage from "@/pages/usuario/UserPage.jsx"; // <-- CORREGIDO
import CargoPage from "@/pages/cargo/cargoPage.jsx"; // <-- CORREGIDO
import HomePage from "@/pages/home/HomePage.jsx"; // <-- CORREGIDO
import LoginPage from "@/pages/login/loginPage.jsx"; // <-- CORREGIDO
import RegisterPage from "@/pages/register/TempRegisterPage.jsx"; // <-- TEMP
import EmpleadoPage from "@/pages/empleados/EmpleadoPage.jsx"; // <-- CORREGIDO
import RolePage from "@/pages/roles/rolePage.jsx"; // <-- CORREGIDO
import ClientePage from "@/pages/cliente/ClientePage.jsx"; // <-- CORREGIDO
import OrdenPage from "@/pages/ordenes/OrdenPage.jsx"; // <-- CORREGIDO
import OrdenDetalle from "@/pages/ordenes/OrdenDetalle.jsx"; // <-- CORREGIDO
import PresupuestoPage from "@/pages/presupuestos/PresupuestoPage.jsx"; // <-- CORREGIDO
import PresupuestoDetalle from "@/pages/presupuestos/PresupuestoDetalle.jsx"; // <-- CORREGIDO
import ItemTallerPage from "@/pages/itemtaller/ItemTallerPage.jsx"; // <-- CORREGIDO
import ItemVentaPage from "@/pages/itemventa/ItemVentaPage.jsx"; // <-- CORREGIDO
import ServicioPage from "@/pages/servicios/ServicioPage.jsx"; // <-- CORREGIDO
import AreaPage from "@/pages/area/areaPage.jsx"; // <-- CORREGIDO
import VehiculoPage from "@/pages/vehiculos/VehiculoPage.jsx"; // <-- CORREGIDO
import BitacoraPage from "@/pages/bitacora/BitacoraPage.jsx"; // <-- CORREGIDO

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
