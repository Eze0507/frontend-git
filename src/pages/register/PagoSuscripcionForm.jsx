import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaCreditCard, FaLock, FaSpinner } from 'react-icons/fa';
import { crearSuscripcionEmbebida } from '@/api/suscripcionApi';

const PagoSuscripcionForm = ({ plan, precio, onSuccess, onCancel, priceId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // 1. Crear Payment Intent y Suscripción en el backend
      console.log('🔄 Creando suscripción con priceId:', priceId);
      const { subscriptionId, clientSecret, paymentIntentId } = await crearSuscripcionEmbebida(priceId);

      if (!clientSecret) {
        throw new Error('No se recibió el clientSecret del servidor');
      }

      console.log('✅ Client Secret recibido:', clientSecret.substring(0, 20) + '...');
      console.log('✅ Subscription ID:', subscriptionId);
      console.log('✅ Payment Intent ID:', paymentIntentId);

      // 2. Confirmar el pago con Stripe
      console.log('💳 Confirmando pago...');
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        }
      );

      if (stripeError) {
        console.error('❌ Error de Stripe:', stripeError);
        throw new Error(stripeError.message);
      }

      // 3. Verificar que el pago fue exitoso
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Pago confirmado exitosamente');
        console.log('💳 Payment Intent Status:', paymentIntent.status);
        
        // Pasar subscriptionId y paymentIntentId al padre
        onSuccess(subscriptionId, paymentIntentId);
      } else {
        throw new Error('El pago no se completó correctamente');
      }

    } catch (err) {
      console.error('❌ Error en el pago:', err);
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Información de Pago
        </h2>
        <p className="text-gray-600">
          Plan seleccionado: <span className="font-semibold">{plan}</span>
        </p>
        <p className="text-lg font-bold text-blue-600 mt-2">
          Bs {precio} / mes
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCreditCard className="inline mr-2" />
            Información de Tarjeta
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center text-sm text-blue-800">
            <FaLock className="mr-2" />
            <span>Pago seguro procesado por Stripe</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!stripe || processing}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {processing ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              'Confirmar Pago'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PagoSuscripcionForm;
