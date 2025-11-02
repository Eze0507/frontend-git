import React, { useState, useEffect, useMemo } from 'react';
import { fetchAsignaciones, createAsignacion, deleteAsignacion, fetchEmpleados } from '../api/ordenesApi.jsx';

const AsignacionesTecnicos = ({ ordenId, readOnly = false }) => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);
  const [selectedTecnico, setSelectedTecnico] = useState('');
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTecnicoObj, setSelectedTecnicoObj] = useState(null);
  const [error, setError] = useState(null);

  // Error boundary para el componente
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error en Asignaciones</h3>
          <p className="text-red-600">{error.message}</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    try {
      loadAsignaciones();
      loadEmpleados();
    } catch (err) {
      console.error('❌ Error en useEffect inicial:', err);
      setError(err);
    }
  }, [ordenId]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.tecnico-search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const loadAsignaciones = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando asignaciones para orden:', ordenId);
      const data = await fetchAsignaciones(ordenId);
      setAsignaciones(data);
    } catch (error) {
      console.error('❌ Error cargando asignaciones:', error);
      setAsignaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEmpleados = async () => {
    try {
      setLoadingEmpleados(true);
      console.log('🔄 Iniciando carga de empleados...');
      const data = await fetchEmpleados();
      console.log('✅ Empleados cargados exitosamente:', data);
      console.log('📊 Estructura del primer empleado:', data[0]);
      setEmpleados(data || []);
      setError(null); // Limpiar error si la carga es exitosa
    } catch (error) {
      console.error('❌ Error cargando empleados:', error);
      setEmpleados([]);
      setError(error);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const handleAddTecnico = async () => {
    if (!selectedTecnico) {
      alert('Por favor selecciona un técnico');
      return;
    }

    // Verificar si el técnico ya está asignado
    const yaAsignado = asignaciones.some(asignacion => 
      asignacion.tecnico && asignacion.tecnico.toString() === selectedTecnico.toString()
    );

    if (yaAsignado) {
      alert('Este técnico ya está asignado a esta orden');
      return;
    }

    try {
      setAdding(true);
      await createAsignacion(ordenId, selectedTecnico);
      setSelectedTecnico('');
      setSearchTerm('');
      setSelectedTecnicoObj(null);
      setShowDropdown(false);
      loadAsignaciones(); // Recargar la lista
    } catch (error) {
      console.error('Error añadiendo técnico:', error);
      alert('Error añadiendo técnico: ' + (error.response?.data?.message || error.message));
    } finally {
      setAdding(false);
    }
  };

  const handleSelectTecnico = (empleado) => {
    try {
      console.log('👤 Seleccionando técnico:', empleado);
      setSelectedTecnicoObj(empleado);
      setSelectedTecnico(empleado.id);
      const nombreCompleto = `${empleado.nombre || ''} ${empleado.apellido || ''}`.trim();
      setSearchTerm(nombreCompleto || 'Técnico sin nombre');
      setShowDropdown(false);
    } catch (err) {
      console.error('❌ Error en handleSelectTecnico:', err);
      setError(err);
    }
  };

  const handleSearchChange = (e) => {
    try {
      const value = e.target.value;
      console.log('🔍 Búsqueda cambiada:', value);
      setSearchTerm(value);
      setShowDropdown(true);
      
      // Si se borra todo el texto, limpiar la selección
      if (!value.trim()) {
        setSelectedTecnico('');
        setSelectedTecnicoObj(null);
      }
    } catch (err) {
      console.error('❌ Error en handleSearchChange:', err);
      setError(err);
    }
  };

  const handleTecnicoClear = () => {
    setSelectedTecnicoObj(null);
    setSelectedTecnico('');
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    console.log('🎯 Input focused, showDropdown:', showDropdown);
    setShowDropdown(true);
  };

  const handleInputClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️ Input clicked, current showDropdown:', showDropdown);
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // Delay para permitir click en dropdown
    console.log('🔍 Input blur, delaying dropdown close');
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handleRemoveTecnico = async (asignacionId) => {
    if (!window.confirm('¿Estás seguro de que quieres quitar este técnico de la orden?')) {
      return;
    }

    try {
      await deleteAsignacion(ordenId, asignacionId);
      loadAsignaciones(); // Recargar la lista
    } catch (error) {
      console.error('Error eliminando asignación:', error);
      alert('Error eliminando asignación: ' + (error.response?.data?.message || error.message));
    }
  };

  // Obtener empleados disponibles (no asignados)
  const empleadosDisponibles = useMemo(() => {
    try {
      if (!Array.isArray(empleados) || !Array.isArray(asignaciones)) {
        console.warn('⚠️ empleados o asignaciones no son arrays válidos');
        return [];
      }
      
      return empleados.filter(empleado => 
        !asignaciones.some(asignacion => 
          asignacion.tecnico && asignacion.tecnico.toString() === empleado.id.toString()
        )
      );
    } catch (err) {
      console.error('❌ Error en empleadosDisponibles:', err);
      return [];
    }
  }, [empleados, asignaciones]);

  // Filtrar empleados basado en búsqueda
  const filteredEmpleados = useMemo(() => {
    try {
      if (!Array.isArray(empleadosDisponibles)) {
        console.warn('⚠️ empleadosDisponibles no es un array válido');
        return [];
      }
      
      if (!searchTerm.trim()) return empleadosDisponibles.slice(0, 10); // Mostrar solo los primeros 10 si no hay búsqueda
      
      const searchTermLower = searchTerm.toLowerCase();
      return empleadosDisponibles.filter(empleado => {
        if (!empleado || !empleado.nombre || !empleado.apellido) {
          console.warn('⚠️ Empleado con datos incompletos:', empleado);
          return false;
        }
        const nombreCompleto = `${empleado.nombre} ${empleado.apellido}`.toLowerCase();
        return nombreCompleto.includes(searchTermLower);
      }).slice(0, 10); // Limitar a 10 resultados
    } catch (err) {
      console.error('❌ Error en filteredEmpleados:', err);
      return [];
    }
  }, [empleadosDisponibles, searchTerm]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-medium text-gray-900">Técnicos</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {asignaciones.length} {asignaciones.length === 1 ? 'técnico' : 'técnicos'}
          </span>
        </div>
      </div>

      {/* Formulario compacto para añadir técnico */}
      {!readOnly && (
        <div className="bg-white rounded-md p-2 mb-3 border border-gray-100 w-full tecnico-search-container">
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onClick={handleInputClick}
              onBlur={handleInputBlur}
              placeholder="Buscar técnico..."
              className="flex-1 min-w-0 pl-3 pr-2 py-2 border border-gray-200 rounded-md text-sm"
              disabled={adding || loadingEmpleados}
            />
            <button
              onClick={handleAddTecnico}
              disabled={!selectedTecnico || adding || loadingEmpleados}
              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm disabled:opacity-60 flex-shrink-0 h-9"
            >
              {adding ? '...' : 'Asignar'}
            </button>
          </div>
        {showDropdown && (
          <div className="mt-2 bg-white border border-gray-100 rounded-md shadow-sm max-h-40 overflow-y-auto">
            {filteredEmpleados.length > 0 ? (
              filteredEmpleados.map(emp => (
                <div
                  key={emp.id}
                  onClick={() => handleSelectTecnico(emp)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                >
                  {emp.nombre} {emp.apellido}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500">{searchTerm.trim() ? 'No se encontraron técnicos' : 'Escribe para buscar'}</div>
            )}
          </div>
        )}
        </div>
      )}

      {/* Lista compacta de técnicos asignados */}
      {asignaciones.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-600">No hay técnicos asignados</div>
      ) : (
        <div className="space-y-2">
          {asignaciones.map((asignacion) => (
            <div key={asignacion.id} className="bg-white rounded-md p-3 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-base"> 
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{asignacion.tecnico_nombre || 'Técnico'}</div>
                  <div className="text-xs text-gray-500">{new Date(asignacion.fecha_asignacion).toLocaleDateString('es-ES')}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">Activo</span>
                {!readOnly && (
                  <button
                    onClick={() => handleRemoveTecnico(asignacion.id)}
                    className="p-1 text-red-600 hover:text-red-800 rounded-md"
                    title="Quitar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AsignacionesTecnicos;