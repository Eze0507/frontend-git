// src/api/detallenominaApi.jsx
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

// ============ DETALLE NOMINAS ============
export const fetchDetallesNomina = async (params = {}) => {
  try {
    const response = await apiClient.get('/detalle-nomina/', { params });
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    throw new Error('Error al obtener los detalles de nómina.');
  }
};

export const fetchDetalleById = async (id) => {
  try {
    const response = await apiClient.get(`/detalle-nomina/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el detalle.');
  }
};

export const createDetalleNomina = async (detalleData) => {
  try {
    const response = await apiClient.post('/detalle-nomina/', detalleData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el detalle.');
  }
};

export const updateDetalleNomina = async (id, detalleData) => {
  try {
    const response = await apiClient.put(`/detalle-nomina/${id}/`, detalleData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el detalle.');
  }
};

export const deleteDetalleNomina = async (id) => {
  try {
    await apiClient.delete(`/detalle-nomina/${id}/`);
  } catch (error) {
    throw new Error('Error al eliminar el detalle.');
  }
};

export const recalcularDetalleNomina = async (id) => {
  try {
    const response = await apiClient.post(`/detalle-nomina/${id}/recalcular/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al recalcular el detalle.');
  }
};
