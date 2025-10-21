// Página para ver el detalle completo de un pago
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaMoneyBillWave, FaCreditCard, FaUniversity, 
  FaCheckCircle, FaExclamationCircle, FaSpinner, FaUndo,
  FaCalendar, FaUser, FaFileInvoice, FaInfoCircle
} from 'react-icons/fa';
import { 
  fetchPagoById, 
  refundPayment, 
  getEstadoColor, 
  getMetodoIcon, 
  formatMonto 
} from '../../api/pagosApi';

const PagoDetalle = () => {
  const { pagoId } = useParams();
  const navigate = useNavigate();
  
  const [pago, setPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [mostrarModalReembolso, setMostrarModalReembolso] = useState(false);
  const [reembolsoData, setReembolsoData] = useState({
    monto: '',
    razon: ''
  });
  const [procesandoReembolso, setProcesandoReembolso] = useState(false);

  useEffect(() => {
    loadPagoDetalle();
  }, [pagoId]);

  const loadPagoDetalle = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetchPagoById(pagoId);
      console.log('📄 Detalle de pago:', response);
      setPago(response);
      setReembolsoData(prev => ({ ...prev, monto: response.monto }));
    } catch (err) {
      console.error('❌ Error al cargar detalle:', err);
      setError('No se pudo cargar el detalle del pago.');
    } finally {
      setLoading(false);
    }
  };

  const handleReembolso = async () => {
    if (!reembolsoData.monto || parseFloat(reembolsoData.monto) <= 0) {
      alert('El monto del reembolso debe ser mayor a 0');
      return;
    }

    if (parseFloat(reembolsoData.monto) > parseFloat(pago.monto)) {
      alert('El monto del reembolso no puede ser mayor al monto del pago');
      return;
    }

    if (!reembolsoData.razon.trim()) {
      alert('Debes especificar una razón para el reembolso');
      return;
    }

    try {
      setProcesandoReembolso(true);
      
      const response = await refundPayment({
        pago_id: pagoId,
        monto: parseFloat(reembolsoData.monto),
        razon: reembolsoData.razon
      });

      console.log('✅ Reembolso procesado:', response);
      alert('Reembolso procesado exitosamente');
      
      setMostrarModalReembolso(false);
      loadPagoDetalle(); // Recargar datos
    } catch (err) {
      console.error('❌ Error al procesar reembolso:', err);
      alert(err.response?.data?.error || 'Error al procesar el reembolso');
    } finally {
      setProcesandoReembolso(false);
    }
  };

  const puedeReembolsar = () => {
    if (!pago) return false;
    return pago.estado === 'completado' && 
           (pago.metodo_pago === 'stripe' || pago.metodo_pago === 'tarjeta');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalle del pago...</p>
        </div>
      </div>
    );
  }

  if (error || !pago) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
          <FaExclamationCircle className="text-red-600 text-5xl mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'No se encontró el pago'}</p>
          <button
            onClick={() => navigate('/pagos')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver al Listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/pagos')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft />
            Volver al listado
          </button>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Detalle de Pago #{pago.id}
                </h1>
                <p className="text-gray-600">
                  Orden de Trabajo: <span className="font-semibold">{pago.orden_trabajo}</span>
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full font-semibold ${getEstadoColor(pago.estado)}`}>
                {pago.estado_display}
              </span>
            </div>
          </div>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Información del pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-green-600" />
              Información del Pago
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Monto:</span>
                <span className="text-2xl font-bold text-green-600">
                  Bs. {formatMonto(pago.monto)}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Método de Pago:</span>
                <div className="flex items-center gap-2">
                  {getMetodoIcon(pago.metodo_pago)}
                  <span className="font-semibold">{pago.metodo_pago_display}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600 flex items-center gap-2">
                  <FaCalendar className="text-sm" />
                  Fecha de Pago:
                </span>
                <span className="font-semibold">
                  {new Date(pago.fecha_pago).toLocaleString('es-BO')}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600 flex items-center gap-2">
                  <FaUser className="text-sm" />
                  Registrado por:
                </span>
                <span className="font-semibold">{pago.usuario_nombre || 'N/A'}</span>
              </div>

              {pago.descripcion && (
                <div className="pt-2">
                  <span className="text-gray-600 block mb-2">Descripción:</span>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded">{pago.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información del cliente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaFileInvoice className="text-blue-600" />
              Información de la Orden
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Cliente:</span>
                <span className="font-semibold">{pago.cliente_nombre || 'N/A'}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Número de Orden:</span>
                <span className="font-semibold">{pago.orden_trabajo}</span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Estado de Pago:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(pago.estado)}`}>
                  {pago.estado_display}
                </span>
              </div>

              {pago.numero_referencia && (
                <div className="pt-2">
                  <span className="text-gray-600 block mb-2">Número de Referencia:</span>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded font-mono">
                    {pago.numero_referencia}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de Stripe (si aplica) */}
        {pago.metodo_pago === 'stripe' && (pago.stripe_payment_intent_id || pago.stripe_charge_id) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCreditCard className="text-purple-600" />
              Información de Stripe
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pago.stripe_payment_intent_id && (
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Payment Intent ID:</span>
                  <p className="text-gray-800 bg-gray-50 p-2 rounded font-mono text-sm break-all">
                    {pago.stripe_payment_intent_id}
                  </p>
                </div>
              )}

              {pago.stripe_charge_id && (
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Charge ID:</span>
                  <p className="text-gray-800 bg-gray-50 p-2 rounded font-mono text-sm break-all">
                    {pago.stripe_charge_id}
                  </p>
                </div>
              )}

              {pago.stripe_customer_id && (
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Customer ID:</span>
                  <p className="text-gray-800 bg-gray-50 p-2 rounded font-mono text-sm break-all">
                    {pago.stripe_customer_id}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botón de reembolso */}
        {puedeReembolsar() && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <FaInfoCircle className="text-blue-600 text-xl flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Reembolso Disponible</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Este pago puede ser reembolsado total o parcialmente. El proceso de reembolso
                  puede tardar entre 5-10 días hábiles en reflejarse en la cuenta del cliente.
                </p>
                <button
                  onClick={() => setMostrarModalReembolso(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <FaUndo />
                  Procesar Reembolso
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de reembolso */}
        {mostrarModalReembolso && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Procesar Reembolso</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto a Reembolsar (Bs.)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={pago.monto}
                  value={reembolsoData.monto}
                  onChange={(e) => setReembolsoData(prev => ({ ...prev, monto: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Máximo: Bs. {formatMonto(pago.monto)}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón del Reembolso *
                </label>
                <textarea
                  rows="3"
                  value={reembolsoData.razon}
                  onChange={(e) => setReembolsoData(prev => ({ ...prev, razon: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Explica el motivo del reembolso..."
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Advertencia:</strong> Esta acción no se puede deshacer. 
                  El reembolso se procesará inmediatamente.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarModalReembolso(false)}
                  disabled={procesandoReembolso}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReembolso}
                  disabled={procesandoReembolso}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {procesandoReembolso ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FaUndo />
                      Confirmar Reembolso
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagoDetalle;
