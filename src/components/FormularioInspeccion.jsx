import React, { useState, useEffect } from 'react';
import { createInspeccion, updateInspeccion, fetchEmpleados } from '../api/ordenesApi.jsx';

const FormularioInspeccion = ({ inspeccion, ordenId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    tipo_inspeccion: 'ingreso',
    tecnico: '',
    aceite_motor: '',
    Filtros_VH: '',
    nivel_refrigerante: '',
    pastillas_freno: '',
    Estado_neumaticos: '',
    estado_bateria: '',
    estado_luces: '',
    observaciones_generales: ''
  });
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);

  const OPCIONES_ESTADO = [
    { value: '', label: 'Seleccionar...' },
    { value: 'bueno', label: 'Buen estado' },
    { value: 'malo', label: 'Mal estado' }
  ];

  const OPCIONES_NIVEL = [
    { value: '', label: 'Seleccionar...' },
    { value: 'alto', label: 'Alto' },
    { value: 'medio', label: 'Medio' },
    { value: 'bajo', label: 'Bajo' }
  ];

  const TIPO_INSPECCION = [
    { value: 'ingreso', label: 'Ingreso' },
    { value: 'salida', label: 'Salida' }
  ];

  useEffect(() => {
    loadEmpleados();
    if (inspeccion) {
      setFormData(inspeccion);
    }
  }, [inspeccion]);

  const loadEmpleados = async () => {
    try {
      setLoadingEmpleados(true);
      const data = await fetchEmpleados();
      setEmpleados(data);
    } catch (error) {
      console.error('Error cargando empleados:', error);
      setEmpleados([]);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (inspeccion) {
        // Editar inspección existente
        await updateInspeccion(ordenId, inspeccion.id, formData);
      } else {
        // Crear nueva inspección
        await createInspeccion(ordenId, formData);
      }
      
      onSave();
    } catch (error) {
      console.error('Error guardando inspección:', error);
      alert('Error guardando inspección: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {inspeccion ? 'Editar Inspección' : 'Nueva Inspección'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de inspección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Inspección
            </label>
            <select
              value={formData.tipo_inspeccion}
              onChange={(e) => handleChange('tipo_inspeccion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {TIPO_INSPECCION.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Técnico Responsable
            </label>
            {loadingEmpleados ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                Cargando empleados...
              </div>
            ) : (
              <select
                value={formData.tecnico}
                onChange={(e) => handleChange('tecnico', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar técnico...</option>
                {empleados.map(empleado => (
                  <option key={empleado.id} value={empleado.id}>
                    {empleado.nombre} {empleado.apellido}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Elementos de inspección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Aceite motor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aceite Motor
            </label>
            <select
              value={formData.aceite_motor}
              onChange={(e) => handleChange('aceite_motor', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OPCIONES_ESTADO.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtros VH
            </label>
            <select
              value={formData.Filtros_VH}
              onChange={(e) => handleChange('Filtros_VH', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OPCIONES_ESTADO.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nivel refrigerante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nivel Refrigerante
            </label>
            <select
              value={formData.nivel_refrigerante}
              onChange={(e) => handleChange('nivel_refrigerante', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OPCIONES_NIVEL.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pastillas freno */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pastillas Freno
            </label>
            <select
              value={formData.pastillas_freno}
              onChange={(e) => handleChange('pastillas_freno', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OPCIONES_ESTADO.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Estado neumáticos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado Neumáticos
            </label>
            <select
              value={formData.Estado_neumaticos}
              onChange={(e) => handleChange('Estado_neumaticos', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OPCIONES_ESTADO.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Estado batería */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado Batería
            </label>
            <select
              value={formData.estado_bateria}
              onChange={(e) => handleChange('estado_bateria', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OPCIONES_NIVEL.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>

          {/* Estado luces */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado Luces
            </label>
            <select
              value={formData.estado_luces}
              onChange={(e) => handleChange('estado_luces', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {OPCIONES_ESTADO.map(opcion => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones Generales
          </label>
          <textarea
            value={formData.observaciones_generales}
            onChange={(e) => handleChange('observaciones_generales', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe cualquier observación adicional sobre la inspección..."
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (inspeccion ? 'Actualizar' : 'Crear')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioInspeccion;