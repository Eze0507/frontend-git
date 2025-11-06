// Componente para registrar pagos manuales (efectivo, transferencia, tarjeta física)
import React, { useState } from 'react';
import { FaMoneyBillWave, FaUniversity, FaCreditCard, FaSpinner } from 'react-icons/fa';
import { createPagoManual } from '../../api/pagosApi';

const PagoManualForm = ({ ordenTrabajoId, montoTotal, onSuccess, onCancel, soloEfectivo = false }) => {
  const [formData, setFormData] = useState({
    metodo_pago: 'efectivo',
    monto: montoTotal || '',
    descripcion: '',
    numero_referencia: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Si soloEfectivo es true, solo mostrar efectivo
  const metodosPago = soloEfectivo 
    ? [{ value: 'efectivo', label: 'Efectivo', icon: FaMoneyBillWave, color: 'green' }]
    : [
        { value: 'efectivo', label: 'Efectivo', icon: FaMoneyBillWave, color: 'green' },
        { value: 'transferencia', label: 'Transferencia Bancaria', icon: FaUniversity, color: 'blue' },
        { value: 'tarjeta', label: 'Tarjeta (Físico)', icon: FaCreditCard, color: 'purple' }
      ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }

    if (parseFloat(formData.monto) > parseFloat(montoTotal)) {
      setError(`El monto no puede ser mayor al total de la orden (Bs. ${montoTotal})`);
      return;
    }

    if (formData.metodo_pago === 'transferencia' && !formData.numero_referencia) {
      setError('El número de referencia es obligatorio para transferencias');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pagoData = {
        orden_trabajo: ordenTrabajoId,
        metodo_pago: formData.metodo_pago,
        monto: parseFloat(formData.monto),
        descripcion: formData.descripcion || `Pago ${formData.metodo_pago}`,
        numero_referencia: formData.numero_referencia || null
      };

      const response = await createPagoManual(pagoData);
      console.log('✅ Pago manual registrado:', response);
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      console.error('❌ Error al registrar pago:', err);
      setError(err.response?.data?.message || 'Error al registrar el pago. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        {soloEfectivo ? 'Registrar Pago en Efectivo' : 'Registrar Pago Manual'}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Selección de método de pago */}
        {!soloEfectivo && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Método de Pago
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {metodosPago.map((metodo) => {
                const Icon = metodo.icon;
                const isSelected = formData.metodo_pago === metodo.value;
                
                return (
                  <button
                    key={metodo.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, metodo_pago: metodo.value }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? `border-${metodo.color}-500 bg-${metodo.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`mx-auto mb-2 text-2xl ${
                      isSelected ? `text-${metodo.color}-600` : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isSelected ? `text-${metodo.color}-700` : 'text-gray-600'
                    }`}>
                      {metodo.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mensaje informativo cuando es solo efectivo */}
        {soloEfectivo && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FaMoneyBillWave className="text-green-600 text-xl" />
              <span className="font-semibold text-green-800">Pago en Efectivo</span>
            </div>
            <p className="text-sm text-green-700">
              Como administrador, puedes registrar el pago en efectivo recibido del cliente.
            </p>
          </div>
        )}

        {/* Monto */}
        <div className="mb-6">
          <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-2">
            Monto (Bs.)
          </label>
          <input
            type="number"
            id="monto"
            name="monto"
            step="0.01"
            min="0"
            max={montoTotal}
            value={formData.monto}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Total de la orden: Bs. {montoTotal}
          </p>
        </div>

        {/* Número de referencia (solo para transferencia) */}
        {formData.metodo_pago === 'transferencia' && (
          <div className="mb-6">
            <label htmlFor="numero_referencia" className="block text-sm font-medium text-gray-700 mb-2">
              Número de Referencia *
            </label>
            <input
              type="text"
              id="numero_referencia"
              name="numero_referencia"
              value={formData.numero_referencia}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: TRF-123456789"
              required
            />
          </div>
        )}

        {/* Descripción */}
        <div className="mb-6">
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (Opcional)
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows="3"
            value={formData.descripcion}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Agregar notas sobre este pago..."
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Registrando...
              </>
            ) : (
              'Registrar Pago'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PagoManualForm;
