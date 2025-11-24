import React, { useState, useEffect } from 'react';
import { 
  fetchAllAsistencias, 
  fetchReporteMensual
} from '../../api/asistenciasApi';
import { fetchAllEmpleados } from '../../api/empleadosApi';
import { FaCalendarAlt, FaUser, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaFileDownload } from 'react-icons/fa';

const AsistenciaPage = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    fecha: '', // Sin fecha por defecto para mostrar todas las asistencias
    empleado_id: '',
    estado: ''
  });
  const [reporteMensual, setReporteMensual] = useState(null);
  const [mostrarReporte, setMostrarReporte] = useState(false);

  useEffect(() => {
    loadEmpleados();
    loadAsistencias();
  }, []);

  useEffect(() => {
    if (!mostrarReporte) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [mostrarReporte]);

  const loadEmpleados = async () => {
    try {
      const data = await fetchAllEmpleados();
      setEmpleados(data);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
    }
  };

  const loadAsistencias = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[ASISTENCIAS PAGE] 🔄 Cargando asistencias con filtros:', filters);
      const data = await fetchAllAsistencias(filters);
      console.log('[ASISTENCIAS PAGE] ✅ Datos recibidos:', data);
      console.log('[ASISTENCIAS PAGE] Tipo:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('[ASISTENCIAS PAGE] Cantidad:', Array.isArray(data) ? data.length : 'No es array');
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('[ASISTENCIAS PAGE] 📋 Primeras 3 asistencias:', data.slice(0, 3).map(a => ({
          id: a.id,
          empleado: a.nombre_empleado || `${a.empleado?.nombre} ${a.empleado?.apellido}`,
          fecha: a.fecha,
          hora_entrada: a.hora_entrada,
          hora_salida: a.hora_salida
        })));
      }
      
      const asistenciasArray = Array.isArray(data) ? data : [];
      setAsistencias(asistenciasArray);
      
      if (asistenciasArray.length === 0) {
        console.warn('[ASISTENCIAS PAGE] ⚠️ No se encontraron asistencias. Verifica:');
        console.warn('[ASISTENCIAS PAGE] - Que haya asistencias marcadas desde móvil');
        console.warn('[ASISTENCIAS PAGE] - Que las asistencias tengan tenant asignado');
        console.warn('[ASISTENCIAS PAGE] - Que el admin tenga el mismo tenant que los empleados');
      }
    } catch (err) {
      console.error('[ASISTENCIAS PAGE] ❌ Error completo:', err);
      setError('Error al cargar asistencias: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilters = () => {
    loadAsistencias();
  };

  const handleClearFilters = () => {
    setFilters({
      fecha: '', // Sin fecha para mostrar todas
      empleado_id: '',
      estado: ''
    });
    setTimeout(() => loadAsistencias(), 100);
  };

  const handleGenerarReporteMensual = async () => {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    
    setLoading(true);
    try {
      const data = await fetchReporteMensual(año, mes);
      setReporteMensual(data);
      setMostrarReporte(true);
    } catch (err) {
      setError('Error al generar reporte mensual');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'completo': { 
        label: 'Completo', 
        color: 'bg-green-100 text-green-800',
        icon: <FaCheckCircle className="inline mr-1" />
      },
      'incompleto': { 
        label: 'Incompleto', 
        color: 'bg-red-100 text-red-800',
        icon: <FaTimesCircle className="inline mr-1" />
      },
      'extra': { 
        label: 'Extra', 
        color: 'bg-blue-100 text-blue-800',
        icon: <FaExclamationCircle className="inline mr-1" />
      }
    };
    
    const estadoInfo = estados[estado] || { label: estado, color: 'bg-gray-100 text-gray-800', icon: null };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color} flex items-center justify-center w-fit`}>
        {estadoInfo.icon}
        {estadoInfo.label}
      </span>
    );
  };

  const formatTime = (timeString) => {
    try {
      if (!timeString) return '-';
      if (typeof timeString !== 'string') return '-';
      return timeString.substring(0, 5); // HH:MM
    } catch (err) {
      console.error('Error al formatear hora:', err);
      return '-';
    }
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return '-';
      const normalized = dateString.split('T')[0];
      const [year, month, day] = normalized.split('-');
      if (!year || !month || !day) return dateString;
      return `${day}/${month}/${year}`;
    } catch (err) {
      console.error('Error al formatear fecha:', err);
      return '-';
    }
  };

  // Error boundary - si hay un error crítico, mostrar mensaje en lugar de pantalla en blanco
  if (error && !loading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error al cargar asistencias</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadAsistencias();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reporte de Asistencias</h1>
        <p className="text-gray-600">Gestiona y visualiza las asistencias de los empleados</p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-blue-600" />
          Filtros
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha (opcional)
            </label>
            <input
              type="date"
              name="fecha"
              value={filters.fecha}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dejar vacío para todas"
            />
            <p className="text-xs text-gray-500 mt-1">Dejar vacío para ver todas las asistencias</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empleado
            </label>
            <select
              name="empleado_id"
              value={filters.empleado_id}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellido}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={filters.estado}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="completo">Completo</option>
              <option value="incompleto">Incompleto</option>
              <option value="extra">Extra</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Filtrar
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Botón para generar reporte mensual */}
      <div className="mb-6">
        <button
          onClick={handleGenerarReporteMensual}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <FaFileDownload />
          Generar Reporte Mensual
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabla de asistencias */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Cargando asistencias...</span>
        </div>
      ) : mostrarReporte && reporteMensual ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-blue-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                Reporte Mensual - {reporteMensual.mes}/{reporteMensual.año}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Días hábiles del mes: <span className="font-semibold">{reporteMensual.dias_habiles_mes || '-'}</span>
              </p>
            </div>
            <button
              onClick={() => setMostrarReporte(false)}
              className="self-start md:self-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Volver a vista diaria
            </button>
          </div>
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Completos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Incompletos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Extra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Horas Extras
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Horas Faltantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Hábiles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Asistidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Días Faltantes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reporteMensual.reporte.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.empleado.nombre} {item.empleado.apellido}
                      </div>
                      <div className="text-sm text-gray-500">{item.empleado.ci}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dias_completos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dias_incompletos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dias_extras}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {item.total_horas_extras.toFixed(2)} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      {item.total_horas_faltantes.toFixed(2)} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dias_habiles_mes ?? (reporteMensual.dias_habiles_mes || '-')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.dias_asistidos ?? (item.dias_completos + item.dias_incompletos + item.dias_extras)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      {item.dias_faltantes_mes ?? Math.max((reporteMensual.dias_habiles_mes || 0) - (item.dias_completos + item.dias_incompletos + item.dias_extras), 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-gray-200">
            {reporteMensual.reporte.map((item, index) => (
              <div key={index} className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {item.empleado.nombre} {item.empleado.apellido}
                  </p>
                  <p className="text-xs text-gray-500">{item.empleado.ci}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Días completos</p>
                    <p className="font-semibold">{item.dias_completos}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Días incompletos</p>
                    <p className="font-semibold">{item.dias_incompletos}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Días extra</p>
                    <p className="font-semibold">{item.dias_extras}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Horas extras</p>
                    <p className="font-semibold text-green-600">{item.total_horas_extras.toFixed(2)} hrs</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Horas faltantes</p>
                    <p className="font-semibold text-red-600">{item.total_horas_faltantes.toFixed(2)} hrs</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Días faltantes</p>
                    <p className="font-semibold text-red-600">
                      {item.dias_faltantes_mes ?? Math.max((reporteMensual.dias_habiles_mes || 0) - (item.dias_completos + item.dias_incompletos + item.dias_extras), 0)}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Días hábiles del mes: {item.dias_habiles_mes ?? (reporteMensual.dias_habiles_mes || '-')} · Días asistidos:{' '}
                  {item.dias_asistidos ?? (item.dias_completos + item.dias_incompletos + item.dias_extras)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora Salida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas Trabajadas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas Extras
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horas Faltantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {asistencias.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <FaClock className="text-gray-400 text-4xl mb-4" />
                        <p className="text-gray-600 text-lg font-medium mb-2">
                          No hay asistencias registradas
                        </p>
                        <p className="text-gray-500 text-sm">
                          {filters.fecha || filters.empleado_id || filters.estado
                            ? 'No se encontraron asistencias con los filtros seleccionados'
                            : 'Aún no se han registrado asistencias. Las asistencias marcadas desde el móvil aparecerán aquí.'}
                        </p>
                        {(!filters.fecha && !filters.empleado_id && !filters.estado) && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md">
                            <p className="text-blue-800 text-sm">
                              <strong>💡 Sugerencia:</strong> Verifica que los empleados hayan marcado asistencia desde la aplicación móvil.
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  asistencias.map((asistencia) => {
                    if (!asistencia || !asistencia.id) {
                      console.warn('Asistencia inválida:', asistencia);
                      return null;
                    }
                    try {
                      return (
                        <tr key={asistencia.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {asistencia.nombre_empleado || `${asistencia.empleado?.nombre || ''} ${asistencia.empleado?.apellido || ''}` || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(asistencia.fecha)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <FaClock className="text-gray-400" />
                              {formatTime(asistencia.hora_entrada)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <FaClock className="text-gray-400" />
                              {formatTime(asistencia.hora_salida)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                            {asistencia.horas_trabajadas && typeof asistencia.horas_trabajadas === 'number' 
                              ? `${asistencia.horas_trabajadas.toFixed(2)} hrs` 
                              : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {asistencia.horas_extras && typeof asistencia.horas_extras === 'number' && asistencia.horas_extras > 0
                              ? `${asistencia.horas_extras.toFixed(2)} hrs` 
                              : '0.00 hrs'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                            {asistencia.horas_faltantes && typeof asistencia.horas_faltantes === 'number' && asistencia.horas_faltantes > 0
                              ? `${asistencia.horas_faltantes.toFixed(2)} hrs` 
                              : '0.00 hrs'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getEstadoBadge(asistencia.estado)}
                          </td>
                        </tr>
                      );
                    } catch (err) {
                      console.error('Error al renderizar asistencia:', err, asistencia);
                      return null;
                    }
                  }).filter(Boolean)
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsistenciaPage;

