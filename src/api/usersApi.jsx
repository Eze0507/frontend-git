import axios from 'axios';

// Creamos una instancia de Axios que se usará para todas las llamadas a la API.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para añadir el token de autenticación a cada solicitud.
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

export const fetchAllUsers = async () => {
  try {
    const response = await apiClient.get('/users/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los usuarios.');
  }
};

export const fetchAllRoles = async () => {
  try {
    const response = await apiClient.get('/groupsAux/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los roles.');
  }
};

export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/users/', userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar el usuario.');
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await apiClient.put(`/users/${userId}/`, userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el usuario.');
  }
};

export const deleteUser = async (userId) => {
  try {
    await apiClient.delete(`/users/${userId}/`);
  } catch (error) {
    throw new Error('Error al eliminar el usuario.');
  }
};
