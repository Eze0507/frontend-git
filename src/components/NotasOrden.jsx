import React, { useState, useEffect } from "react";
import { fetchNotasOrden, createNotaOrden, deleteNotaOrden, transformNotaFromAPI } from "../api/ordenesApi.jsx";

const NotasOrden = ({ ordenId, readOnly = false }) => {
  const [notas, setNotas] = useState([]);
  const [nuevaNota, setNuevaNota] = useState("");
  const [loading, setLoading] = useState(true);
  const [creandoNota, setCreandoNota] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ordenId) {
      loadNotas();
    }
  }, [ordenId]);

  const loadNotas = async () => {
    try {
      setLoading(true);
      setError(null);
      const notasData = await fetchNotasOrden(ordenId);
      const notasTransformadas = notasData.map(transformNotaFromAPI);
      setNotas(notasTransformadas);
    } catch (error) {
      console.error("Error cargando notas:", error);
      setError("Error al cargar las notas");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearNota = async () => {
    if (!nuevaNota.trim()) return;
    
    try {
      setCreandoNota(true);
      setError(null);
      const notaCreada = await createNotaOrden(ordenId, nuevaNota.trim());
      const notaTransformada = transformNotaFromAPI(notaCreada);
      setNotas(prev => [notaTransformada, ...prev]);
      setNuevaNota("");
    } catch (error) {
      console.error("Error creando nota:", error);
      setError("Error al crear la nota");
    } finally {
      setCreandoNota(false);
    }
  };

  const handleEliminarNota = async (notaId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
      return;
    }

    try {
      setError(null);
      await deleteNotaOrden(ordenId, notaId);
      setNotas(prev => prev.filter(nota => nota.id !== notaId));
    } catch (error) {
      console.error("Error eliminando nota:", error);
      setError("Error al eliminar la nota");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleCrearNota();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-600">Cargando notas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Formulario para nueva nota - Solo visible para admin/empleado */}
      {!readOnly && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agregar nueva nota
          </label>
          <textarea
            value={nuevaNota}
            onChange={(e) => setNuevaNota(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu nota aquí..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={creandoNota}
          />
          <div className="flex justify-end items-center mt-2">
            <button
              onClick={handleCrearNota}
              disabled={!nuevaNota.trim() || creandoNota}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {creandoNota ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                "Agregar nota"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Lista de notas */}
      <div className="space-y-3">
        {notas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No hay notas registradas para esta orden</p>
            <p className="text-xs text-gray-400 mt-1">Agrega la primera nota usando el formulario de arriba</p>
          </div>
        ) : (
          notas.map((nota) => (
            <div key={nota.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {nota.contenido}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {nota.fecha}
                  </div>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => handleEliminarNota(nota.id)}
                    className="ml-3 text-gray-400 hover:text-red-600 transition-colors"
                    title="Eliminar nota"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Información adicional */}
      {notas.length > 0 && (
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
          {notas.length} nota{notas.length !== 1 ? 's' : ''} registrada{notas.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default NotasOrden;