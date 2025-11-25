import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Crear una suscripción embebida con Stripe
 * @param {string} priceId - ID del precio de Stripe
 * @returns {Promise} - subscriptionId y clientSecret
 */
export const crearSuscripcionEmbebida = async (priceId) => {
  try {
    const token = localStorage.getItem('access');
    
    const response = await axios.post(
      `${API_URL}crear-suscripcion-embedded/`,
      {
        price_id: priceId
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creando suscripción embebida:', error);
    throw error;
  }
};

/**
 * Activar suscripción del taller
 * @param {string} plan - Nombre del plan (BASIC, PRO, ENTERPRISE)
 * @param {string} paymentIntentId - ID del Payment Intent de Stripe (opcional)
 * @returns {Promise}
 */
export const activarSuscripcion = async (plan, paymentIntentId = null) => {
  try {
    const token = localStorage.getItem('access');
    
    const requestData = { plan };
    if (paymentIntentId) {
      requestData.payment_intent_id = paymentIntentId;
    }
    
    const response = await axios.post(
      `${API_URL}activar-suscripcion/`,
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error activando suscripción:', error);
    throw error;
  }
};

/**
 * Verificar estado de la suscripción
 * @returns {Promise}
 */
export const verificarSuscripcion = async () => {
  try {
    const token = localStorage.getItem('access');
    
    const response = await axios.get(
      `${API_URL}verificar-suscripcion/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error verificando suscripción:', error);
    throw error;
  }
};
