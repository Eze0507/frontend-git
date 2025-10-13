import React from "react";
import { FaTimes, FaCar, FaUser, FaCog, FaPaintBrush, FaGasPump, FaCogs } from "react-icons/fa";

const VehiculoDetails = ({ vehiculo, onClose }) => {
  if (!vehiculo) return null;
  
  console.log('🔍 Datos recibidos en VehiculoDetails:', vehiculo);
  console.log('🔍 Campos específicos:', {
    vin: vehiculo.vin,
    numero_motor: vehiculo.numero_motor,
    tipo: vehiculo.tipo,
    version: vehiculo.version,
    cilindrada: vehiculo.cilindrada,
    tipo_combustible: vehiculo.tipo_combustible,
    marca: vehiculo.marca,
    modelo: vehiculo.modelo,
    cliente: vehiculo.cliente
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaCar className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Detalles del Vehículo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Información Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Información General</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FaCar className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-sm text-gray-500">Número de Placa:</span>
                    <p className="font-semibold text-gray-800">{vehiculo.numero_placa || "No especificado"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaCogs className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-sm text-gray-500">VIN:</span>
                    <p className="font-mono text-sm text-gray-800">{vehiculo.vin || "No especificado"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaCog className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-sm text-gray-500">Número de Motor:</span>
                    <p className="font-mono text-sm text-gray-800">{vehiculo.numero_motor || "No especificado"}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <FaPaintBrush className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-sm text-gray-500">Color:</span>
                    <p className="font-semibold text-gray-800">{vehiculo.color || "No especificado"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Especificaciones</h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Marca y Modelo:</span>
                  <p className="font-semibold text-gray-800">
                    {vehiculo.marca?.nombre || vehiculo.marca_nombre || "Sin marca"} {vehiculo.modelo?.nombre || vehiculo.modelo_nombre || "Sin modelo"}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Tipo:</span>
                  <p className="font-semibold text-gray-800">{vehiculo.tipo || "No especificado"}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Versión:</span>
                  <p className="font-semibold text-gray-800">{vehiculo.version || "No especificado"}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Año:</span>
                  <p className="font-semibold text-gray-800">{vehiculo.año || "No especificado"}</p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Cilindrada:</span>
                  <p className="font-semibold text-gray-800">
                    {vehiculo.cilindrada ? `${vehiculo.cilindrada} cc` : "No especificado"}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <FaGasPump className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-sm text-gray-500">Tipo de Combustible:</span>
                    <p className="font-semibold text-gray-800">{vehiculo.tipo_combustible || "No especificado"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Propietario</h3>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <FaUser className="w-5 h-5 text-blue-600" />
              <div>
                <span className="text-sm text-gray-500">Cliente:</span>
                <p className="font-semibold text-gray-800">
                  {vehiculo.cliente?.nombre && vehiculo.cliente?.apellido 
                    ? `${vehiculo.cliente.nombre} ${vehiculo.cliente.apellido}` 
                    : vehiculo.cliente_nombre || "Sin cliente asignado"}
                </p>
              </div>
            </div>
          </div>


          {/* Botones de Acción */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiculoDetails;

