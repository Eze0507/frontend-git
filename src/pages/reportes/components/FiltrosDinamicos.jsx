/**
 * Componente para construir filtros dinámicos según tipo
 */

import React, { useState } from 'react';
import { FaPlus, FaTrash, FaFilter } from 'react-icons/fa';

const FiltrosDinamicos = ({ filtrosDisponibles = {}, filtrosSeleccionados = [], onActualizarFiltros }) => {
  const [mostrarAgregar, setMostrarAgregar] = useState(false);

  const handleAgregarFiltro = (filtroKey) => {
    const config = filtrosDisponibles[filtroKey];
    const nuevoFiltro = {
      campo: filtroKey,
      valor: config.tipo === 'choice' ? (config.opciones?.[0]?.value || '') : '',
    };
    onActualizarFiltros([...filtrosSeleccionados, nuevoFiltro]);
    setMostrarAgregar(false);
  };

  const handleEliminarFiltro = (index) => {
    onActualizarFiltros(filtrosSeleccionados.filter((_, i) => i !== index));
  };

  const handleCambiarValor = (index, valor) => {
    const nuevosFiltros = [...filtrosSeleccionados];
    nuevosFiltros[index] = { ...nuevosFiltros[index], valor };
    onActualizarFiltros(nuevosFiltros);
  };

  const filtrosYaUsados = filtrosSeleccionados.map((f) => f.campo);
  const filtrosRestantes = Object.keys(filtrosDisponibles).filter(
    (key) => !filtrosYaUsados.includes(key)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaFilter className="text-blue-600" />
            Filtros (Opcional)
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filtrosSeleccionados.length} filtro{filtrosSeleccionados.length !== 1 ? 's' : ''} aplicado
            {filtrosSeleccionados.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filtrosRestantes.length > 0 && (
          <button
            onClick={() => setMostrarAgregar(!mostrarAgregar)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            Agregar Filtro
          </button>
        )}
      </div>

      {/* Dropdown para agregar filtros */}
      {mostrarAgregar && filtrosRestantes.length > 0 && (
        <div className="mb-4 bg-gray-50 border border-gray-300 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Selecciona un filtro:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filtrosRestantes.map((key) => {
              const config = filtrosDisponibles[key];
              return (
                <button
                  key={key}
                  onClick={() => handleAgregarFiltro(key)}
                  className="text-left px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-sm"
                >
                  <span className="font-medium text-gray-800">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de filtros activos */}
      {filtrosSeleccionados.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FaFilter className="text-gray-400 text-3xl mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            No hay filtros aplicados. Los resultados mostrarán todos los registros.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrosSeleccionados.map((filtro, index) => {
            const config = filtrosDisponibles[filtro.campo];
            
            return (
              <div
                key={index}
                className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {config.label}
                  </label>

                  {config.tipo === 'choice' && (
                    <select
                      value={filtro.valor}
                      onChange={(e) => handleCambiarValor(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {config.opciones?.map((opcion) => (
                        <option key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {config.tipo === 'date' && (
                    <input
                      type="date"
                      value={filtro.valor}
                      onChange={(e) => handleCambiarValor(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  )}

                  {config.tipo === 'number' && (
                    <input
                      type="number"
                      value={filtro.valor}
                      onChange={(e) => handleCambiarValor(index, e.target.value)}
                      placeholder={`Ej: ${config.ejemplo || '100'}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  )}

                  {config.tipo === 'text' && (
                    <input
                      type="text"
                      value={filtro.valor}
                      onChange={(e) => handleCambiarValor(index, e.target.value)}
                      placeholder={`Buscar ${config.label.toLowerCase()}...`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    Lookup: <code className="bg-gray-200 px-1 rounded">{config.lookup}</code>
                  </p>
                </div>

                <button
                  onClick={() => handleEliminarFiltro(index)}
                  className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar filtro"
                >
                  <FaTrash />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FiltrosDinamicos;
