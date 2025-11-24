import axios from "axios";

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para añadir el token de autenticación
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

// Obtiene todos los vehículos del cliente autenticado
export async function fetchVehiculosCliente() {
  try {
    const token = localStorage.getItem('access');
    console.log('📋 Obteniendo vehículos del cliente...');
    console.log('🔑 Token:', token ? 'Presente' : 'Ausente');
    
    const response = await apiClient.get('/vehiculos/mis-vehiculos/');
    console.log('✅ Vehículos obtenidos:', response.data);
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error('❌ Error al obtener vehículos:', error);
    console.error('📊 Detalles del error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
    
    if (error.response?.status === 401) {
      throw error; // Propagar error de autenticación
    }
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

// Obtiene un vehículo por ID
export async function fetchVehiculoById(id) {
  try {
    console.log('🚗 Obteniendo vehículo ID:', id);
    const response = await apiClient.get(`/vehiculos/${id}/`);
    console.log('✅ Vehículo obtenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener vehículo:', error);
    throw new Error('Error al obtener el vehículo.');
  }
}

