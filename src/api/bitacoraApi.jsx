import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configurar axios con token por defecto
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token automáticamente (usar 'access' como las otras APIs)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const bitacoraApi = {
  // Obtener todos los registros de bitácora con filtros
  getBitacora: async (params = {}) => {
    try {
      const response = await api.get('bitacora/', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener bitácora:', error);
      throw error;
    }
  },

  // Obtener un registro específico
  getBitacoraById: async (id) => {
    try {
      const response = await api.get(`bitacora/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener registro de bitácora:', error);
      throw error;
    }
  },

  // Obtener opciones para filtros
  getFilterOptions: async () => {
    try {
      // Obtener algunos registros para extraer opciones únicas
      const response = await api.get('bitacora/');
      const data = response.data.results || [];
      
      const modulos = [...new Set(data.map(item => item.modulo))];
      const acciones = [...new Set(data.map(item => item.accion))];
      const usuarios = [...new Set(data.map(item => item.usuario_nombre))];
      
      return {
        modulos,
        acciones,
        usuarios
      };
    } catch (error) {
      console.error('Error al obtener opciones de filtro:', error);
      return { modulos: [], acciones: [], usuarios: [] };
    }
  }
};
