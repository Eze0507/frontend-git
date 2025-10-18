import axios from "axios";

// Crear instancia de Axios con configuración base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
});

// Interceptor para añadir el token de autenticación a cada solicitud
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
   API: Items
   ========================= */

/**
 * Obtener todos los items
 */
export async function getAllItems() {
  try {
    const response = await apiClient.get('/items/');
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error('Error al obtener items:', error);
    throw new Error('Error al obtener los items.');
  }
}

/**
 * Obtener un item por ID
 */
export async function getItemById(id) {
  try {
    const response = await apiClient.get(`/items/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener item ${id}:`, error);
    throw new Error('Error al obtener el item.');
  }
}

/**
 * Crear un nuevo item
 */
export async function createItem(formData) {
  try {
    console.log('📤 Creando nuevo item...');
    console.log('🔑 Token:', localStorage.getItem('access') ? 'Presente' : 'Ausente');
    
    // Verificar contenido del FormData
    if (formData instanceof FormData) {
      console.log('📋 Contenido del FormData:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
      }
    }
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await apiClient.post('/items/', formData, config);
    console.log('✅ Item creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear item:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para crear items. Contacta al administrador.');
      }
      
      if (error.response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el item.');
  }
}

/**
 * Actualizar un item existente
 */
export async function updateItem(id, formData) {
  try {
    console.log(`📤 Actualizando item ${id}...`);
    console.log('🔑 Token:', localStorage.getItem('access') ? 'Presente' : 'Ausente');
    
    // Verificar contenido del FormData
    if (formData instanceof FormData) {
      console.log('📋 Contenido del FormData:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
      }
    }
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    // Usar PUT para actualización completa
    const response = await apiClient.put(`/items/${id}/`, formData, config);
    console.log('✅ Item actualizado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al actualizar item ${id}:`, error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para actualizar items. Contacta al administrador.');
      }
      
      if (error.response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      if (error.response.status === 404) {
        throw new Error('El item no existe o fue eliminado.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el item.');
  }
}

/**
 * Actualización parcial de un item
 */
export async function patchItem(id, formData) {
  try {
    console.log(`📤 Actualizando parcialmente item ${id}...`);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await apiClient.patch(`/items/${id}/`, formData, config);
    console.log('✅ Item actualizado parcialmente:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al actualizar parcialmente item ${id}:`, error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', error.response.data);
      
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para actualizar items.');
      }
      
      if (error.response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el item.');
  }
}

/**
 * Eliminar un item
 */
export async function deleteItem(id) {
  try {
    console.log(`🗑️ Eliminando item ${id}...`);
    console.log('🔑 Token:', localStorage.getItem('access') ? 'Presente' : 'Ausente');
    
    await apiClient.delete(`/items/${id}/`);
    console.log('✅ Item eliminado exitosamente');
    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar item ${id}:`, error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para eliminar items. Contacta al administrador.');
      }
      
      if (error.response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      if (error.response.status === 404) {
        throw new Error('El item no existe o ya fue eliminado.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al eliminar el item.');
  }
}

/**
 * Obtener items filtrados por tipo
 */
export async function getItemsByTipo(tipo) {
  try {
    const allItems = await getAllItems();
    return allItems.filter(item => item.tipo === tipo);
  } catch (error) {
    console.error(`Error al obtener items de tipo ${tipo}:`, error);
    throw error;
  }
}

/**
 * Verificar permisos del usuario
 */
export function checkUserPermissions() {
  const token = localStorage.getItem('access');
  if (!token) {
    return { hasToken: false, userRole: null, tokenData: null };
  }
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const tokenData = JSON.parse(jsonPayload);
    
    return {
      hasToken: true,
      userRole: tokenData.role || tokenData.groups?.[0] || 'unknown',
      tokenData: tokenData,
      username: tokenData.username || localStorage.getItem('username')
    };
  } catch (error) {
    console.error('Error al decodificar token:', error);
    return { hasToken: true, userRole: 'unknown', tokenData: null };
  }
}

export default {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  patchItem,
  deleteItem,
  getItemsByTipo,
  checkUserPermissions,
};
