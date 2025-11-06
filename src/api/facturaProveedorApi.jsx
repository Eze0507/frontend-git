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
   API: Facturas de Proveedor
   ========================= */

/**
 * Obtener todas las facturas de proveedor
 */
export async function getAllFacturasProveedor() {
  try {
    const response = await apiClient.get('/facturas-proveedor/');
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error('Error al obtener facturas de proveedor:', error);
    throw new Error('Error al obtener las facturas de proveedor.');
  }
}

/**
 * Obtener una factura de proveedor por ID
 */
export async function getFacturaProveedorById(id) {
  try {
    const response = await apiClient.get(`/facturas-proveedor/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener factura de proveedor ${id}:`, error);
    throw new Error('Error al obtener la factura de proveedor.');
  }
}

/**
 * Crear una nueva factura de proveedor
 */
export async function createFacturaProveedor(facturaData) {
  try {
    console.log('📤 Creando nueva factura de proveedor...');
    console.log('🔑 Token:', localStorage.getItem('access') ? 'Presente' : 'Ausente');
    console.log('📋 Datos:', facturaData);
    
    const response = await apiClient.post('/facturas-proveedor/', facturaData);
    console.log('✅ Factura creada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear factura de proveedor:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para crear facturas. Contacta al administrador.');
      }
      
      if (error.response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear la factura de proveedor.');
  }
}

/**
 * Actualizar una factura de proveedor existente
 */
export async function updateFacturaProveedor(id, facturaData) {
  try {
    console.log(`📤 Actualizando factura de proveedor ${id}...`);
    console.log('🔑 Token:', localStorage.getItem('access') ? 'Presente' : 'Ausente');
    console.log('📋 Datos:', facturaData);
    
    const response = await apiClient.put(`/facturas-proveedor/${id}/`, facturaData);
    console.log('✅ Factura actualizada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al actualizar factura de proveedor ${id}:`, error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para actualizar facturas. Contacta al administrador.');
      }
      
      if (error.response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      if (error.response.status === 404) {
        throw new Error('La factura no existe o fue eliminada.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar la factura de proveedor.');
  }
}

/**
 * Actualización parcial de una factura de proveedor
 */
export async function patchFacturaProveedor(id, facturaData) {
  try {
    console.log(`📤 Actualizando parcialmente factura de proveedor ${id}...`);
    
    const response = await apiClient.patch(`/facturas-proveedor/${id}/`, facturaData);
    console.log('✅ Factura actualizada parcialmente:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al actualizar parcialmente factura de proveedor ${id}:`, error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', error.response.data);
      
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para actualizar facturas.');
      }
      
      if (error.response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar la factura de proveedor.');
  }
}

/**
 * Eliminar una factura de proveedor
 */
export async function deleteFacturaProveedor(id) {
  try {
    console.log(`🗑️ Eliminando factura de proveedor ${id}...`);
    console.log('🔑 Token:', localStorage.getItem('access') ? 'Presente' : 'Ausente');
    
    await apiClient.delete(`/facturas-proveedor/${id}/`);
    console.log('✅ Factura eliminada exitosamente');
    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar factura de proveedor ${id}:`, error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para eliminar facturas. Contacta al administrador.');
      }
      
      if (error.response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }
      
      if (error.response.status === 404) {
        throw new Error('La factura no existe o ya fue eliminada.');
      }
      
      if (error.response.status === 400) {
        throw new Error(error.response.data.error || 'No se puede eliminar la factura porque tiene detalles asociados.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al eliminar la factura de proveedor.');
  }
}

/**
 * Obtener facturas filtradas por proveedor
 */
export async function getFacturasByProveedor(proveedorId) {
  try {
    const response = await apiClient.get(`/facturas-proveedor/por_proveedor/?proveedor_id=${proveedorId}`);
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error(`Error al obtener facturas del proveedor ${proveedorId}:`, error);
    throw new Error('Error al obtener las facturas del proveedor.');
  }
}

/**
 * Buscar facturas de proveedor
 */
export async function buscarFacturasProveedor(query) {
  try {
    const response = await apiClient.get(`/facturas-proveedor/buscar/?q=${query}`);
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error('Error al buscar facturas de proveedor:', error);
    throw new Error('Error al buscar las facturas de proveedor.');
  }
}

/**
 * Obtener detalles de una factura
 */
export async function getDetallesFactura(facturaId) {
  try {
    const response = await apiClient.get(`/facturas-proveedor/${facturaId}/detalles/`);
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error(`Error al obtener detalles de la factura ${facturaId}:`, error);
    throw new Error('Error al obtener los detalles de la factura.');
  }
}

/* =========================
   API: Detalles de Factura de Proveedor
   ========================= */

/**
 * Obtener todos los detalles de facturas
 */
export async function getAllDetallesFactura() {
  try {
    const response = await apiClient.get('/detalles-factura-proveedor/');
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error('Error al obtener detalles de facturas:', error);
    throw new Error('Error al obtener los detalles de facturas.');
  }
}

/**
 * Obtener un detalle de factura por ID
 */
export async function getDetalleFacturaById(id) {
  try {
    const response = await apiClient.get(`/detalles-factura-proveedor/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalle de factura ${id}:`, error);
    throw new Error('Error al obtener el detalle de factura.');
  }
}

/**
 * Crear un nuevo detalle de factura
 */
export async function createDetalleFactura(detalleData) {
  try {
    console.log('📤 Creando nuevo detalle de factura...');
    console.log('📋 Datos:', detalleData);
    
    const response = await apiClient.post('/detalles-factura-proveedor/', detalleData);
    console.log('✅ Detalle creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear detalle de factura:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', error.response.data);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear el detalle de factura.');
  }
}

/**
 * Crear múltiples detalles de factura
 */
export async function createDetallesMultiple(detallesArray) {
  try {
    console.log('📤 Creando múltiples detalles de factura...');
    console.log('📋 Datos:', detallesArray);
    
    const response = await apiClient.post('/detalles-factura-proveedor/crear_multiple/', detallesArray);
    console.log('✅ Detalles creados exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear detalles de factura:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', error.response.data);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al crear los detalles de factura.');
  }
}

/**
 * Actualizar un detalle de factura
 */
export async function updateDetalleFactura(id, detalleData) {
  try {
    console.log(`📤 Actualizando detalle de factura ${id}...`);
    
    const response = await apiClient.put(`/detalles-factura-proveedor/${id}/`, detalleData);
    console.log('✅ Detalle actualizado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al actualizar detalle de factura ${id}:`, error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', error.response.data);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el detalle de factura.');
  }
}

/**
 * Eliminar un detalle de factura
 */
export async function deleteDetalleFactura(id) {
  try {
    console.log(`🗑️ Eliminando detalle de factura ${id}...`);
    
    await apiClient.delete(`/detalles-factura-proveedor/${id}/`);
    console.log('✅ Detalle eliminado exitosamente');
    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar detalle de factura ${id}:`, error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', error.response.data);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al eliminar el detalle de factura.');
  }
}

/**
 * Obtener detalles por factura
 */
export async function getDetallesByFactura(facturaId) {
  try {
    const response = await apiClient.get(`/detalles-factura-proveedor/por_factura/?factura_id=${facturaId}`);
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error(`Error al obtener detalles de la factura ${facturaId}:`, error);
    throw new Error('Error al obtener los detalles de la factura.');
  }
}

/**
 * Obtener resumen de una factura
 */
export async function getResumenFactura(facturaId) {
  try {
    const response = await apiClient.get(`/detalles-factura-proveedor/resumen_factura/?factura_id=${facturaId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener resumen de la factura ${facturaId}:`, error);
    throw new Error('Error al obtener el resumen de la factura.');
  }
}

/**
 * Recalcular una factura basándose en sus detalles
 */
export async function recalcularFactura(facturaId) {
  try {
    console.log(`🔄 Recalculando factura ${facturaId}...`);
    
    const response = await apiClient.post(`/facturas-proveedor/${facturaId}/recalcular/`);
    console.log('✅ Factura recalculada exitosamente:', response.data);
    return response.data.factura;
  } catch (error) {
    console.error(`❌ Error al recalcular factura ${facturaId}:`, error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', error.response.data);
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al recalcular la factura.');
  }
}

export default {
  // Facturas
  getAllFacturasProveedor,
  getFacturaProveedorById,
  createFacturaProveedor,
  updateFacturaProveedor,
  patchFacturaProveedor,
  deleteFacturaProveedor,
  getFacturasByProveedor,
  buscarFacturasProveedor,
  getDetallesFactura,
  recalcularFactura,
  
  // Detalles de Factura
  getAllDetallesFactura,
  getDetalleFacturaById,
  createDetalleFactura,
  createDetallesMultiple,
  updateDetalleFactura,
  deleteDetalleFactura,
  getDetallesByFactura,
  getResumenFactura,
};
