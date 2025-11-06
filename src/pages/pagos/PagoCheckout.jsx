// Página principal para realizar pagos (integra Stripe y pagos manuales)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { FaCreditCard, FaMoneyBillWave, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import StripePaymentForm from '../../components/pagos/StripePaymentForm';
import PagoManualForm from '../../components/pagos/PagoManualForm';
import { createPaymentIntent, confirmPayment } from '../../api/pagosApi';
import { fetchOrdenById } from '../../api/ordenesApi';

// Inicializar Stripe con la clave pública
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Log para depuración (solo en desarrollo)
console.log('🔑 Stripe Key disponible:', STRIPE_KEY ? 'Sí ✅' : 'No ❌');
console.log('🔑 Primeros caracteres:', STRIPE_KEY?.substring(0, 10) + '...');

if (!STRIPE_KEY) {
  console.error('❌ ERROR CRÍTICO: VITE_STRIPE_PUBLISHABLE_KEY no está definida');
  console.error('⚠️  Verifica que la variable esté en Railway con el prefijo VITE_');
}

const stripePromise = loadStripe(STRIPE_KEY);

const PagoCheckout = () => {
  const { ordenId } = useParams();
  const navigate = useNavigate();
  
  // Detectar el rol del usuario
  const rawRole = (localStorage.getItem('userRole') || '').toLowerCase();
  const userRole = rawRole === 'administrador' ? 'admin' : rawRole;
  const isCliente = userRole === 'cliente';
  const isAdmin = userRole === 'admin' || rawRole === 'administrador' || rawRole === 'empleado';
  
  // CAMBIO: Administradores solo pueden pagar en efectivo, clientes solo con tarjeta
  const [tipoPago, setTipoPago] = useState(isAdmin ? 'manual' : 'stripe');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrden, setLoadingOrden] = useState(true);
  const [error, setError] = useState('');
  const [pagoCompletado, setPagoCompletado] = useState(false);
  const [pagoInfo, setPagoInfo] = useState(null);
  
  // Información de la orden (se obtiene de la API)
  const [ordenInfo, setOrdenInfo] = useState(null);

  // Cargar información de la orden al montar el componente
  useEffect(() => {
    const cargarOrden = async () => {
      setLoadingOrden(true);
      setError('');
      
      try {
        const orden = await fetchOrdenById(ordenId);
        console.log('✅ Orden cargada completa:', orden);
        console.log('📊 Datos de monto - monto_total:', orden.monto_total, 'total:', orden.total);
        
        // Extraer monto numérico de forma segura
        let montoTotal = 0;
        
        // Prioridad 1: Usar monto_total si existe y es número válido
        if (typeof orden.monto_total === 'number' && !isNaN(orden.monto_total)) {
          montoTotal = orden.monto_total;
        }
        // Prioridad 2: Parsear desde total si existe
        else if (orden.total !== undefined && orden.total !== null && orden.total !== '') {
          const totalStr = String(orden.total);
          const match = totalStr.match(/[\d.]+/);
          montoTotal = match ? parseFloat(match[0]) : 0;
        }
        // Prioridad 3: Intentar calcular desde subtotal + impuesto - descuento
        else if (orden.subtotal !== undefined) {
          const subtotal = parseFloat(orden.subtotal) || 0;
          const impuesto = parseFloat(orden.impuesto) || 0;
          const descuento = parseFloat(orden.descuento) || 0;
          montoTotal = subtotal + impuesto - descuento;
        }
        
        console.log('💰 Monto final extraído:', montoTotal, 'tipo:', typeof montoTotal);
        
        // Validar que el monto sea válido
        if (isNaN(montoTotal) || montoTotal <= 0) {
          console.error('❌ Monto inválido:', montoTotal);
          throw new Error('El monto de la orden no es válido');
        }
        
        setOrdenInfo({
          id: orden.id,
          numero_orden: orden.numero || `OT-${orden.id}`,
          cliente_nombre: orden.cliente_nombre || 'Sin cliente',
          monto_total: montoTotal,
          descripcion: orden.falloRequerimiento || 'Servicio de taller'
        });
      } catch (err) {
        console.error('❌ Error al cargar orden:', err);
        setError('No se pudo cargar la información de la orden. Por favor, intenta de nuevo.');
      } finally {
        setLoadingOrden(false);
      }
    };

    cargarOrden();
  }, [ordenId]);

  // Crear Payment Intent cuando se selecciona pago con tarjeta y la orden está cargada
  // Solo para clientes (no administradores)
  useEffect(() => {
    if (tipoPago === 'stripe' && !clientSecret && !pagoCompletado && ordenInfo && !loadingOrden && !isAdmin) {
      handleCreatePaymentIntent();
    }
  }, [tipoPago, ordenInfo, loadingOrden, isAdmin]);

  const handleCreatePaymentIntent = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        orden_trabajo_id: ordenId,
        monto: ordenInfo.monto_total,
        descripcion: ordenInfo.descripcion
      };
      
      console.log('📤 Enviando Payment Intent con datos:', payload);
      console.log('💰 Monto a enviar:', ordenInfo.monto_total, 'Tipo:', typeof ordenInfo.monto_total);
      
      const response = await createPaymentIntent(payload);

      console.log('✅ Payment Intent creado:', response);
      setClientSecret(response.client_secret);
    } catch (err) {
      console.error('❌ Error al crear Payment Intent:', err);
      setError('No se pudo iniciar el proceso de pago. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeSuccess = async (paymentIntent) => {
    try {
      setLoading(true);
      
      // Confirmar el pago en el backend
      const response = await confirmPayment(paymentIntent.id);
      console.log('✅ Pago confirmado en backend:', response);
      
      setPagoInfo(response);
      setPagoCompletado(true);
    } catch (err) {
      console.error('❌ Error al confirmar pago:', err);
      setError('El pago se procesó pero hubo un error al registrarlo. Contacta con soporte.');
    } finally {
      setLoading(false);
    }
  };

  const handleStripeError = (error) => {
    console.error('❌ Error en pago con Stripe:', error);
    setError(error.message || 'Ocurrió un error al procesar el pago.');
  };

  const handleManualSuccess = (pago) => {
    console.log('✅ Pago manual registrado:', pago);
    setPagoInfo(pago);
    setPagoCompletado(true);
  };

  const handleVolverOrdenes = () => {
    // Si es cliente, redirigir a "Mis Órdenes", si no a "Órdenes de Trabajo"
    if (isCliente) {
      navigate('/mis-ordenes');
    } else {
      navigate('/ordenes');
    }
  };

  const handleNuevoPago = () => {
    setPagoCompletado(false);
    setClientSecret('');
    setPagoInfo(null);
    setError('');
  };

  // Vista de carga de la orden
  if (loadingOrden) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Cargando información...</h2>
          <p className="text-gray-600">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  // Si no se pudo cargar la orden y hay error
  if (!ordenInfo && error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleVolverOrdenes}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isCliente ? 'Volver a Mis Órdenes' : 'Volver a Órdenes'}
          </button>
        </div>
      </div>
    );
  }

  // Si el monto es 0 o inválido
  if (ordenInfo && ordenInfo.monto_total <= 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <FaTimesCircle className="text-yellow-500 text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Monto Inválido</h2>
          <p className="text-gray-600 mb-2">
            La orden <strong>{ordenInfo.numero_orden}</strong> no tiene un monto válido para pagar.
          </p>
          <p className="text-gray-600 mb-6">
            Monto actual: <strong>Bs. {ordenInfo.monto_total}</strong>
          </p>
          <button
            onClick={handleVolverOrdenes}
            className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isCliente ? 'Volver a Mis Órdenes' : 'Volver a Órdenes'}
          </button>
        </div>
      </div>
    );
  }

  // Vista de éxito
  if (pagoCompletado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pago Exitoso!</h2>
            <p className="text-gray-600">
              Tu pago ha sido registrado correctamente.
            </p>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 font-semibold">
                ✅ El estado de pago de la orden ha sido actualizado a "Pagado"
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Orden:</span>
              <span className="font-semibold">{ordenInfo?.numero_orden || 'N/A'}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Monto:</span>
              <span className="font-semibold">Bs. {pagoInfo?.monto || ordenInfo?.monto_total || 0}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Método:</span>
              <span className="font-semibold capitalize">{pagoInfo?.metodo_pago_display || (isAdmin ? 'Efectivo' : 'Stripe')}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Estado Pago:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                {pagoInfo?.estado_display || 'Completado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estado Orden:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                ✓ Pagado
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleVolverOrdenes}
              className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isCliente ? 'Volver a Mis Órdenes' : 'Volver a Órdenes'}
            </button>
            <button
              onClick={handleNuevoPago}
              className="w-full py-3 px-4 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Realizar Otro Pago
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Realizar Pago</h1>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">Orden: <span className="font-semibold">{ordenInfo?.numero_orden || 'N/A'}</span></p>
              <p className="text-gray-600">Cliente: <span className="font-semibold">{ordenInfo?.cliente_nombre || 'Sin cliente'}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total a pagar</p>
              <p className="text-3xl font-bold text-blue-600">Bs. {ordenInfo?.monto_total?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Información del método de pago según el rol */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Método de pago disponible</h3>
          
          {isAdmin ? (
            // ADMINISTRADOR: Solo efectivo
            <div className="p-6 rounded-lg border-2 border-green-500 bg-green-50">
              <FaMoneyBillWave className="mx-auto mb-3 text-4xl text-green-600" />
              <h4 className="font-semibold mb-2 text-green-700 text-center">
                Pago en Efectivo
              </h4>
              <p className="text-sm text-gray-600 text-center">
                Como administrador, puedes registrar pagos en efectivo
              </p>
              <div className="mt-4 p-3 bg-white rounded border border-green-200">
                <p className="text-xs text-green-800 font-semibold mb-1">
                  ℹ️ Información:
                </p>
                <p className="text-xs text-green-700">
                  El pago en efectivo se registrará directamente en el sistema sin procesamiento por tarjeta.
                </p>
              </div>
            </div>
          ) : (
            // CLIENTE: Solo tarjeta (Stripe)
            <div className="p-6 rounded-lg border-2 border-blue-500 bg-blue-50">
              <FaCreditCard className="mx-auto mb-3 text-4xl text-blue-600" />
              <h4 className="font-semibold mb-2 text-blue-700 text-center">
                Pago con Tarjeta
              </h4>
              <p className="text-sm text-gray-600 text-center">
                Paga de forma segura con tu tarjeta de crédito o débito
              </p>
              <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                <p className="text-xs text-blue-800 font-semibold mb-2">
                  🧪 Tarjeta de Prueba:
                </p>
                <p className="font-mono text-sm text-blue-900">4242 4242 4242 4242</p>
                <p className="text-xs text-blue-700 mt-1">CVV: 123 | Fecha: 12/25</p>
              </div>
            </div>
          )}
        </div>

        {/* Mensaje de error general */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <FaTimesCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Error</h4>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario de pago según el rol del usuario */}
        
        {/* ADMINISTRADOR: Formulario de pago en efectivo */}
        {isAdmin && tipoPago === 'manual' && ordenInfo && (
          <PagoManualForm
            ordenTrabajoId={ordenId}
            montoTotal={ordenInfo.monto_total}
            onSuccess={handleManualSuccess}
            onCancel={handleVolverOrdenes}
            soloEfectivo={true}
          />
        )}

        {/* CLIENTE: Formulario de pago con Stripe */}
        {!isAdmin && tipoPago === 'stripe' && ordenInfo && (
          <>
            {/* Mostrar advertencia si Stripe no está inicializado */}
            {!STRIPE_KEY && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Configuración incompleta</h4>
                <p className="text-yellow-700 text-sm">
                  La clave pública de Stripe no está configurada. Contacta con el administrador.
                </p>
              </div>
            )}

            {/* Inicializar Stripe Element siempre (no esperar clientSecret) */}
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                clientSecret={clientSecret}
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
                monto={ordenInfo.monto_total}
                ordenNumero={ordenInfo.numero_orden}
                loading={loading}
                isTestMode={false}
              />
            </Elements>
          </>
        )}
      </div>
    </div>
  );
};

export default PagoCheckout;
