/**
 * Componente para seleccionar campos del reporte con checkboxes
 */

import React from 'react';
import { FaCheckSquare, FaSquare } from 'react-icons/fa';

const SelectorCampos = ({ campos, camposSeleccionados, onSeleccionar }) => {
  const handleToggleCampo = (campoKey) => {
    if (camposSeleccionados.includes(campoKey)) {
      onSeleccionar(camposSeleccionados.filter((c) => c !== campoKey));
    } else {
      onSeleccionar([...camposSeleccionados, campoKey]);
    }
  };

  const handleSeleccionarTodos = () => {
    if (camposSeleccionados.length === Object.keys(campos).length) {
      onSeleccionar([]);
    } else {
      onSeleccionar(Object.keys(campos));
    }
  };

  const todosSeleccionados = camposSeleccionados.length === Object.keys(campos).length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Paso 2: Selecciona los Campos
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {camposSeleccionados.length} de {Object.keys(campos).length} campos seleccionados
          </p>
        </div>
        <button
          onClick={handleSeleccionarTodos}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
        >
          {todosSeleccionados ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {Object.entries(campos).map(([key, config]) => {
          const isSelected = camposSeleccionados.includes(key);
          
          return (
            <button
              key={key}
              onClick={() => handleToggleCampo(key)}
              className={`
                flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              <div className="mt-0.5">
                {isSelected ? (
                  <FaCheckSquare className="text-blue-600 text-xl" />
                ) : (
                  <FaSquare className="text-gray-400 text-xl" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`
                    font-medium text-sm
                    ${isSelected ? 'text-blue-900' : 'text-gray-800'}
                  `}
                >
                  {config.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {config.tipo === 'text' && '📝 Texto'}
                  {config.tipo === 'number' && '🔢 Número'}
                  {config.tipo === 'datetime' && '📅 Fecha/Hora'}
                  {config.tipo === 'decimal' && '💰 Decimal'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {camposSeleccionados.length === 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ Debes seleccionar al menos un campo para generar el reporte
          </p>
        </div>
      )}
    </div>
  );
};

export default SelectorCampos;
