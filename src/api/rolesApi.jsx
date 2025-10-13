// src/api/rolesApi.jsx
import axios from "axios";

// Instancia de Axios igual que en cargoApi
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

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

export const fetchAllRoles = async () => {
  try {
    const response = await apiClient.get('/groupsAux/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los roles.');
  }
};

export const fetchAllPermissions = async () => {
  try {
    const response = await apiClient.get('/permissions/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los permisos.');
  }
};

export const createRole = async (roleData) => {
  try {
    console.log('Enviando al backend:', roleData);
    const response = await apiClient.post('/groupsAux/', roleData);
    console.log('Respuesta del backend:', response.data);
    console.log('¿Tiene permisos la respuesta?', response.data.permissions);
    return response.data;
  } catch (error) {
    console.error('Error del backend:', error.response?.data);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar el rol.');
  }
};

export const updateRole = async (id, roleData) => {
  try {
    const response = await apiClient.put(`/groupsAux/${id}/`, roleData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el rol.');
  }
};

export const deleteRole = async (id) => {
  try {
    await apiClient.delete(`/groupsAux/${id}/`);
  } catch (error) {
    throw new Error('Error al eliminar el rol.');
  }
};
