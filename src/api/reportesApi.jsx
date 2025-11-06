/**
 * API Service para Reportes
 * Maneja todas las llamadas al backend para el módulo de reportes
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar el token a todas las peticiones
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

/**
 * Obtiene la lista de reportes estáticos disponibles
 */
export const obtenerReportesDisponibles = async () => {
  try {
    const response = await api.get('/ia/reportes/disponibles/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener reportes disponibles:', error);
    throw error;
  }
};

/**
 * Genera un reporte estático
 * @param {Object} data - Datos del reporte
 * @param {string} data.tipo_reporte - Tipo de reporte (ordenes_estado, etc.)
 * @param {string} data.formato - Formato (PDF, XLSX)
 * @param {string} data.fecha_inicio - Fecha inicio (opcional)
 * @param {string} data.fecha_fin - Fecha fin (opcional)
 */
export const generarReporteEstatico = async (data) => {
  try {
    const response = await api.post('/ia/reportes/generar_estatico/', data);
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte estático:', error);
    throw error;
  }
};

/**
 * Obtiene la configuración de entidades disponibles para reportes personalizados
 */
export const obtenerEntidades = async () => {
  try {
    const response = await api.get('/ia/reportes/entidades/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener entidades:', error);
    throw error;
  }
};

/**
 * Genera un reporte personalizado
 * @param {Object} data - Configuración del reporte
 * @param {string} data.nombre - Nombre del reporte
 * @param {string} data.entidad - Entidad (ordenes, clientes, vehiculos, items)
 * @param {Array<string>} data.campos - Lista de campos a incluir
 * @param {Object} data.filtros - Objeto con filtros a aplicar
 * @param {Array<string>} data.ordenamiento - Lista de campos para ordenar
 * @param {string} data.formato - Formato (PDF, XLSX)
 */
export const generarReportePersonalizado = async (data) => {
  try {
    const response = await api.post('/ia/reportes/generar-personalizado/', data);
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte personalizado:', error);
    throw error;
  }
};

/**
 * Obtiene el historial de reportes del usuario
 */
export const obtenerHistorialReportes = async () => {
  try {
    const response = await api.get('/ia/reportes/historial/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial:', error);
    throw error;
  }
};

/**
 * Descarga un reporte generado
 * @param {number} reporteId - ID del reporte
 */
export const descargarReporte = async (reporteId) => {
  try {
    const response = await api.get(`/ia/reportes/${reporteId}/descargar/`, {
      responseType: 'blob',
    });
    
    // Obtener el tipo de contenido del response
    const contentType = response.headers['content-type'];
    
    // Crear blob con el tipo correcto
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Obtener nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let filename = `reporte_${reporteId}`;
    
    if (contentDisposition) {
      // Buscar filename en el header
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    // Si no se pudo obtener el nombre, usar extensión según content-type
    if (!filename.includes('.')) {
      if (contentType.includes('pdf')) {
        filename += '.pdf';
      } else if (contentType.includes('spreadsheet') || contentType.includes('excel')) {
        filename += '.xlsx';
      }
    }
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar reporte:', error);
    throw error;
  }
};

/**
 * Genera un reporte usando lenguaje natural
 * @param {Object} data - Datos del reporte
 * @param {string} data.consulta - Consulta en lenguaje natural
 * @param {string} data.nombre - Nombre del reporte (opcional)
 * @param {string} data.formato - Formato (PDF, XLSX)
 */
export const generarReporteNatural = async (data) => {
  try {
    const response = await api.post('/ia/reportes/generar-natural/', data);
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte natural:', error);
    throw error;
  }
};

/**
 * Obtiene ejemplos de consultas en lenguaje natural
 */
export const obtenerEjemplosNL = async () => {
  try {
    const response = await api.get('/ia/reportes/ejemplos-nl/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener ejemplos:', error);
    throw error;
  }
};

/**
 * Obtiene la URL de descarga de un reporte
 * @param {number} reporteId - ID del reporte
 */
export const obtenerUrlDescarga = (reporteId) => {
  const token = localStorage.getItem('access');
  // Remover la doble barra si API_BASE_URL termina con /
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}/ia/reportes/${reporteId}/descargar/?token=${token}`;
};

export default {
  obtenerReportesDisponibles,
  generarReporteEstatico,
  obtenerEntidades,
  generarReportePersonalizado,
  generarReporteNatural,
  obtenerEjemplosNL,
  obtenerHistorialReportes,
  descargarReporte,
  obtenerUrlDescarga,
};
