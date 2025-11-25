// API para gestión de asistencias
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
    // CRÍTICO: Agregar Accept: application/json para evitar redirección 302 al login
    config.headers['Accept'] = 'application/json';
    config.headers['Content-Type'] = 'application/json';
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
   API: Asistencias (Admin)
   ========================= */
export async function fetchAllAsistencias(filters = {}) {
  try {
    const params = new URLSearchParams();
    // Solo agregar fecha si está presente y no está vacía
    if (filters.fecha && filters.fecha.trim() !== '') {
      params.append('fecha', filters.fecha);
    }
    if (filters.empleado_id) params.append('empleado_id', filters.empleado_id);
    if (filters.estado) params.append('estado', filters.estado);
    
    const url = params.toString() 
      ? `/asistencias/?${params.toString()}`
      : `/asistencias/`;
    
    console.log('[ASISTENCIAS API] 🔄 Llamando a:', url);
    console.log('[ASISTENCIAS API] Filtros:', filters);
    
    const response = await apiClient.get(url);
    console.log('[ASISTENCIAS API] ✅ Status:', response.status);
    console.log('[ASISTENCIAS API] ✅ Respuesta completa:', response.data);
    
    // Manejar respuesta que puede ser lista o objeto con results
    let asistencias = [];
    
    if (Array.isArray(response.data)) {
      asistencias = response.data;
      console.log('[ASISTENCIAS API] ✅ Es array directo, cantidad:', asistencias.length);
    } else if (response.data && response.data.results) {
      asistencias = response.data.results;
      console.log('[ASISTENCIAS API] ✅ Tiene results, cantidad:', asistencias.length);
      console.log('[ASISTENCIAS API] Count:', response.data.count);
    } else if (response.data && response.data.count !== undefined) {
      // Si tiene count pero no results, puede estar vacío
      asistencias = response.data.results || [];
      console.log('[ASISTENCIAS API] ⚠️ Tiene count pero results vacío, count:', response.data.count);
      if (response.data.debug_info) {
        console.log('[ASISTENCIAS API] 🔍 Debug info:', response.data.debug_info);
      }
    } else {
      console.warn('[ASISTENCIAS API] ⚠️ Formato de respuesta no reconocido:', response.data);
      asistencias = [];
    }
    
    // Log adicional si está vacío
    if (asistencias.length === 0) {
      console.warn('[ASISTENCIAS API] ⚠️ Lista de asistencias está vacía');
      if (response.data && response.data.debug_info) {
        console.warn('[ASISTENCIAS API] 🔍 Debug info disponible:', response.data.debug_info);
      }
    }
    
    if (asistencias.length > 0) {
      console.log('[ASISTENCIAS API] 📋 Primeras 3 asistencias:', asistencias.slice(0, 3).map(a => ({
        id: a.id,
        empleado: a.nombre_empleado || `${a.empleado?.nombre} ${a.empleado?.apellido}`,
        fecha: a.fecha
      })));
    }
    
    return asistencias;
  } catch (error) {
    console.error('[ASISTENCIAS API] ❌ Error completo:', error);
    console.error('[ASISTENCIAS API] ❌ Error response:', error.response?.data);
    throw new Error(error.response?.data?.error || error.message || 'Error al obtener asistencias.');
  }
}

export async function fetchAsistenciaById(id) {
  try {
    const response = await apiClient.get(`/asistencias/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    throw new Error('Error al obtener asistencia.');
  }
}

export async function createAsistencia(asistenciaData) {
  try {
    const response = await apiClient.post('/asistencias/', asistenciaData);
    return response.data;
  } catch (error) {
    console.error('Error al crear asistencia:', error);
    throw new Error(error.response?.data?.detail || 'Error al crear asistencia.');
  }
}

export async function updateAsistencia(id, asistenciaData) {
  try {
    const response = await apiClient.put(`/asistencias/${id}/`, asistenciaData);
    return response.data;
  } catch (error) {
    console.error('Error al actualizar asistencia:', error);
    throw new Error(error.response?.data?.detail || 'Error al actualizar asistencia.');
  }
}

export async function deleteAsistencia(id) {
  try {
    await apiClient.delete(`/asistencias/${id}/`);
  } catch (error) {
    console.error('Error al eliminar asistencia:', error);
    throw new Error('Error al eliminar asistencia.');
  }
}

/* =========================
   API: Marcar Asistencia (Empleado)
   ========================= */
export async function marcarAsistencia(tipo) {
  try {
    const response = await apiClient.post('/asistencia/marcar/', { tipo });
    return response.data;
  } catch (error) {
    console.error('Error al marcar asistencia:', error);
    throw new Error(error.response?.data?.error || 'Error al marcar asistencia.');
  }
}

/* =========================
   API: Reporte Mensual (Admin)
   ========================= */
export async function fetchReporteMensual(año, mes) {
  try {
    const response = await apiClient.get(`/asistencia/reporte-mensual/?año=${año}&mes=${mes}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener reporte mensual:', error);
    throw new Error('Error al obtener reporte mensual.');
  }
}








