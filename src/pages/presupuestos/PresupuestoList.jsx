import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button.jsx";

const PresupuestoList = ({ presupuestos, onEdit, onDelete, onAddNew }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({
    periodo: "",
    estadoPresupuesto: "",
    realizadoPor: ""
  });

  const filtered = useMemo(() => {
    if (!presupuestos || !Array.isArray(presupuestos)) return [];
    if (!searchTerm && Object.values(filtros).every(f => f === "")) return presupuestos;
    
    return presupuestos.filter((presupuesto) => {
      const matchesSearch = !searchTerm || 
        presupuesto.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        presupuesto.numero.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilters = 
        (!filtros.periodo || presupuesto.periodo === filtros.periodo) &&
        (!filtros.estadoPresupuesto || presupuesto.estadoPresupuesto === filtros.estadoPresupuesto) &&
        (!filtros.realizadoPor || presupuesto.realizadoPor === filtros.realizadoPor);
      
      return matchesSearch && matchesFilters;
    });
  }, [searchTerm, presupuestos, filtros]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleVerDetalle = (presupuesto) => {
    navigate(`/presupuestos/${presupuesto.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md w-full">
      {/* Header con título y controles */}
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold">Presupuestos</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por número o nombre de cliente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg bg-white text-gray-700 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-700 rounded">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-700 rounded">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
              <Button variant="guardar" onClick={onAddNew}>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nuevo presupuesto
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="bg-gray-700 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <select
              value={filtros.periodo}
              onChange={(e) => handleFiltroChange("periodo", e.target.value)}
              className="bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Período</option>
              <option value="Octubre 2025">Octubre 2025</option>
              <option value="Noviembre 2025">Noviembre 2025</option>
              <option value="Diciembre 2025">Diciembre 2025</option>
            </select>
            
            <select
              value={filtros.estadoPresupuesto}
              onChange={(e) => handleFiltroChange("estadoPresupuesto", e.target.value)}
              className="bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Estado de presupuesto</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
            
            <select
              value={filtros.realizadoPor}
              onChange={(e) => handleFiltroChange("realizadoPor", e.target.value)}
              className="bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Realizado por</option>
              <option value="Juan Pérez">Juan Pérez</option>
              <option value="María García">María García</option>
            </select>
          </div>
          
          <div className="text-sm">
            {filtered.length} presupuestos
          </div>
        </div>
      </div>

      {/* Tabla de presupuestos */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-medium">N°</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Fecha</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Marca y modelo</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Orden</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((presupuesto) => (
                <tr key={presupuesto.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{presupuesto.numero}</td>
                  <td className="py-3 px-4">{presupuesto.fecha}</td>
                  <td className="py-3 px-4 font-semibold">{presupuesto.cliente}</td>
                  <td className="py-3 px-4">{presupuesto.marcaModelo}</td>
                  <td className="py-3 px-4">
                    {presupuesto.orden ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold">{presupuesto.total}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerDetalle(presupuesto)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver detalle
                      </button>
                      <button
                        onClick={() => onEdit(presupuesto)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(presupuesto.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron presupuestos que coincidan con los filtros
          </div>
        )}
      </div>
    </div>
  );
};

export default PresupuestoList;
