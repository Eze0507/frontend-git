// src/api/presupuestosApi.jsx
import axios from "axios";

// Instancia de Axios
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

// ===== PRESUPUESTOS =====
export const fetchAllPresupuestos = async () => {
  try {
    const response = await apiClient.get('/presupuestos/');
    return response.data;
  } catch (error) {
    console.error('Error en fetchAllPresupuestos:', error);
    throw new Error('Error al obtener los presupuestos: ' + error.message);
  }
};

export const fetchPresupuestoById = async (id) => {
  try {
    const response = await apiClient.get(`/presupuestos/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener el presupuesto.');
  }
};

export const createPresupuesto = async (presupuestoData) => {
  try {
    const response = await apiClient.post('/presupuestos/', presupuestoData);
    return response.data;
  } catch (error) {
    console.error('Error del backend:', error.response?.data);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el presupuesto.');
  }
};

export const updatePresupuesto = async (id, presupuestoData) => {
  try {
    const response = await apiClient.put(`/presupuestos/${id}/`, presupuestoData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el presupuesto.');
  }
};

export const deletePresupuesto = async (id) => {
  try {
    await apiClient.delete(`/presupuestos/${id}/`);
  } catch (error) {
    throw new Error('Error al eliminar el presupuesto.');
  }
};

// ===== DETALLES PRESUPUESTO =====
export const fetchDetallesByPresupuesto = async (presupuestoId) => {
  try {
    const response = await apiClient.get(`/detalles-presupuesto/?presupuesto_id=${presupuestoId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los detalles del presupuesto.');
  }
};

export const createDetallePresupuesto = async (detalleData) => {
  try {
    const response = await apiClient.post('/detalles-presupuesto/', detalleData);
    return response.data;
  } catch (error) {
    console.error('Error del backend:', error.response?.data);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el detalle.');
  }
};

export const updateDetallePresupuesto = async (id, detalleData) => {
  try {
    const response = await apiClient.put(`/detalles-presupuesto/${id}/`, detalleData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el detalle.');
  }
};

export const deleteDetallePresupuesto = async (id) => {
  try {
    await apiClient.delete(`/detalles-presupuesto/${id}/`);
  } catch (error) {
    throw new Error('Error al eliminar el detalle del presupuesto.');
  }
};

// ===== BULK OPERATIONS =====
export const bulkCreateDetalles = async (detallesData) => {
  try {
    const response = await apiClient.post('/detalles-presupuesto/bulk_create/', detallesData);
    return response.data;
  } catch (error) {
    console.error('Error del backend:', error.response?.data);
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear los detalles en lote.');
  }
};

// ===== HELPERS =====
export const fetchItemsForPresupuesto = async () => {
  try {
    const response = await apiClient.get('/items/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los items.');
  }
};

export const fetchVehiculosForPresupuesto = async () => {
  try {
    // El backend registra 'vehiculos' en la ruta /api/vehiculos/
    const response = await apiClient.get('/vehiculos/');
    console.log('Vehículos response:', response.status);
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    throw new Error('Error al obtener los vehículos.');
  }
};

export const fetchClientesForPresupuesto = async () => {
  try {
    const response = await apiClient.get('/clientes/?activo=true');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los clientes.');
  }
};

export const checkUserPermissions = () => {
  // Simular permisos de usuario
  return {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true
  };
};
