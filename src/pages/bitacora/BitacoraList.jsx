import React, { useState, useEffect } from 'react';
import { bitacoraApi } from '../../api/bitacoraApi';
import Button from '../../components/button';

const BitacoraList = () => {
  const [bitacora, setBitacora] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    ip_filter: ''
  });
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current: 1
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadBitacora();
  }, []);

  // Cargar bitácora con filtros
  const loadBitacora = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        ...filters
      };
      
      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await bitacoraApi.getBitacora(params);
      
      // El backend está devolviendo un array directo, no un objeto con results
      const data = Array.isArray(response) ? response : (response.results || []);
      
      setBitacora(data);
      setPagination({
        count: data.length,
        next: null,
        previous: null,
        current: page
      });
    } catch (err) {
      setError('Error al cargar la bitácora');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // Manejar cambios en filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Aplicar filtros
  const handleApplyFilters = () => {
    loadBitacora(1);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      search: '',
      ip_filter: ''
    });
    loadBitacora(1);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Obtener color para acción
  const getActionColor = (accion) => {
    switch (accion) {
      case 'CREAR': return 'text-green-600 bg-green-100';
      case 'EDITAR': return 'text-blue-600 bg-blue-100';
      case 'ELIMINAR': return 'text-red-600 bg-red-100';
      case 'LOGIN': return 'text-purple-600 bg-purple-100';
      case 'LOGOUT': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Obtener color para módulo
  const getModuleColor = (modulo) => {
    switch (modulo) {
      case 'Cargo': return 'text-indigo-600 bg-indigo-100';
      case 'Cliente': return 'text-cyan-600 bg-cyan-100';
      case 'Empleado': return 'text-emerald-600 bg-emerald-100';
      case 'Vehiculo': return 'text-amber-600 bg-amber-100';
      case 'Autenticacion': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      key: 'fecha_accion',
      label: 'Fecha',
      render: (value) => formatDate(value)
    },
    {
      key: 'usuario_nombre',
      label: 'Usuario',
      render: (value) => (
        <div className="font-medium">{value || 'Sistema'}</div>
      )
    },
    {
      key: 'ip_address',
      label: 'IP',
      render: (value) => (
        <div className="text-sm font-mono text-gray-600">
          {value || '-'}
        </div>
      )
    },
    {
      key: 'accion',
      label: 'Acción',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'modulo',
      label: 'Módulo',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModuleColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (value) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-900 break-words">{value}</p>
        </div>
      )
    }
  ];

  if (loading && bitacora.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando bitácora...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bitácora del Sistema</h1>
          <p className="text-gray-600">Registro de todas las acciones realizadas en el sistema</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {pagination.count} registros
        </div>
      </div>

      {/* Búsqueda simple */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Buscar en bitácora</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar en descripción
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Buscar en descripción..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por IP
            </label>
            <input
              type="text"
              name="ip_filter"
              value={filters.ip_filter}
              onChange={handleFilterChange}
              placeholder="Ej: 192.168.1.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <Button onClick={handleApplyFilters} variant="primary">
            Buscar
          </Button>
          <Button onClick={handleClearFilters} variant="secondary">
            Limpiar
          </Button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Registros de Bitácora</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg">Cargando...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-red-600">{error}</div>
          </div>
        ) : bitacora.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">No hay registros de bitácora</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bitacora.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {pagination.count > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Mostrando {bitacora.length} de {pagination.count} registros
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => loadBitacora(pagination.current - 1)}
              disabled={!pagination.previous}
              variant="secondary"
            >
              Anterior
            </Button>
            <span className="px-3 py-2 text-sm">
              Página {pagination.current}
            </span>
            <Button
              onClick={() => loadBitacora(pagination.current + 1)}
              disabled={!pagination.next}
              variant="secondary"
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BitacoraList;
