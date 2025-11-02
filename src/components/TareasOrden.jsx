import React, { useState, useEffect } from "react";
import { fetchTareasOrden, createTareaOrden, deleteTareaOrden, updateTareaOrden, transformTareaFromAPI } from "../api/ordenesApi.jsx";

const TareasOrden = ({ ordenId, readOnly = false }) => {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [loading, setLoading] = useState(true);
  const [creandoTarea, setCreandoTarea] = useState(false);
  const [error, setError] = useState(null);
  const [actualizandoTarea, setActualizandoTarea] = useState(null);

  useEffect(() => {
    if (ordenId) {
      loadTareas();
    }
  }, [ordenId]);

  const loadTareas = async () => {
    try {
      setLoading(true);
      setError(null);
      const tareasData = await fetchTareasOrden(ordenId);
      const tareasTransformadas = tareasData.map(transformTareaFromAPI);
      setTareas(tareasTransformadas);
    } catch (error) {
      console.error("Error cargando tareas:", error);
      setError("Error al cargar las tareas");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTarea = async () => {
    if (!nuevaTarea.trim()) return;
    
    try {
      setCreandoTarea(true);
      setError(null);
      console.log('Intentando crear tarea con ordenId:', ordenId, 'descripcion:', nuevaTarea.trim());
      
      const tareaCreada = await createTareaOrden(ordenId, nuevaTarea.trim());
      console.log('Tarea creada recibida del backend:', tareaCreada);
      
      const tareaTransformada = transformTareaFromAPI(tareaCreada);
      console.log('Tarea transformada:', tareaTransformada);
      
      setTareas(prev => [...prev, tareaTransformada]);
      setNuevaTarea("");
    } catch (error) {
      console.error("Error creando tarea:", error);
      setError(error.message || "Error al crear la tarea");
    } finally {
      setCreandoTarea(false);
    }
  };

  const handleToggleCompletada = async (tareaId, completada) => {
    try {
      setActualizandoTarea(tareaId);
      setError(null);
      const tareaActualizada = await updateTareaOrden(ordenId, tareaId, !completada);
      const tareaTransformada = transformTareaFromAPI(tareaActualizada);
      
      setTareas(prev => 
        prev.map(tarea => 
          tarea.id === tareaId ? tareaTransformada : tarea
        )
      );
    } catch (error) {
      console.error("Error actualizando tarea:", error);
      setError("Error al actualizar el estado de la tarea");
    } finally {
      setActualizandoTarea(null);
    }
  };

  const handleEliminarTarea = async (tareaId) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      return;
    }

    try {
      setError(null);
      await deleteTareaOrden(ordenId, tareaId);
      setTareas(prev => prev.filter(tarea => tarea.id !== tareaId));
    } catch (error) {
      console.error("Error eliminando tarea:", error);
      setError("Error al eliminar la tarea");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleCrearTarea();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-600">Cargando tareas...</div>
      </div>
    );
  }

  const tareasCompletadas = tareas.filter(tarea => tarea.completada);
  const tareasPendientes = tareas.filter(tarea => !tarea.completada);

  return (
    <div className="space-y-3">
      {/* Formulario compacto para nueva tarea */}
      {!readOnly && (
        <div className="bg-gray-50 p-2 rounded-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">Agregar tarea</label>
          <div className="flex space-x-2 items-center">
            <input
              type="text"
              value={nuevaTarea}
              onChange={(e) => setNuevaTarea(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Descripción..."
              className="flex-1 px-2 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              disabled={creandoTarea}
              maxLength={200}
            />
            <button
              onClick={handleCrearTarea}
              disabled={!nuevaTarea.trim() || creandoTarea}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-1 rounded-md text-sm transition-colors"
            >
              {creandoTarea ? '...' : 'Agregar'}
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

      {/* Estadísticas */}
      {tareas.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 p-2 rounded-md text-sm">
          <div className="flex justify-between">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-700">{tareas.length}</div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-700">{tareasCompletadas.length}</div>
              <div className="text-xs text-green-600">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-700">{tareasPendientes.length}</div>
              <div className="text-xs text-orange-600">Pendientes</div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de tareas */}
      <div className="space-y-3">
        {tareas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-sm">No hay tareas registradas para esta orden</p>
            <p className="text-xs text-gray-400 mt-1">Agrega la primera tarea usando el formulario de arriba</p>
          </div>
        ) : (
          <>
            {/* Tareas pendientes */}
            {tareasPendientes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  Tareas Pendientes ({tareasPendientes.length})
                </h4>
                {tareasPendientes.map((tarea) => (
                      <div key={tarea.id} className="bg-white border border-gray-100 rounded-md p-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            {!readOnly ? (
                              <button
                                onClick={() => handleToggleCompletada(tarea.id, tarea.completada)}
                                disabled={actualizandoTarea === tarea.id}
                                className="flex-shrink-0 w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center text-sm"
                                title="Marcar como completada"
                              >
                                {actualizandoTarea === tarea.id ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> : ''}
                              </button>
                            ) : (
                              <div className="flex-shrink-0 w-4 h-4 border-2 border-gray-300 rounded"></div>
                            )}
                            <span className="text-sm text-gray-800 flex-1">{tarea.descripcion}</span>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Pendiente</span>
                          </div>
                          {!readOnly && (
                            <button onClick={() => handleEliminarTarea(tarea.id)} className="ml-2 text-gray-400 hover:text-red-600 text-sm" title="Eliminar tarea">✖</button>
                          )}
                        </div>
                      </div>
                    ))}
              </div>
            )}

            {/* Tareas completadas */}
            {tareasCompletadas.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Tareas Completadas ({tareasCompletadas.length})
                </h4>
                {tareasCompletadas.map((tarea) => (
                  <div key={tarea.id} className="bg-green-50 border border-green-100 rounded-md p-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        {!readOnly ? (
                          <button
                            onClick={() => handleToggleCompletada(tarea.id, tarea.completada)}
                            disabled={actualizandoTarea === tarea.id}
                            className="flex-shrink-0 w-4 h-4 bg-green-500 border-2 border-green-500 rounded flex items-center justify-center text-sm"
                            title="Marcar como pendiente"
                          >
                            {actualizandoTarea === tarea.id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : '✓'}
                          </button>
                        ) : (
                          <div className="flex-shrink-0 w-4 h-4 bg-green-500 border-2 border-green-500 rounded flex items-center justify-center text-sm text-white">✓</div>
                        )}
                        <span className="text-sm text-gray-600 flex-1 line-through">{tarea.descripcion}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Completada</span>
                      </div>
                      {!readOnly && (
                        <button onClick={() => handleEliminarTarea(tarea.id)} className="ml-2 text-gray-400 hover:text-red-600 text-sm">✖</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TareasOrden;