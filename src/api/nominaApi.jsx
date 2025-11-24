// src/api/nominaApi.jsx
import axios from "axios";

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

// ============ NOMINAS ============
export const fetchAllNominas = async (params = {}) => {
  try {
    const response = await apiClient.get('/nominas/', { params });
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    throw new Error('Error al obtener las nóminas.');
  }
};

export const fetchNominaById = async (id) => {
  try {
    const response = await apiClient.get(`/nominas/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener la nómina.');
  }
};

export const createNomina = async (nominaData) => {
  try {
    const response = await apiClient.post('/nominas/', nominaData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear la nómina.');
  }
};

export const updateNomina = async (id, nominaData) => {
  try {
    const response = await apiClient.put(`/nominas/${id}/`, nominaData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar la nómina.');
  }
};

export const deleteNomina = async (id) => {
  try {
    await apiClient.delete(`/nominas/${id}/`);
  } catch (error) {
    throw new Error('Error al eliminar la nómina.');
  }
};

export const cambiarEstadoNomina = async (id, estado) => {
  try {
    const response = await apiClient.patch(`/nominas/${id}/cambiar_estado/`, { estado });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error al cambiar el estado de la nómina.');
  }
};

export const recalcularNomina = async (id) => {
  try {
    const response = await apiClient.post(`/nominas/${id}/recalcular/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al recalcular la nómina.');
  }
};

export const fetchEstadisticasNomina = async () => {
  try {
    const response = await apiClient.get('/nominas/estadisticas/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener las estadísticas.');
  }
};
