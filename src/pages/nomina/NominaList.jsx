import React, { useMemo, useState } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const NominaList = ({ 
  nominas, 
  loading,
  onEdit, 
  onDelete, 
  onAddNew,
  onCambiarEstado,
  onRecalcular,
  onVerDetalle
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const handleEstadoChange = (nominaData, nuevoEstado) => {
    if (window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) {
      onCambiarEstado(nominaData.id, nuevoEstado);
    }
  };

  const renderActions = (nominaData) => {
    if (nominaData.estado === 'Pagada') {
      return (
        <div className="flex gap-2 items-center justify-center">
          <button
            onClick={() => onVerDetalle(nominaData.id)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
            title="Ver detalle de empleados y sueldos"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleEstadoChange(nominaData, 'Cancelada')}
            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
            title="Cancelar nómina pagada"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      );
    }

    // Para nóminas Pendientes
    return (
      <div className="flex gap-2 items-center justify-center">
        <button
          onClick={() => onVerDetalle(nominaData.id)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
          title="Ver detalle de empleados y sueldos"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button
          onClick={() => onEdit(nominaData)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
          title="Editar nómina"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(nominaData.id)}
          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
          title="Eliminar nómina"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    );
  };

  const filteredNominas = useMemo(() => {
    if (!nominas || !Array.isArray(nominas)) return [];
    
    return nominas.filter((nomina) => {
      const matchSearch = !searchTerm || 
        (nomina.periodo && nomina.periodo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (nomina.mes && nomina.mes.toString().includes(searchTerm));
      
      const matchEstado = !filterEstado || nomina.estado === filterEstado;
      
      return matchSearch && matchEstado;
    });
  }, [searchTerm, filterEstado, nominas]);

  const columns = ["periodo", "mes", "fecha_inicio", "fecha_corte", "estado_badge", "cant_empleados", "total_formatted", "acciones"];

  const tableData = filteredNominas.map((nomina) => ({
    id: nomina.id,
    periodo: nomina.periodo || `${nomina.mes}/${new Date(nomina.fecha_inicio).getFullYear()}`,
    mes: nomina.mes || '',
    fecha_inicio: nomina.fecha_inicio || '',
    fecha_corte: nomina.fecha_corte || '',
    estado_badge: (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
        nomina.estado === 'Pagada' ? 'bg-green-100 text-green-700 border border-green-300' :
        nomina.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
        'bg-red-100 text-red-700 border border-red-300'
      }`}>
        {nomina.estado}
      </span>
    ),
    cant_empleados: nomina.cantidad_empleados || 0,
    total_formatted: (
      <span className="font-semibold text-gray-800">
        {nomina.total_nomina ? `Bs. ${parseFloat(nomina.total_nomina).toFixed(2)}` : 'Bs. 0.00'}
      </span>
    ),
    estado: nomina.estado,
    acciones: renderActions(nomina),
    _originalData: nomina
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de Nóminas
      </h2>
      
      <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
        <Button variant="guardar" onClick={onAddNew}>
          ➕ Nueva Nómina
        </Button>
        
        <div className="flex gap-4 flex-1 justify-end flex-wrap">
          <input
            type="text"
            placeholder="Buscar por período o mes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md px-3 py-2 bg-white text-gray-700 w-64"
          />
          
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="border rounded-md px-3 py-2 bg-white text-gray-700"
          >
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Pagada">Pagada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando nóminas...</div>
      ) : (
        <CustomTable
          columns={columns}
          data={tableData}
          onEdit={(row) => onEdit(row._originalData)}
          onDelete={(id) => onDelete(id)}
          hideEdit={true}
        />
      )}
    </div>
  );
};

export default NominaList;
