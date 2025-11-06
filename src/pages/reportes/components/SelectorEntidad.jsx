/**
 * Componente para seleccionar la entidad del reporte
 */

import React from 'react';
import { FaClipboardList, FaUsers, FaCar, FaBox } from 'react-icons/fa';

const SelectorEntidad = ({ entidades, onSeleccionar }) => {
  const iconos = {
    ordenes: <FaClipboardList className="text-4xl text-blue-600" />,
    clientes: <FaUsers className="text-4xl text-green-600" />,
    vehiculos: <FaCar className="text-4xl text-purple-600" />,
    items: <FaBox className="text-4xl text-orange-600" />,
  };

  const colores = {
    ordenes: 'from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400',
    clientes: 'from-green-50 to-green-100 border-green-200 hover:border-green-400',
    vehiculos: 'from-purple-50 to-purple-100 border-purple-200 hover:border-purple-400',
    items: 'from-orange-50 to-orange-100 border-orange-200 hover:border-orange-400',
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Paso 1: Selecciona una Entidad
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(entidades).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onSeleccionar(key)}
            className={`
              bg-gradient-to-br ${colores[key] || 'from-gray-50 to-gray-100 border-gray-200'}
              border-2 rounded-xl p-6 transition-all duration-200
              hover:shadow-lg hover:scale-105 text-left
            `}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {iconos[key] || <FaBox className="text-4xl text-gray-600" />}
              <div>
                <h4 className="font-bold text-gray-800 text-lg">
                  {config.nombre}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {Object.keys(config.campos_disponibles).length} campos
                </p>
                <p className="text-sm text-gray-600">
                  {Object.keys(config.filtros_disponibles).length} filtros
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectorEntidad;
