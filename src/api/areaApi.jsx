import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Obtener todas las áreas
export const getAreas = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/areas/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    throw error;
  }
};

// Obtener un área por ID
export const getArea = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/areas/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener área:', error);
    throw error;
  }
};

// Crear nueva área
export const createArea = async (areaData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/areas/`, areaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear área:', error);
    throw error;
  }
};

// Actualizar área
export const updateArea = async (id, areaData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/areas/${id}/`, areaData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar área:', error);
    throw error;
  }
};

// Eliminar área
export const deleteArea = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/areas/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar área:', error);
    throw error;
  }
};