import React, { useState, useEffect } from 'react';
import { fetchInspecciones, deleteInspeccion } from '../api/ordenesApi.jsx';
import FormularioInspeccion from './FormularioInspeccion.jsx';

const HistorialInspecciones = ({ ordenId, readOnly = false }) => {
  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInspeccion, setEditingInspeccion] = useState(null);

  useEffect(() => {
    loadInspecciones();
  }, [ordenId]);

  const loadInspecciones = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando inspecciones para orden:', ordenId);
      const data = await fetchInspecciones(ordenId);
      setInspecciones(data);
    } catch (error) {
      console.error('❌ Error cargando inspecciones:', error);
      setInspecciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingInspeccion(null);
    setShowForm(true);
  };

  const handleEdit = (inspeccion) => {
    setEditingInspeccion(inspeccion);
    setShowForm(true);
  };

  const handleDelete = async (inspeccionId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta inspección?')) {
      return;
    }

    try {
      await deleteInspeccion(ordenId, inspeccionId);
      loadInspecciones(); // Recargar la lista
    } catch (error) {
      console.error('Error eliminando inspección:', error);
      alert('Error eliminando inspección: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingInspeccion(null);
    loadInspecciones(); // Recargar la lista
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingInspeccion(null);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'bueno':
        return 'text-green-600 bg-green-100';
      case 'malo':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'alto':
        return 'text-green-600 bg-green-100';
      case 'medio':
        return 'text-yellow-600 bg-yellow-100';
      case 'bajo':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTipoInspeccionBadge = (tipo) => {
    return tipo === 'ingreso' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <FormularioInspeccion
        inspeccion={editingInspeccion}
        ordenId={ordenId}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Historial de Inspecciones</h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {inspecciones.length} {inspecciones.length === 1 ? 'inspección' : 'inspecciones'}
          </span>
          {!readOnly && (
            <button
              onClick={handleCreate}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Nueva Inspección
            </button>
          )}
        </div>
      </div>

      {inspecciones.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No hay inspecciones registradas para esta orden</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inspecciones.map((inspeccion) => (
            <div key={inspeccion.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {/* Header de la inspección */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoInspeccionBadge(inspeccion.tipo_inspeccion)}`}>
                    {inspeccion.tipo_inspeccion === 'ingreso' ? 'Ingreso' : 'Salida'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatearFecha(inspeccion.fecha)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {inspeccion.tecnico && (
                    <span className="text-sm text-gray-500">
                      Técnico: {inspeccion.tecnico}
                    </span>
                  )}
                  {!readOnly && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(inspeccion)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Editar inspección"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(inspeccion.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Eliminar inspección"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid de elementos inspeccionados */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                {inspeccion.aceite_motor && (
                  <div className="text-xs">
                    <span className="text-gray-600">Aceite motor:</span>
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getEstadoColor(inspeccion.aceite_motor)}`}>
                      {inspeccion.aceite_motor === 'bueno' ? 'Bueno' : 'Malo'}
                    </span>
                  </div>
                )}
                
                {inspeccion.Filtros_VH && (
                  <div className="text-xs">
                    <span className="text-gray-600">Filtros:</span>
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getEstadoColor(inspeccion.Filtros_VH)}`}>
                      {inspeccion.Filtros_VH === 'bueno' ? 'Bueno' : 'Malo'}
                    </span>
                  </div>
                )}

                {inspeccion.nivel_refrigerante && (
                  <div className="text-xs">
                    <span className="text-gray-600">Refrigerante:</span>
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getNivelColor(inspeccion.nivel_refrigerante)}`}>
                      {inspeccion.nivel_refrigerante.charAt(0).toUpperCase() + inspeccion.nivel_refrigerante.slice(1)}
                    </span>
                  </div>
                )}

                {inspeccion.pastillas_freno && (
                  <div className="text-xs">
                    <span className="text-gray-600">Pastillas freno:</span>
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getEstadoColor(inspeccion.pastillas_freno)}`}>
                      {inspeccion.pastillas_freno === 'bueno' ? 'Bueno' : 'Malo'}
                    </span>
                  </div>
                )}

                {inspeccion.Estado_neumaticos && (
                  <div className="text-xs">
                    <span className="text-gray-600">Neumáticos:</span>
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getEstadoColor(inspeccion.Estado_neumaticos)}`}>
                      {inspeccion.Estado_neumaticos === 'bueno' ? 'Bueno' : 'Malo'}
                    </span>
                  </div>
                )}

                {inspeccion.estado_bateria && (
                  <div className="text-xs">
                    <span className="text-gray-600">Batería:</span>
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getNivelColor(inspeccion.estado_bateria)}`}>
                      {inspeccion.estado_bateria.charAt(0).toUpperCase() + inspeccion.estado_bateria.slice(1)}
                    </span>
                  </div>
                )}

                {inspeccion.estado_luces && (
                  <div className="text-xs">
                    <span className="text-gray-600">Luces:</span>
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getEstadoColor(inspeccion.estado_luces)}`}>
                      {inspeccion.estado_luces === 'bueno' ? 'Bueno' : 'Malo'}
                    </span>
                  </div>
                )}
              </div>

              {/* Observaciones */}
              {inspeccion.observaciones_generales && (
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 font-medium mb-1">Observaciones:</p>
                  <p className="text-sm text-gray-700">{inspeccion.observaciones_generales}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialInspecciones;