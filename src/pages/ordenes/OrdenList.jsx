import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/button.jsx";
import CustomTable from "../../components/table.jsx";

const EstadoSelector = ({ orden, onEstadoChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempEstado, setTempEstado] = useState(orden.estado);

  const estadosDisponibles = [
    "pendiente",
    "en_proceso",
    "finalizada", 
    "entregada",
    "cancelada"
  ];

  const getEstadoLabel = (estado) => {
    const labels = {
      "pendiente": "Pendiente",
      "en_proceso": "En Proceso", 
      "finalizada": "Finalizada",
      "entregada": "Entregada",
      "cancelada": "Cancelada"
    };
    return labels[estado] || estado;
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente": return "bg-red-100 text-red-800 border-red-200";
      case "en_proceso": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "finalizada": return "bg-blue-100 text-blue-800 border-blue-200";
      case "entregada": return "bg-green-100 text-green-800 border-green-200";
      case "cancelada": return "bg-gray-100 text-gray-800 border-gray-200";
      // Para compatibilidad con estados anteriores
      case "Pendiente": return "bg-red-100 text-red-800 border-red-200";
      case "En proceso": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Finalizado": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Entregado": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelado": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Completado": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleSave = () => {
    if (tempEstado !== orden.estado) {
      onEstadoChange(orden.id, tempEstado);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempEstado(orden.estado);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <select
          value={tempEstado}
          onChange={(e) => setTempEstado(e.target.value)}
          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {estadosDisponibles.map(estado => (
            <option key={estado} value={estado}>{getEstadoLabel(estado)}</option>
          ))}
        </select>
        <button
          onClick={handleSave}
          className="text-green-600 hover:text-green-800 text-xs"
          title="Guardar"
        >
          ✓
        </button>
        <button
          onClick={handleCancel}
          className="text-red-600 hover:text-red-800 text-xs"
          title="Cancelar"
        >
          ✗
        </button>
      </div>
    );
  }

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 ${getEstadoColor(orden.estado)}`}
      onClick={() => setIsEditing(true)}
      title="Clic para editar estado"
    >
      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      {getEstadoLabel(orden.estado)}
    </span>
  );
};

const OrdenList = ({ ordenes, onEdit, onDelete, onAddNew, onEstadoChange }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // list o grid
  const [showFilters, setShowFilters] = useState(false); // Para controlar filtros en móvil
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    estadoOrden: "",
    asignadoA: "",
    estadoPago: ""
  });

  const filtered = useMemo(() => {
    if (!ordenes || !Array.isArray(ordenes)) return [];
    if (!searchTerm && Object.values(filtros).every(f => f === "")) return ordenes;
    
    return ordenes.filter((orden) => {
      const matchesSearch = !searchTerm || 
        orden.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.numero.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtros de fecha
      let matchesFecha = true;
      if (filtros.fechaDesde || filtros.fechaHasta) {
        // Usar solo fechaCreacion que contiene la fecha completa del API
        if (!orden.fechaCreacion) {
          // Si no hay fecha de creación, no coincide con filtros de fecha
          matchesFecha = false;
        } else {
          const fechaOrden = new Date(orden.fechaCreacion);
          
          // Verificar que la fecha sea válida
          if (isNaN(fechaOrden.getTime())) {
            matchesFecha = false;
          } else {
            // Extraer solo la parte de fecha (YYYY-MM-DD) para comparación precisa
            const fechaOrdenSolo = fechaOrden.toISOString().split('T')[0]; // "2025-10-17"
            
            if (filtros.fechaDesde) {
              matchesFecha = matchesFecha && fechaOrdenSolo >= filtros.fechaDesde;
            }
            
            if (filtros.fechaHasta) {
              matchesFecha = matchesFecha && fechaOrdenSolo <= filtros.fechaHasta;
            }
          }
        }
      }
      
      // Filtro de estado de pago
      let matchesPago = true;
      if (filtros.estadoPago) {
        if (filtros.estadoPago === "pagado") {
          // El campo pago puede ser booleano o string
          matchesPago = orden.pago === true || orden.pago === "true" || orden.pago === "True";
        } else if (filtros.estadoPago === "pendiente") {
          matchesPago = orden.pago === false || orden.pago === "false" || orden.pago === "False" || !orden.pago;
        }
      }
      
      const matchesFilters = 
        (!filtros.estadoOrden || orden.estadoOrden === filtros.estadoOrden || orden.estado === filtros.estadoOrden);
      
      return matchesSearch && matchesFecha && matchesFilters && matchesPago;
    });
  }, [searchTerm, ordenes, filtros]);

  

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "Pendiente": return "bg-red-100 text-red-800 border-red-200";
      case "En proceso": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Finalizado": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Entregado": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelado": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Completado": return "bg-green-100 text-green-800 border-green-200"; // Para compatibilidad
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleVerDetalle = (orden) => {
    navigate(`/ordenes/${orden.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md w-full">
      {/* Header con título y controles - fondo claro */}
      <div className="bg-white text-gray-800 p-4 rounded-t-lg border-b">
  {/* Page title */}
  <h2 className="text-2xl font-bold text-gray-900 mb-3">Gestion ordenes de trabajo</h2>
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center w-full">
              <Button variant="primary" onClick={onAddNew} className="text-sm text-white px-3 py-1.5 rounded-md flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span>Nueva orden</span>
              </Button>
              <div className="ml-3 flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar órdenes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg bg-white text-gray-700 w-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center space-x-2">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-gray-600" : "hover:bg-gray-700"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${viewMode === "grid" ? "bg-gray-600" : "hover:bg-gray-700"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded flex items-center space-x-1 ${showFilters ? "bg-blue-600" : "hover:bg-gray-700"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Filtros</span>
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="primary" onClick={onAddNew} className="text-sm text-white px-3 py-1.5 rounded-md flex items-center space-x-2 bg-violet-600 hover:bg-violet-700 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Nueva orden</span>
            </Button>
            <div className="ml-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg bg-white text-gray-700 w-64 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div />
          </div>
        </div>
      </div>

  {/* Barra de filtros (fondo claro) */}
  <div className="bg-white text-gray-800">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          {/* Header con contador y botón de filtros siempre visible */}
              <div className="p-3 flex justify-between items-center border-b border-gray-200">
            <div className="text-sm font-medium text-gray-700">
              {filtered.length} órdenes encontradas
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${showFilters ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
            >
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </button>
          </div>
          
          {/* Filtros expandibles */}
          {showFilters && (
            <div className="p-3 space-y-3 border-b border-gray-600">
              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 text-xs font-medium block mb-1">Desde:</label>
                  <input
                    type="date"
                    value={filtros.fechaDesde}
                    onChange={(e) => handleFiltroChange("fechaDesde", e.target.value)}
                    className="bg-white text-gray-700 px-2 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-full"
                    style={{
                      colorScheme: 'light'
                    }}
                  />
                </div>
                
                <div>
                  <label className="text-gray-700 text-xs font-medium block mb-1">Hasta:</label>
                  <input
                    type="date"
                    value={filtros.fechaHasta}
                    onChange={(e) => handleFiltroChange("fechaHasta", e.target.value)}
                    className="bg-white text-gray-700 px-2 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-full"
                    style={{
                      colorScheme: 'light'
                    }}
                  />
                </div>
              </div>
              
              {/* Selectores de estado */}
              <div className="space-y-2">
                <select
                  value={filtros.estadoOrden}
                  onChange={(e) => handleFiltroChange("estadoOrden", e.target.value)}
                  className="bg-white text-gray-700 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                >
                  <option value="">Todos los estados de orden</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="finalizada">Finalizada</option>
                  <option value="entregada">Entregada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
                
                <select
                  value={filtros.estadoPago}
                  onChange={(e) => handleFiltroChange("estadoPago", e.target.value)}
                  className="bg-white text-gray-700 px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                >
                  <option value="">Todos los estados de pago</option>
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
              
              {/* Botón limpiar filtros */}
              <div className="pt-2">
                <button
                  onClick={() => setFiltros(prev => ({ ...prev, fechaDesde: "", fechaHasta: "", estadoOrden: "", estadoPago: "" }))}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium w-full"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between p-3">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-gray-700 text-sm font-medium">Desde:</label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleFiltroChange("fechaDesde", e.target.value)}
                className="bg-white text-gray-700 px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                style={{
                  colorScheme: 'light'
                }}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-gray-700 text-sm font-medium">Hasta:</label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleFiltroChange("fechaHasta", e.target.value)}
                className="bg-white text-gray-700 px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                style={{
                  colorScheme: 'light'
                }}
              />
            </div>
            
            <button
              onClick={() => setFiltros(prev => ({ ...prev, fechaDesde: "", fechaHasta: "" }))}
              className="bg-gray-500 hover:bg-gray-400 text-white px-3 py-1 rounded text-sm"
              title="Limpiar filtros de fecha"
            >
              Limpiar fechas
            </button>
            
            <select
              value={filtros.estadoOrden}
              onChange={(e) => handleFiltroChange("estadoOrden", e.target.value)}
              className="bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Estado de orden</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En Proceso</option>
              <option value="finalizada">Finalizada</option>
              <option value="entregada">Entregada</option>
              <option value="cancelada">Cancelada</option>
            </select>
            
            {/* 'Asignado a' filter removed as requested */}
            
            <select
              value={filtros.estadoPago}
              onChange={(e) => handleFiltroChange("estadoPago", e.target.value)}
              className="bg-gray-600 text-white px-3 py-1 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Estado de pago</option>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>
          
          <div className="text-sm">
            {filtered.length} órdenes
          </div>
        </div>
      </div>

      {/* Tabla de órdenes con CustomTable */}
      <div className="p-6">
        <CustomTable
          title="Órdenes de trabajo"
          columns={["numero", "fecha", "cliente", "marcaModelo", "total", "pago", "estado"]}
          data={filtered.map((orden) => ({
            ...orden,
            pago: (orden.pago === true || orden.pago === "true" || orden.pago === "True") ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                ✓ Pagado
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                ✗ Pendiente
              </span>
            ),
            estado: <EstadoSelector orden={orden} onEstadoChange={onEstadoChange} />
          }))}
          onView={handleVerDetalle}
          onDelete={(idOrRow) => onDelete(idOrRow.id || idOrRow)}
          hideEdit={true}
        />

        {/* Vista de cards para pantallas pequeñas */}
        <div className="md:hidden space-y-4">
          {filtered.map((orden) => (
            <div key={orden.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              {/* Header del card */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{orden.numero}</span>
                  <span className="text-sm text-gray-500">{orden.fecha}</span>
                </div>
                <EstadoSelector 
                  orden={orden} 
                  onEstadoChange={onEstadoChange}
                />
              </div>

              {/* Información principal */}
              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Cliente:</span>
                  <span className="ml-2 font-medium text-gray-900">{orden.cliente}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Vehículo:</span>
                  <span className="ml-2 text-gray-700">{orden.marcaModelo}</span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Total:</span>
                    <span className="ml-2 font-semibold text-gray-900">{orden.total}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Pago:</span>
                    <span className="ml-2 text-gray-700">{orden.pago || "Pendiente"}</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleVerDetalle(orden)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded-md font-medium transition-colors"
                >
                  Ver detalle
                </button>
                {/* Editar button removed as requested */}
                <button
                  onClick={() => onDelete(orden.id)}
                  className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded-md font-medium transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron órdenes que coincidan con los filtros
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdenList;
