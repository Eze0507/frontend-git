import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCarSide, FaArrowLeft, FaSpinner, FaExclamationCircle, FaCalendarAlt, FaWrench, FaCheckCircle, FaClock, FaTruck } from 'react-icons/fa';
import { fetchVehiculosCliente } from '@/api/vehiculosApi';

const MisVehiculosPage = () => {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const cargarVehiculos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar autenticación antes de hacer la llamada
      const token = localStorage.getItem('access');
      if (!token) {
        setError('No estás autenticado. Por favor inicia sesión.');
        navigate('/login');
        return;
      }
      
      console.log('🔑 Token presente:', token ? 'Sí' : 'No');
      console.log('👤 Usuario:', localStorage.getItem('username'));
      console.log('🎭 Rol:', localStorage.getItem('userRole'));
      
      const data = await fetchVehiculosCliente();
      setVehiculos(data);
    } catch (err) {
      console.error('Error al cargar vehículos:', err);
      
      // Manejo específico de errores de autenticación
      if (err.response?.status === 401) {
        setError('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      } else if (err.response?.status === 403) {
        setError('No tienes permisos para ver esta información.');
      } else {
        setError(err.message || 'Error al cargar los vehículos');
      }
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (tipo) => {
    const colors = {
      'SEDAN': 'bg-blue-100 text-blue-800',
      'SUV': 'bg-green-100 text-green-800',
      'CAMIONETA': 'bg-yellow-100 text-yellow-800',
      'DEPORTIVO': 'bg-red-100 text-red-800',
      'HATCHBACK': 'bg-purple-100 text-purple-800',
      'FURGON': 'bg-gray-100 text-gray-800',
      'CITYCAR': 'bg-pink-100 text-pink-800',
    };
    return colors[tipo] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'pendiente': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: FaClock,
        text: 'Pendiente'
      },
      'en_proceso': {
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        icon: FaWrench,
        text: 'En Proceso'
      },
      'finalizada': {
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: FaCheckCircle,
        text: 'Finalizada'
      },
      'entregada': {
        color: 'bg-gray-100 text-gray-800 border-gray-300',
        icon: FaTruck,
        text: 'Entregada'
      },
      'fuera': {
        color: 'bg-gray-100 text-gray-600 border-gray-300',
        icon: FaCarSide,
        text: 'Fuera del taller'
      }
    };
    return estados[estado] || estados['fuera'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tus vehículos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <FaExclamationCircle className="text-red-600 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/cliente/inicio')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/cliente/inicio')}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Volver al Inicio
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCarSide className="text-3xl text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-800">Mis Vehículos</h1>
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
              {vehiculos.length} {vehiculos.length === 1 ? 'vehículo' : 'vehículos'}
            </div>
          </div>
        </div>

        {/* Lista de vehículos */}
        {vehiculos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaCarSide className="text-6xl text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No tienes vehículos registrados
            </h2>
            <p className="text-gray-500">
              Tus vehículos aparecerán aquí cuando realices servicios en el taller.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehiculos.map((vehiculo) => {
              const estadoInfo = vehiculo.estado_en_taller;
              const estadoBadge = getEstadoBadge(estadoInfo?.estado || 'fuera');
              const EstadoIcon = estadoBadge.icon;
              
              return (
                <div
                  key={vehiculo.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <h3 className="text-xl font-bold">{vehiculo.numero_placa}</h3>
                        <p className="text-blue-100 text-sm">
                          {vehiculo.marca_nombre || 'Sin marca'} {vehiculo.modelo_nombre || ''}
                        </p>
                      </div>
                      <FaCarSide className="text-4xl text-white opacity-75" />
                    </div>
                  </div>

                  {/* Estado en el taller */}
                  {estadoInfo?.tiene_orden_activa && (
                    <div className={`px-4 py-3 border-b-2 ${estadoBadge.color}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <EstadoIcon className="text-lg" />
                          <span className="font-semibold text-sm">{estadoBadge.text}</span>
                        </div>
                        {vehiculo.orden_activa && (
                          <button
                            onClick={() => navigate(`/cliente/ordenes/${vehiculo.orden_activa.id}`)}
                            className="text-xs underline hover:no-underline"
                          >
                            Ver orden #{vehiculo.orden_activa.id}
                          </button>
                        )}
                      </div>
                      {vehiculo.orden_activa?.fallo_requerimiento && (
                        <p className="text-xs mt-2 line-clamp-2">
                          {vehiculo.orden_activa.fallo_requerimiento}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="space-y-3">
                      {vehiculo.tipo && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Tipo:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(vehiculo.tipo)}`}>
                            {vehiculo.tipo}
                          </span>
                        </div>
                      )}

                      {vehiculo.año && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Año:</span>
                          <span className="text-gray-800 font-semibold">{vehiculo.año}</span>
                        </div>
                      )}

                      {vehiculo.color && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Color:</span>
                          <span className="text-gray-800 font-semibold capitalize">{vehiculo.color}</span>
                        </div>
                      )}

                      {vehiculo.version && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Versión:</span>
                          <span className="text-gray-800 font-semibold">{vehiculo.version}</span>
                        </div>
                      )}

                      {vehiculo.tipo_combustible && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">Combustible:</span>
                          <span className="text-gray-800 font-semibold capitalize">{vehiculo.tipo_combustible}</span>
                        </div>
                      )}

                      {vehiculo.vin && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 text-sm">VIN:</span>
                          <span className="text-gray-800 font-semibold text-xs">{vehiculo.vin}</span>
                        </div>
                      )}
                    </div>

                    {vehiculo.fecha_registro && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center text-gray-500 text-xs">
                          <FaCalendarAlt className="mr-2" />
                          Registrado el {new Date(vehiculo.fecha_registro).toLocaleDateString('es-BO', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisVehiculosPage;
