import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';
import axios from 'axios';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

// URL del backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const PagarConStripe = ({ ordenTrabajoId, monto, ordenNumero, onSuccess, onCancel }) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [pagoId, setPagoId] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);

  // 1. Cargar Stripe con la publishable key desde el backend
  useEffect(() => {
    const cargarStripe = async () => {
      try {
        console.log('📡 Obteniendo Stripe config desde:', `${API_URL}/pagos/config/`);
        
        const response = await axios.get(`${API_URL}/pagos/config/`);
        const { publishableKey } = response.data;
        
        if (!publishableKey) {
          throw new Error('No se recibió la publishable key de Stripe');
        }
        
        console.log('✅ Publishable key obtenida:', publishableKey.substring(0, 20) + '...');
        
        const stripe = await loadStripe(publishableKey);
        setStripePromise(stripe);
        
        console.log('✅ Stripe inicializado correctamente');
      } catch (err) {
        console.error('❌ Error al cargar Stripe:', err);
        setError('No se pudo conectar con el sistema de pagos. Verifica tu conexión.');
      }
    };

    cargarStripe();
  }, []);

  // 2. Crear Payment Intent cuando Stripe esté listo
  useEffect(() => {
    if (stripePromise && !clientSecret) {
      crearPaymentIntent();
    }
  }, [stripePromise]);

  const crearPaymentIntent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💳 Creando Payment Intent para orden:', ordenTrabajoId);
      
      const response = await axios.post(`${API_URL}/pagos/create-payment-intent/`, {
        orden_trabajo_id: ordenTrabajoId
      });

      const { client_secret, payment_intent_id, pago_id } = response.data;
      
      console.log('✅ Payment Intent creado:', {
        client_secret: client_secret ? '✅' : '❌',
        payment_intent_id,
        pago_id
      });
      
      setClientSecret(client_secret);
      setPaymentIntentId(payment_intent_id);
      setPagoId(pago_id);
      
    } catch (err) {
      console.error('❌ Error al crear Payment Intent:', err);
      setError(
        err.response?.data?.error || 
        'No se pudo inicializar el pago. Por favor, intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Verificar el pago después de que Stripe confirme
  const verificarPago = async (paymentIntent) => {
    try {
      setVerificando(true);
      console.log('🔍 Verificando pago en el servidor:', paymentIntent.id);
      
      const response = await axios.get(`${API_URL}/pagos/verify-payment/`, {
        params: {
          payment_intent_id: paymentIntent.id
        }
      });

      console.log('✅ Respuesta del servidor:', response.data);
      
      if (response.data.status === 'succeeded') {
        setPagoExitoso(true);
        
        // Esperar 1 segundo para mostrar el mensaje de éxito
        setTimeout(() => {
          if (onSuccess) {
            onSuccess({
              paymentIntent,
              pagoId: response.data.pago_id,
              ordenTrabajoId: response.data.orden_trabajo_id
            });
          }
        }, 1500);
      }
      
    } catch (err) {
      console.error('❌ Error al verificar pago:', err);
      setError('El pago fue procesado pero no se pudo confirmar. Contacta con soporte.');
    } finally {
      setVerificando(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('✅ Pago confirmado por Stripe:', paymentIntent);
    verificarPago(paymentIntent);
  };

  const handlePaymentError = (error) => {
    console.error('❌ Error en el pago:', error);
    setError(error.message || 'El pago no pudo ser procesado');
  };

  // Estado de carga inicial
  if (loading && !clientSecret) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Preparando sistema de pago...</p>
      </div>
    );
  }

  // Estado de error
  if (error && !clientSecret) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error al Inicializar Pago</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={crearPaymentIntent}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Estado de pago exitoso
  if (pagoExitoso) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Pago Exitoso!</h3>
          <p className="text-gray-600 mb-6">
            Tu pago ha sido procesado correctamente.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>ID de Pago:</strong> {pagoId}
            </p>
            <p className="text-sm text-green-800">
              <strong>Orden:</strong> {ordenNumero}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado verificando pago
  if (verificando) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Verificando Pago...</h3>
          <p className="text-gray-600">Por favor espera, estamos confirmando tu pago.</p>
        </div>
      </div>
    );
  }

  // Formulario de pago
  return (
    <div>
      {stripePromise && clientSecret && (
        <Elements stripe={stripePromise}>
          <StripePaymentForm
            clientSecret={clientSecret}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            monto={monto}
            ordenNumero={ordenNumero}
            loading={loading}
            isTestMode={true} // Siempre en modo prueba para tu proyecto
          />
        </Elements>
      )}

      {/* Botón de cancelar */}
      {onCancel && (
        <div className="mt-4 text-center">
          <button
            onClick={onCancel}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            Cancelar y volver
          </button>
        </div>
      )}
    </div>
  );
};

export default PagarConStripe;
