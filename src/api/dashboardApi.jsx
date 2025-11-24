// API para gestión de dashboard
import axios from 'axios';

// URL base de tu API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

/* =========================
   API: Dashboard Admin
   ========================= */
export async function fetchDashboardAdmin() {
  try {
    const response = await apiClient.get('/dashboard/admin/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos del dashboard admin:', error);
    throw new Error('Error al obtener datos del dashboard.');
  }
}

/* =========================
   API: Dashboard Empleado
   ========================= */
export async function fetchDashboardEmpleado() {
  try {
    const response = await apiClient.get('/dashboard/empleado/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos del dashboard empleado:', error);
    throw new Error('Error al obtener datos del dashboard.');
  }
}

