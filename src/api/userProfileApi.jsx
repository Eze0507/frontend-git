import axios from "axios";

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

/* =========================
   API: Perfil de Usuario
   ========================= */

/**
 * Obtiene el perfil del usuario autenticado
 * Intenta primero como empleado, luego como cliente
 */
export async function fetchUserProfile() {
  try {
    console.log('🔍 Buscando perfil de usuario...');
    
    // Intentar obtener perfil de empleado primero
    try {
      const response = await apiClient.get('/empleado/profile/');
      console.log('✅ Perfil de empleado encontrado:', response.data);
      return {
        type: 'empleado',
        data: response.data
      };
    } catch (empleadoError) {
      if (empleadoError.response?.status === 404) {
        console.log('ℹ️ No es empleado, intentando como cliente...');
        
        // Si no es empleado, intentar como cliente
        try {
          const response = await apiClient.get('/cliente/profile/');
          console.log('✅ Perfil de cliente encontrado:', response.data);
          return {
            type: 'cliente',
            data: response.data
          };
        } catch (clienteError) {
          if (clienteError.response?.status === 404) {
            throw new Error('No se encontró perfil de usuario asociado a esta cuenta');
          }
          throw clienteError;
        }
      } else {
        throw empleadoError;
      }
    }
  } catch (error) {
    console.error('❌ Error al obtener perfil:', error);
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      if (error.response.status === 404) {
        throw new Error('No se encontró perfil asociado a este usuario.');
      }
      throw new Error(`Error del servidor: ${error.response.status}`);
    }
    throw new Error('Error de conexión al obtener el perfil.');
  }
}

/**
 * Actualiza el perfil del usuario
 */
export async function updateUserProfile(userType, profileData) {
  try {
    console.log('📤 Actualizando perfil:', { userType, profileData });
    
    const endpoint = userType === 'empleado' ? '/empleado/profile/' : '/cliente/profile/';
    
    const response = await apiClient.put(endpoint, profileData);
    console.log('✅ Perfil actualizado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
      
      // Manejo específico de errores de validación del backend
      if (error.response.status === 400) {
        const errorData = error.response.data;
        const validationErrors = {};
        
        // Mapear errores de validación
        if (errorData.nombre) validationErrors.nombre = errorData.nombre[0];
        if (errorData.apellido) validationErrors.apellido = errorData.apellido[0];
        if (errorData.telefono) validationErrors.telefono = errorData.telefono[0];
        if (errorData.email) validationErrors.email = errorData.email[0];
        if (errorData.ci) validationErrors.ci = errorData.ci[0];
        if (errorData.nit) validationErrors.nit = errorData.nit[0];
        if (errorData.direccion) validationErrors.direccion = errorData.direccion[0];
        
        if (Object.keys(validationErrors).length > 0) {
          throw { validationErrors, message: 'Errores de validación en el formulario' };
        }
      }
      
      if (error.response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      
      if (error.response.status === 404) {
        throw new Error('Perfil no encontrado.');
      }
      
      throw new Error(`Error del servidor: ${error.response.status}`);
    }
    throw new Error('Error de conexión al actualizar el perfil.');
  }
}

/**
 * Cambia la contraseña del usuario
 */
export async function changePassword(passwordData) {
  try {
    console.log('🔐 Cambiando contraseña...');
    
    // Validar datos antes de enviar
    if (!passwordData.old_password) {
      throw new Error('La contraseña actual es requerida');
    }
    if (!passwordData.new_password) {
      throw new Error('La nueva contraseña es requerida');
    }
    if (passwordData.new_password.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
    }
    
    const response = await apiClient.post('/change-password/', {
      old_password: passwordData.old_password,
      new_password: passwordData.new_password
    });
    
    console.log('✅ Contraseña cambiada exitosamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error al cambiar contraseña:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
      
      if (error.response.status === 400) {
        const errorData = error.response.data;
        const validationErrors = {};
        
        if (errorData.old_password) {
          validationErrors.old_password = Array.isArray(errorData.old_password) ? 
            errorData.old_password[0] : errorData.old_password;
        }
        if (errorData.new_password) {
          validationErrors.new_password = Array.isArray(errorData.new_password) ? 
            errorData.new_password.join(', ') : errorData.new_password;
        }
        if (errorData.detail) {
          validationErrors.general = errorData.detail;
        }
        
        if (Object.keys(validationErrors).length > 0) {
          throw { validationErrors, message: 'Error al cambiar la contraseña' };
        }
      }
      
      if (error.response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      
      throw new Error(`Error del servidor: ${error.response.status}`);
    }
    
    if (error.message) {
      throw error; // Re-lanzar errores de validación local
    }
    
    throw new Error('Error de conexión al cambiar la contraseña.');
  }
}

/**
 * Obtiene la información básica del usuario desde el token
 */
export function getUserInfoFromToken() {
  try {
    const token = localStorage.getItem('access');
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const tokenData = JSON.parse(jsonPayload);
    
    return {
      userId: tokenData.user_id,
      username: tokenData.username || localStorage.getItem('username'),
      email: tokenData.email,
      exp: tokenData.exp,
      iat: tokenData.iat
    };
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return null;
  }
}

/**
 * Verifica si el token está expirado
 */
export function isTokenExpired() {
  const userInfo = getUserInfoFromToken();
  if (!userInfo) return true;
  
  const currentTime = Date.now() / 1000;
  return userInfo.exp < currentTime;
}

/**
 * Logout del usuario (limpia datos locales)
 */
export function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('username');
  console.log('🚪 Usuario desconectado');
}