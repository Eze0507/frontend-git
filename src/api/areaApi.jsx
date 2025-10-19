import axios from 'axios';

// Crear instancia de Axios con configuración base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
});

// Interceptor para añadir el token de autenticación a cada solicitud
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Obtener todas las áreas
export const getAreas = async () => {
  try {
    console.log('📤 Obteniendo áreas...');
    console.log('🔑 Token:', localStorage.getItem('access') ? 'Presente' : 'Ausente');
    const response = await apiClient.get('/areas/');
    console.log('✅ Áreas obtenidas:', response.data);
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error('❌ Error al obtener áreas:', error);
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
      
      if (error.response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para ver las áreas.');
      }
    }
    throw new Error('Error al obtener las áreas.');
  }
};

// Obtener un área por ID
export const getArea = async (id) => {
  try {
    const response = await apiClient.get(`/areas/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener área:', error);
    if (error.response?.status === 401) {
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    throw new Error('Error al obtener el área.');
  }
};

// Crear nueva área
export const createArea = async (areaData) => {
  try {
    const response = await apiClient.post('/areas/', areaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear área:', error);
    if (error.response?.status === 401) {
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para crear áreas.');
    }
    throw new Error('Error al crear el área.');
  }
};

// Actualizar área
export const updateArea = async (id, areaData) => {
  try {
    const response = await apiClient.put(`/areas/${id}/`, areaData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar área:', error);
    if (error.response?.status === 401) {
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para actualizar áreas.');
    }
    throw new Error('Error al actualizar el área.');
  }
};

// Eliminar área
export const deleteArea = async (id) => {
  try {
    const response = await apiClient.delete(`/areas/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar área:', error);
    if (error.response?.status === 401) {
      throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    }
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para eliminar áreas.');
    }
    throw new Error('Error al eliminar el área.');
  }
};