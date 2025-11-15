import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

/**
 * Registra un nuevo taller con su propietario
 * @param {Object} tallerData - Datos del taller y propietario
 * @param {string} tallerData.username - Nombre de usuario del propietario
 * @param {string} tallerData.email - Email del propietario (opcional)
 * @param {string} tallerData.password - Contraseña del propietario
 * @param {string} tallerData.nombre_taller - Nombre del taller
 * @returns {Promise} Respuesta del servidor
 */
export const registrarTaller = async (tallerData) => {
  try {
    const response = await axios.post(
      `${API_URL}taller/`,
      tallerData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error al registrar taller:', error);
    if (error.response) {
      // El servidor respondió con un código de error
      throw new Error(error.response.data.message || JSON.stringify(error.response.data));
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      throw new Error('No se recibió respuesta del servidor');
    } else {
      // Error al configurar la petición
      throw new Error(error.message);
    }
  }
};

/**
 * Obtiene el perfil del taller actual
 * @returns {Promise} Datos del taller
 */
export const obtenerPerfilTaller = async () => {
  try {
    const token = localStorage.getItem('access');
    const response = await axios.get(
      `${API_URL}perfil-taller/`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener perfil del taller:', error);
    throw error;
  }
};

/**
 * Actualiza el perfil del taller
 * @param {Object} tallerData - Datos del taller a actualizar
 * @param {File} logoFile - Archivo de imagen del logo (opcional)
 * @returns {Promise} Respuesta del servidor
 */
export const actualizarPerfilTaller = async (tallerData, logoFile = null) => {
  try {
    const token = localStorage.getItem('access');
    
    // Crear FormData para manejar la subida de archivos
    const formData = new FormData();
    
    // Agregar todos los campos del taller
    Object.keys(tallerData).forEach(key => {
      if (tallerData[key] !== null && tallerData[key] !== undefined && tallerData[key] !== '') {
        formData.append(key, tallerData[key]);
      }
    });
    
    // Agregar el archivo de logo si existe
    if (logoFile) {
      // Validar que sea una imagen
      if (!logoFile.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen (PNG, JPG, GIF)');
      }
      
      // Validar tamaño (máximo 5MB)
      if (logoFile.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB permitido');
      }
      
      formData.append('logo_file', logoFile);
    }
    
    const response = await axios.put(
      `${API_URL}perfil-taller/`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Requested-With': 'XMLHttpRequest',
          // No especificar Content-Type para que Axios lo maneje automáticamente con FormData
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar perfil del taller:', error);
    
    // Mejorar el mensaje de error
    if (error.response) {
      const errorData = error.response.data;
      let errorMessage = 'Error al actualizar el taller';
      
      if (error.response.status === 500) {
        errorMessage = 'Error interno del servidor. Posible problema con ImgBB';
      } else if (error.response.status === 413) {
        errorMessage = 'El archivo es demasiado grande';
      } else if (error.response.status === 400) {
        errorMessage = errorData.detail || errorData.error || 'Datos inválidos';
      } else if (error.response.status === 401) {
        errorMessage = 'No tienes permisos para actualizar el taller';
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw error;
    }
  }
};
