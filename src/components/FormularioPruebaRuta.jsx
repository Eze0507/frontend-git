import React, { useState, useEffect } from 'react';
import { createPruebaRuta, updatePruebaRuta, fetchEmpleados } from '../api/ordenesApi.jsx';

const FormularioPruebaRuta = ({ prueba, ordenId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    tipo_prueba: 'inicial',
    kilometraje_inicio: '',
    kilometraje_final: '',
    ruta: '',
    frenos: '',
    motor: '',
    suspension: '',
    direccion: '',
    observaciones: '',
    tecnico: ''
  });
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmpleados, setLoadingEmpleados] = useState(true);

  const OPCIONES_ESTADO = [
    { value: '', label: 'Seleccionar...' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'regular', label: 'Regular' },
    { value: 'malo', label: 'Malo' }
  ];

  const TIPO_PRUEBA = [
    { value: 'inicial', label: 'Inicial' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'final', label: 'Final' }
  ];

  useEffect(() => {
    loadEmpleados();
    if (prueba) {
      // El técnico puede venir como número directo o como objeto con id
      let tecnicoId = '';
      if (prueba.tecnico) {
        if (typeof prueba.tecnico === 'object' && prueba.tecnico.id) {
          tecnicoId = prueba.tecnico.id;
        } else if (typeof prueba.tecnico === 'number' || typeof prueba.tecnico === 'string') {
          tecnicoId = prueba.tecnico;
        }
      }
      
      setFormData({
        tipo_prueba: prueba.tipo_prueba || 'inicial',
        kilometraje_inicio: prueba.kilometraje_inicio || '',
        kilometraje_final: prueba.kilometraje_final || '',
        ruta: prueba.ruta || '',
        frenos: prueba.frenos || '',
        motor: prueba.motor || '',
        suspension: prueba.suspension || '',
        direccion: prueba.direccion || '',
        observaciones: prueba.observaciones || '',
        tecnico: tecnicoId
      });
    }
  }, [prueba]);

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
      // Validación básica en cliente (evita enviar payloads inválidos)
      const required = ['ruta', 'frenos', 'motor', 'suspension', 'direccion', 'observaciones'];
      for (const field of required) {
        if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
          alert('Por favor completa el campo: ' + field);
          setLoading(false);
          return;
        }
      }

      // Construir payload evitando enviar campos null explícitos
      const dataToSend = {
        tipo_prueba: formData.tipo_prueba || 'inicial',
        ruta: formData.ruta,
        frenos: formData.frenos,
        motor: formData.motor,
        suspension: formData.suspension,
        direccion: formData.direccion,
        observaciones: formData.observaciones
      };

      if (formData.kilometraje_inicio !== '' && formData.kilometraje_inicio !== null) {
        const ki = parseInt(formData.kilometraje_inicio);
        if (!isNaN(ki)) dataToSend.kilometraje_inicio = ki;
      }
      if (formData.kilometraje_final !== '' && formData.kilometraje_final !== null) {
        const kf = parseInt(formData.kilometraje_final);
        if (!isNaN(kf)) dataToSend.kilometraje_final = kf;
      }
      if (formData.tecnico) {
        // asegurar que sea número cuando se envía
        const tec = Number(formData.tecnico);
        if (!isNaN(tec)) dataToSend.tecnico = tec;
      }

      if (prueba) {
        // Editar prueba existente
        await updatePruebaRuta(ordenId, prueba.id, dataToSend);
      } else {
        // Crear nueva prueba
        await createPruebaRuta(ordenId, dataToSend);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error guardando prueba de ruta:', error);

      // Mostrar detalles del error del backend si existen
      const serverMsg = error.response?.data || error.message || 'Error desconocido';
      console.error('Detalles del error del servidor:', serverMsg);
      let friendly = '';
      if (error.response?.status === 400) {
        if (typeof error.response.data === 'object') {
          friendly = Object.entries(error.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n');
        } else {
          friendly = String(error.response.data);
        }
      } else {
        friendly = error.message;
      }

      alert('Error guardando prueba de ruta:\n' + friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {prueba ? 'Editar Prueba de Ruta' : 'Nueva Prueba de Ruta'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de prueba y Técnico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Prueba
            </label>
            <select
              value={formData.tipo_prueba}
              onChange={(e) => handleChange('tipo_prueba', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            >
              {TIPO_PRUEBA.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Técnico Responsable
            </label>
            {loadingEmpleados ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Cargando técnicos...
              </div>
            ) : (
              <select
                value={formData.tecnico}
                onChange={(e) => handleChange('tecnico', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
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

        {/* Kilometraje */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilometraje de Inicio
            </label>
            <input
              type="number"
              value={formData.kilometraje_inicio}
              onChange={(e) => handleChange('kilometraje_inicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ej: 50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilometraje Final
            </label>
            <input
              type="number"
              value={formData.kilometraje_final}
              onChange={(e) => handleChange('kilometraje_final', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Ej: 50025"
            />
          </div>
        </div>

        {/* Ruta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ruta de Prueba
          </label>
          <textarea
            value={formData.ruta}
            onChange={(e) => handleChange('ruta', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows="3"
            placeholder="Descripción de la ruta tomada para la prueba..."
            required
          />
        </div>

        {/* Estados de componentes */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Evaluación de Componentes</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de Frenos
              </label>
              <select
                value={formData.frenos}
                onChange={(e) => handleChange('frenos', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                {OPCIONES_ESTADO.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado del Motor
              </label>
              <select
                value={formData.motor}
                onChange={(e) => handleChange('motor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                {OPCIONES_ESTADO.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de Suspensión
              </label>
              <select
                value={formData.suspension}
                onChange={(e) => handleChange('suspension', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                {OPCIONES_ESTADO.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de Dirección
              </label>
              <select
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                {OPCIONES_ESTADO.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => handleChange('observaciones', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows="4"
            placeholder="Observaciones adicionales sobre la prueba de ruta..."
            required
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (prueba ? 'Actualizar' : 'Crear Prueba')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioPruebaRuta;