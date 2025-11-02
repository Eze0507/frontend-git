// Componente para el formulario de pago con Stripe
import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaCreditCard, FaLock, FaSpinner } from 'react-icons/fa';

const StripePaymentForm = ({ clientSecret, onSuccess, onError, monto, ordenNumero, loading: externalLoading, isTestMode = false }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Log de depuración para verificar que Stripe se inicializó
  useEffect(() => {
    console.log('🔍 Estado de Stripe:', {
      stripe: stripe ? '✅ Inicializado' : '❌ No inicializado',
      elements: elements ? '✅ Disponible' : '❌ No disponible',
      clientSecret: clientSecret ? '✅ Presente' : '⏳ Esperando...'
    });

    // Verificar que el CardElement esté montado
    if (elements) {
      const cardElement = elements.getElement(CardElement);
      console.log('💳 CardElement:', cardElement ? '✅ Montado' : '❌ No montado');
    }
  }, [stripe, elements, clientSecret]);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      console.error('❌ Stripe o Elements no están disponibles');
      setErrorMessage('El sistema de pago no está listo. Por favor, recarga la página.');
      return;
    }

    if (!clientSecret) {
      console.error('❌ No hay clientSecret disponible');
      setErrorMessage('No se pudo inicializar el pago. Por favor, intenta de nuevo.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('No se pudo acceder al campo de tarjeta');
      }

      console.log('💳 Confirmando pago con Stripe...');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error('❌ Error de Stripe:', error);
        setErrorMessage(error.message);
        if (onError) {
          onError(error);
        }
      } else if (paymentIntent.status === 'succeeded') {
        console.log('✅ Pago exitoso:', paymentIntent);
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      }
    } catch (err) {
      console.error('❌ Error inesperado:', err);
      setErrorMessage('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FaCreditCard className="text-blue-600" />
          Información de Pago
        </h3>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <FaLock className="text-green-600" />
          <span>Pago seguro</span>
        </div>
      </div>

      {/* Resumen de pago */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Orden:</span>
          <span className="font-semibold text-gray-800">{ordenNumero}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total a pagar:</span>
          <span className="text-2xl font-bold text-blue-600">Bs. {monto}</span>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        {/* Banner de tarjeta de prueba */}
        {isTestMode && (
          <div className="mb-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <FaCreditCard className="text-green-600" />
              🧪 Usa una tarjeta de prueba
            </h4>
            <div className="text-sm text-green-700 space-y-1">
              <p className="font-mono bg-white p-2 rounded">
                <strong>Número:</strong> 4242 4242 4242 4242
              </p>
              <p><strong>CVV:</strong> Cualquier 3 dígitos (ej: 123)</p>
              <p><strong>Fecha:</strong> Cualquier mes/año futuro (ej: 12/25)</p>
              <p><strong>Código postal:</strong> Cualquiera (ej: 12345)</p>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tarjeta de Crédito o Débito
          </label>
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* Mensaje de error */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Información de seguridad */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <FaLock />
            <span>{isTestMode ? 'Modo de prueba - Pagos simulados' : 'Pago 100% seguro procesado por Stripe'}</span>
          </p>
        </div>

        {/* Botón de pago */}
        <button
          type="submit"
          disabled={!stripe || !clientSecret || loading || externalLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
            !stripe || !clientSecret || loading || externalLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading || externalLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              {loading ? 'Procesando pago...' : 'Inicializando...'}
            </>
          ) : !clientSecret ? (
            <>
              <FaSpinner className="animate-spin" />
              Preparando pago...
            </>
          ) : (
            <>
              <FaCreditCard />
              Pagar Bs. {monto}
            </>
          )}
        </button>

        {/* Mensaje de ayuda si Stripe no está listo */}
        {!stripe && (
          <p className="mt-2 text-sm text-yellow-600 text-center">
            ⏳ Cargando sistema de pago seguro...
          </p>
        )}
      </form>

      {/* Footer con logos de tarjetas */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center mb-3">Aceptamos:</p>
        <div className="flex justify-center items-center gap-4 flex-wrap">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" 
            alt="Visa" 
            className="h-6"
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" 
            alt="Mastercard" 
            className="h-6"
          />
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" 
            alt="American Express" 
            className="h-6"
          />
        </div>
      </div>
    </div>
  );
};

export default StripePaymentForm;
