// API para gestión de pagos con Stripe
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

// Configurar axios con interceptores para autenticación
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Interceptor para agregar token de autorización
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== FUNCIONES DE PAGOS ====================

/**
 * Obtener todos los pagos (con filtros opcionales)
 * @param {Object} filters - Filtros opcionales (orden_trabajo, estado, metodo_pago)
 * @returns {Promise<Array>} Lista de pagos
 */
export const fetchPagos = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.orden_trabajo) params.append('orden_trabajo', filters.orden_trabajo);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.metodo_pago) params.append('metodo_pago', filters.metodo_pago);
    
    const response = await apiClient.get(`pagos/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    throw error;
  }
};

/**
 * Obtener un pago por ID
 * @param {number} id - ID del pago
 * @returns {Promise<Object>} Datos del pago
 */
export const fetchPagoById = async (id) => {
  try {
    const response = await apiClient.get(`pagos/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener pago:', error);
    throw error;
  }
};

/**
 * Crear un pago manual (efectivo, transferencia, etc.)
 * @param {Object} pagoData - Datos del pago
 * @returns {Promise<Object>} Pago creado
 */
export const createPagoManual = async (pagoData) => {
  try {
    const response = await apiClient.post('pagos/', pagoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear pago manual:', error);
    throw error;
  }
};

/**
 * Obtener el historial de pagos de una orden
 * @param {number} pagoId - ID de cualquier pago de la orden
 * @returns {Promise<Object>} Historial de pagos
 */
export const fetchHistorialPagos = async (pagoId) => {
  try {
    const response = await apiClient.get(`pagos/${pagoId}/historial/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    throw error;
  }
};

// ==================== FUNCIONES DE STRIPE ====================

/**
 * Crear un Payment Intent de Stripe
 * @param {Object} data - Datos para crear el payment intent
 * @param {number} data.orden_trabajo_id - ID de la orden de trabajo
 * @param {number} [data.monto] - Monto a cobrar (opcional, usa el total de la orden si no se proporciona)
 * @param {string} [data.descripcion] - Descripción del pago (opcional)
 * @returns {Promise<Object>} Client secret y datos del payment intent
 */
export const createPaymentIntent = async (data) => {
  try {
    console.log('🔄 Creando Payment Intent con datos:', data);
    const response = await apiClient.post('pagos/create-payment-intent/', data);
    console.log('✅ Payment Intent creado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear Payment Intent:', error);
    throw error;
  }
};

/**
 * Confirmar un pago de Stripe
 * @param {string} paymentIntentId - ID del Payment Intent de Stripe
 * @returns {Promise<Object>} Confirmación del pago
 */
export const confirmPayment = async (paymentIntentId) => {
  try {
    console.log('🔄 Confirmando pago:', paymentIntentId);
    const response = await apiClient.post('pagos/confirm-payment/', {
      payment_intent_id: paymentIntentId
    });
    console.log('✅ Pago confirmado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al confirmar pago:', error);
    throw error;
  }
};

/**
 * Reembolsar un pago de Stripe
 * @param {Object} data - Datos del reembolso
 * @param {number} data.pago_id - ID del pago a reembolsar
 * @param {number} [data.monto] - Monto a reembolsar (opcional, reembolsa el total si no se proporciona)
 * @param {string} [data.razon] - Razón del reembolso (opcional)
 * @returns {Promise<Object>} Confirmación del reembolso
 */
export const refundPayment = async (data) => {
  try {
    console.log('🔄 Procesando reembolso:', data);
    const response = await apiClient.post('pagos/refund/', data);
    console.log('✅ Reembolso procesado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al procesar reembolso:', error);
    throw error;
  }
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Formatear monto en bolivianos
 * @param {number} monto - Monto a formatear
 * @returns {string} Monto formateado
 */
export const formatMonto = (monto) => {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
  }).format(monto);
};

/**
 * Obtener el color del badge según el estado del pago
 * @param {string} estado - Estado del pago
 * @returns {string} Clase CSS para el color
 */
export const getEstadoColor = (estado) => {
  const colores = {
    'pendiente': 'bg-yellow-100 text-yellow-800',
    'procesando': 'bg-blue-100 text-blue-800',
    'completado': 'bg-green-100 text-green-800',
    'fallido': 'bg-red-100 text-red-800',
    'reembolsado': 'bg-purple-100 text-purple-800',
    'cancelado': 'bg-gray-100 text-gray-800',
  };
  return colores[estado] || 'bg-gray-100 text-gray-800';
};

/**
 * Obtener el ícono según el método de pago
 * @param {string} metodo - Método de pago
 * @returns {string} Nombre del ícono
 */
export const getMetodoIcon = (metodo) => {
  const iconos = {
    'efectivo': 'FaMoneyBillWave',
    'tarjeta': 'FaCreditCard',
    'transferencia': 'FaExchangeAlt',
    'stripe': 'FaStripe',
    'otro': 'FaQuestionCircle',
  };
  return iconos[metodo] || 'FaQuestionCircle';
};

export default {
  fetchPagos,
  fetchPagoById,
  createPagoManual,
  fetchHistorialPagos,
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  formatMonto,
  getEstadoColor,
  getMetodoIcon,
};
