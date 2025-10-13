import React from "react";

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500">Usuarios</h2>
          <p className="text-2xl font-bold">25</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500">Clientes</h2>
          <p className="text-2xl font-bold">48</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500">Órdenes</h2>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500">Ingresos</h2>
          <p className="text-2xl font-bold">$3,200</p>
        </div>
      </div>

      {/* Sección de gráficos o reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow h-64 flex items-center justify-center">
          <p className="text-gray-400">Gráfico de ventas (placeholder)</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow h-64 flex items-center justify-center">
          <p className="text-gray-400">Gráfico de clientes (placeholder)</p>
        </div>
      </div>

      {/* Tabla de últimas órdenes */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Últimas órdenes</h2>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Cliente</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border">001</td>
              <td className="p-2 border">Juan Pérez</td>
              <td className="p-2 border">En proceso</td>
              <td className="p-2 border">$120</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-2 border">002</td>
              <td className="p-2 border">María López</td>
              <td className="p-2 border">Completado</td>
              <td className="p-2 border">$250</td>
            </tr>
            <tr>
              <td className="p-2 border">003</td>
              <td className="p-2 border">Carlos Ruiz</td>
              <td className="p-2 border">Pendiente</td>
              <td className="p-2 border">$90</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
