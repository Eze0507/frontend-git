// Página para listar y filtrar pagos
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, FaFilter, FaEye, FaMoneyBillWave, FaCreditCard, 
  FaUniversity, FaSpinner, FaExclamationCircle 
} from 'react-icons/fa';
import { fetchPagos, getEstadoColor, getMetodoIcon, formatMonto } from '../../api/pagosApi';

const PagosList = () => {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filtros, setFiltros] = useState({
    orden_trabajo: '',
    estado: '',
    metodo_pago: ''
  });

  const estadosOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'procesando', label: 'Procesando' },
    { value: 'completado', label: 'Completado' },
    { value: 'fallido', label: 'Fallido' },
    { value: 'reembolsado', label: 'Reembolsado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  const metodosOptions = [
    { value: '', label: 'Todos los métodos' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'stripe', label: 'Stripe' },
    { value: 'otro', label: 'Otro' }
  ];

  useEffect(() => {
    loadPagos();
  }, [filtros]);

  const loadPagos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetchPagos(filtros);
      console.log('📋 Pagos obtenidos:', response);
      setPagos(response.results || response);
    } catch (err) {
      console.error('❌ Error al cargar pagos:', err);
      setError('No se pudieron cargar los pagos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerDetalle = (pagoId) => {
    navigate(`/pagos/${pagoId}`);
  };

  const limpiarFiltros = () => {
    setFiltros({
      orden_trabajo: '',
      estado: '',
      metodo_pago: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Historial de Pagos</h1>
              <p className="text-gray-600">Administra y consulta todos los pagos registrados</p>
            </div>
            <button
              onClick={() => navigate('/ordenes')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a Órdenes
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Orden
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="orden_trabajo"
                  value={filtros.orden_trabajo}
                  onChange={handleFiltroChange}
                  placeholder="ID de orden..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={filtros.estado}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {estadosOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago
              </label>
              <select
                name="metodo_pago"
                value={filtros.metodo_pago}
                onChange={handleFiltroChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {metodosOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={limpiarFiltros}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de pagos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Cargando pagos...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <FaExclamationCircle className="text-4xl text-red-600 mx-auto mb-4" />
              <p className="text-red-700 font-semibold mb-2">Error al cargar pagos</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadPagos}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : pagos.length === 0 ? (
            <div className="p-12 text-center">
              <FaMoneyBillWave className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No se encontraron pagos</p>
              <p className="text-sm text-gray-500">Intenta ajustar los filtros o realiza un nuevo pago</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagos.map((pago) => (
                    <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{pago.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pago.orden_trabajo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {pago.cliente_nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        Bs. {formatMonto(pago.monto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {getMetodoIcon(pago.metodo_pago)}
                          <span className="text-gray-700">{pago.metodo_pago_display}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getEstadoColor(pago.estado)}`}>
                          {pago.estado_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(pago.fecha_pago).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleVerDetalle(pago.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <FaEye />
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Resumen */}
        {!loading && pagos.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total de Pagos</p>
                <p className="text-2xl font-bold text-gray-800">{pagos.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Monto Total</p>
                <p className="text-2xl font-bold text-green-600">
                  Bs. {formatMonto(pagos.reduce((sum, p) => sum + parseFloat(p.monto), 0))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Completados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pagos.filter(p => p.estado === 'completado').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagosList;
