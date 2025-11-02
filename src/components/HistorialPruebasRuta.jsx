import React, { useState, useEffect } from 'react';
import { fetchPruebasRuta, deletePruebaRuta } from '../api/ordenesApi.jsx';
import FormularioPruebaRuta from './FormularioPruebaRuta.jsx';

const HistorialPruebasRuta = ({ ordenId, readOnly = false }) => {
  const [pruebasRuta, setPruebasRuta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPrueba, setEditingPrueba] = useState(null);

  useEffect(() => {
    loadPruebasRuta();
  }, [ordenId]);

  const loadPruebasRuta = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando pruebas de ruta para orden:', ordenId);
      const data = await fetchPruebasRuta(ordenId);
      setPruebasRuta(data);
    } catch (error) {
      console.error('❌ Error cargando pruebas de ruta:', error);
      setPruebasRuta([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPrueba(null);
    setShowForm(true);
  };

  const handleEdit = (prueba) => {
    setEditingPrueba(prueba);
    setShowForm(true);
  };

  const handleDelete = async (pruebaId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta prueba de ruta?')) {
      return;
    }

    try {
      await deletePruebaRuta(ordenId, pruebaId);
      loadPruebasRuta(); // Recargar la lista
    } catch (error) {
      console.error('Error eliminando prueba de ruta:', error);
      alert('Error eliminando prueba de ruta: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPrueba(null);
    loadPruebasRuta(); // Recargar la lista después de crear/editar
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'bueno':
        return 'bg-green-100 text-green-800';
      case 'regular':
        return 'bg-yellow-100 text-yellow-800';
      case 'malo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showForm) {
    return (
      <FormularioPruebaRuta
        ordenId={ordenId}
        prueba={editingPrueba}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingPrueba(null);
        }}
      />
    );
  }

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Historial de Pruebas de Ruta</h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            {pruebasRuta.length} {pruebasRuta.length === 1 ? 'prueba' : 'pruebas'}
          </span>
          {!readOnly && (
            <button
              onClick={handleCreate}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Nueva Prueba
            </button>
          )}
        </div>
      </div>

      {pruebasRuta.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No hay pruebas de ruta</h4>
          <p className="text-gray-500 text-sm">Registra la primera prueba de ruta para este vehículo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pruebasRuta.map((prueba) => (
            <div key={prueba.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Prueba #{prueba.id} - {prueba.tipo_prueba.charAt(0).toUpperCase() + prueba.tipo_prueba.slice(1)}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(prueba.fecha_prueba).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {prueba.tecnico && (
                    <span className="text-sm text-gray-500">
                      Técnico: {prueba.tecnico.nombre} {prueba.tecnico.apellido}
                    </span>
                  )}
                  {!readOnly && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(prueba)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        title="Editar prueba"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(prueba.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        title="Eliminar prueba"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid de componentes evaluados */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                <div className="text-xs">
                  <span className="text-gray-600">Frenos:</span>
                  <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getEstadoColor(prueba.frenos)}`}>
                    {prueba.frenos.charAt(0).toUpperCase() + prueba.frenos.slice(1)}
                  </span>
                </div>
                
                <div className="text-xs">
                  <span className="text-gray-600">Motor:</span>
                  <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getEstadoColor(prueba.motor)}`}>
                    {prueba.motor.charAt(0).toUpperCase() + prueba.motor.slice(1)}
                  </span>
                </div>

                <div className="text-xs">
                  <span className="text-gray-600">Suspensión:</span>
                  <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getEstadoColor(prueba.suspension)}`}>
                    {prueba.suspension.charAt(0).toUpperCase() + prueba.suspension.slice(1)}
                  </span>
                </div>

                <div className="text-xs">
                  <span className="text-gray-600">Dirección:</span>
                  <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getEstadoColor(prueba.direccion)}`}>
                    {prueba.direccion.charAt(0).toUpperCase() + prueba.direccion.slice(1)}
                  </span>
                </div>
              </div>

              {/* Información adicional condensada */}
              <div className="text-xs text-gray-600 space-y-1">
                {(prueba.kilometraje_inicio || prueba.kilometraje_final) && (
                  <div>
                    <span className="font-medium">Kilometraje:</span> 
                    {prueba.kilometraje_inicio && ` Inicio: ${prueba.kilometraje_inicio}km`}
                    {prueba.kilometraje_final && ` | Final: ${prueba.kilometraje_final}km`}
                  </div>
                )}
                {prueba.ruta && (
                  <div>
                    <span className="font-medium">Ruta:</span> {prueba.ruta}
                  </div>
                )}
                {prueba.observaciones && (
                  <div>
                    <span className="font-medium">Observaciones:</span> {prueba.observaciones}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialPruebasRuta;