// API para Backup y Restore del sistema
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';

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

/**
 * Crear y descargar un backup del sistema
 * @returns {Promise<void>}
 */
export const createBackup = async () => {
  try {
    const response = await apiClient.get('/backup/', {
      responseType: 'blob', // Importante para descargar archivos
    });

    // Obtener el nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'backup.json';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Crear blob y descargar
    const blob = new Blob([response.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  } catch (error) {
    console.error('Error al crear backup:', error);
    
    // Intentar leer el error como JSON si es posible
    if (error.response?.data) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.error || 'Error al crear backup');
      } catch (e) {
        throw new Error(error.response?.statusText || 'Error al crear backup');
      }
    }
    
    throw new Error(error.message || 'Error al crear backup');
  }
};

/**
 * Restaurar un backup desde un archivo
 * @param {File} file - Archivo JSON del backup
 * @returns {Promise<Object>} Resumen de la restauración
 */
export const restoreBackup = async (file) => {
  try {
    const formData = new FormData();
    formData.append('backup_file', file);
    formData.append('replace', 'true');

    const response = await apiClient.post('/restore/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error al restaurar backup:', error);
    
    if (error.response?.data) {
      // Si el error viene como JSON
      if (typeof error.response.data === 'object') {
        throw new Error(error.response.data.error || 'Error al restaurar backup');
      }
      // Si viene como texto
      try {
        const errorData = JSON.parse(error.response.data);
        throw new Error(errorData.error || 'Error al restaurar backup');
      } catch (e) {
        throw new Error(error.response.data || 'Error al restaurar backup');
      }
    }
    
    throw new Error(error.message || 'Error al restaurar backup');
  }
};

