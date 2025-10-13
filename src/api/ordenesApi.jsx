// API para gestión de órdenes de trabajo
import axios from 'axios';

// URL base de tu API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configurar axios con interceptores para autenticación
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token de autorización
apiClient.interceptors.request.use(
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

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, redirigir al login
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Función para transformar datos del backend a formato del frontend
const transformOrdenFromAPI = (orden) => {
  return {
    id: orden.id,
    numero: `#${orden.id}`,
    fecha: new Date(orden.fecha_creacion).toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    }),
    cliente: orden.cliente_nombre || 'Cliente no disponible',
    clienteTelefono: orden.cliente_telefono || '',
    marcaModelo: orden.vehiculo_marca && orden.vehiculo_modelo ? 
      `${orden.vehiculo_marca} ${orden.vehiculo_modelo}` : 
      'Vehículo no disponible',
    vehiculo_placa: orden.vehiculo_placa || '',
    total: `Bs${orden.total || 0}`,
    estado: orden.estado,
    fechaCreacion: orden.fecha_creacion,
    fechaInicio: orden.fecha_inicio,
    fechaFinalizacion: orden.fecha_finalizacion,
    fechaEntrega: orden.fecha_entrega,
    kilometraje: orden.kilometraje,
    nivelCombustible: orden.nivel_combustible,
    observaciones: orden.observaciones,
    falloRequerimiento: orden.fallo_requerimiento,
    subtotal: orden.subtotal || 0,
    impuesto: orden.impuesto || 0,
    descuento: orden.descuento || 0,
    vehiculo: orden.vehiculo,
    clienteId: orden.cliente,
    detalles: orden.detalles || [],
    // Campos adicionales para compatibilidad con el frontend existente
    tipoOrden: "Reparación", // Puedes mapear esto si tienes el campo en el modelo
    estadoOrden: orden.estado,
    asignadoA: "", // Agregar si tienes este campo
    prioridad: "Media", // Agregar si tienes este campo
    estadoPago: "Pendiente", // Agregar si tienes este campo
    pago: ""
  };
};

// Función para transformar datos del frontend al formato de la API
const transformOrdenToAPI = (ordenData) => {
  return {
    fallo_requerimiento: ordenData.falloRequerimiento || ordenData.descripcion,
    estado: ordenData.estado,
    fecha_inicio: ordenData.fechaInicio,
    fecha_finalizacion: ordenData.fechaFinalizacion,
    fecha_entrega: ordenData.fechaEntrega,
    kilometraje: parseInt(ordenData.kilometraje),
    nivel_combustible: parseInt(ordenData.nivelCombustible),
    observaciones: ordenData.observaciones,
    vehiculo: ordenData.vehiculo,
    cliente: ordenData.clienteId || ordenData.cliente,
    detalles: ordenData.detalles || []
  };
};

// Funciones de la API
export const fetchAllOrdenes = async () => {
  try {
    console.log('🔄 Obteniendo todas las órdenes...');
    const response = await apiClient.get('/ordenes/');
    console.log('📋 Órdenes recibidas del backend:', response.data);
    
    // Transformar datos del backend al formato esperado por el frontend
    const ordenesTransformadas = response.data.map(transformOrdenFromAPI);
    console.log('✅ Órdenes transformadas:', ordenesTransformadas);
    
    return ordenesTransformadas;
  } catch (error) {
    console.error('❌ Error al obtener órdenes:', error);
    throw new Error(`Error al cargar órdenes: ${error.response?.data?.detail || error.message}`);
  }
};

export const fetchOrdenById = async (id) => {
  try {
    console.log(`🔄 Obteniendo orden ${id}...`);
    const response = await apiClient.get(`/ordenes/${id}/`);
    console.log('📋 Orden recibida:', response.data);
    
    return transformOrdenFromAPI(response.data);
  } catch (error) {
    console.error(`❌ Error al obtener orden ${id}:`, error);
    throw new Error(`Error al cargar orden: ${error.response?.data?.detail || error.message}`);
  }
};

export const createOrden = async (ordenData) => {
  try {
    console.log('🔄 Creando nueva orden...', ordenData);
    const payload = transformOrdenToAPI(ordenData);
    console.log('📤 Payload enviado:', payload);
    
    const response = await apiClient.post('/ordenes/', payload);
    console.log('✅ Orden creada - respuesta raw:', response.data);
    
    const transformedOrden = transformOrdenFromAPI(response.data);
    console.log('✅ Orden transformada:', transformedOrden);
    
    return transformedOrden;
  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Manejo específico de errores de validación del backend
      if (error.response.status === 400) {
        const errorData = error.response.data;
        console.error('❌ Errores de validación:', errorData);
        
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData).map(([field, errors]) => {
            const errorList = Array.isArray(errors) ? errors : [errors];
            return `${field}: ${errorList.join(', ')}`;
          }).join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }
      }
    }
    
    throw new Error(`Error al crear orden: ${error.response?.data?.detail || error.message}`);
  }
};

export const updateOrden = async (id, ordenData) => {
  try {
    console.log(`🔄 Actualizando orden ${id}...`, ordenData);
    const payload = transformOrdenToAPI(ordenData);
    console.log('📤 Payload enviado:', payload);
    
    const response = await apiClient.put(`/ordenes/${id}/`, payload);
    console.log('✅ Orden actualizada:', response.data);
    
    return transformOrdenFromAPI(response.data);
  } catch (error) {
    console.error(`❌ Error al actualizar orden ${id}:`, error);
    throw new Error(`Error al actualizar orden: ${error.response?.data?.detail || error.message}`);
  }
};

export const updateOrdenEstado = async (id, nuevoEstado) => {
  try {
    console.log(`🔄 Actualizando estado de orden ${id} a ${nuevoEstado}...`);
    
    // Obtener la orden actual primero
    const ordenActual = await fetchOrdenById(id);
    
    // Actualizar solo el estado
    const payload = {
      ...transformOrdenToAPI(ordenActual),
      estado: nuevoEstado
    };
    
    const response = await apiClient.patch(`/ordenes/${id}/`, { estado: nuevoEstado });
    console.log('✅ Estado de orden actualizado:', response.data);
    
    return transformOrdenFromAPI(response.data);
  } catch (error) {
    console.error(`❌ Error al actualizar estado de orden ${id}:`, error);
    throw new Error(`Error al actualizar estado: ${error.response?.data?.detail || error.message}`);
  }
};

export const deleteOrden = async (id) => {
  try {
    console.log(`🔄 Eliminando orden ${id}...`);
    await apiClient.delete(`/ordenes/${id}/`);
    console.log('✅ Orden eliminada exitosamente');
    return true;
  } catch (error) {
    console.error(`❌ Error al eliminar orden ${id}:`, error);
    throw new Error(`Error al eliminar orden: ${error.response?.data?.detail || error.message}`);
  }
};

// Funciones auxiliares para mantener compatibilidad
export const toApiOrden = (formData) => {
  return transformOrdenToAPI(formData);
};

export const checkUserPermissions = () => {
  // Por ahora retornar permisos completos, luego puedes implementar lógica basada en roles
  return {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true
  };
};

// Función para obtener vehículo por orden (si necesitas esta funcionalidad)
export const fetchVehiculoByOrden = async (ordenId) => {
  try {
    const orden = await fetchOrdenById(ordenId);
    return {
      id: orden.vehiculo,
      placa: orden.vehiculo_placa,
      marca: orden.marcaModelo.split(' ')[0],
      modelo: orden.marcaModelo.split(' ').slice(1).join(' ')
    };
  } catch (error) {
    console.error(`❌ Error al obtener vehículo de orden ${ordenId}:`, error);
    throw error;
  }
};

// Función para obtener items disponibles del catálogo
export const fetchItemsCatalogo = async () => {
  try {
    const response = await apiClient.get('/items/');
    return response.data;
  } catch (error) {
    console.error('Error obteniendo items del catálogo:', error);
    throw error;
  }
};

// Función para eliminar un detalle de una orden
export const deleteDetalleOrden = async (ordenId, detalleId) => {
  try {
    const response = await apiClient.delete(`/ordenes/${ordenId}/detalles/${detalleId}/`);
    return response.data;
  } catch (error) {
    console.error('Error eliminando detalle de orden:', error);
    throw error;
  }
};

// Función para actualizar la descripción/falla de una orden
export const updateOrdenDescripcion = async (ordenId, descripcion) => {
  try {
    const response = await apiClient.patch(`/ordenes/${ordenId}/`, {
      descripcion: descripcion
    });
    return response.data;
  } catch (error) {
    console.error('Error actualizando descripción de orden:', error);
    throw error;
  }
};

// Función para actualizar el kilometraje de una orden
export const updateOrdenKilometraje = async (ordenId, kilometraje) => {
  try {
    const response = await apiClient.patch(`/ordenes/${ordenId}/`, {
      kilometraje: kilometraje
    });
    return response.data;
  } catch (error) {
    console.error('Error actualizando kilometraje de orden:', error);
    throw error;
  }
};

// Función para actualizar el nivel de combustible de una orden
export const updateOrdenNivelCombustible = async (ordenId, nivelCombustible) => {
  try {
    const response = await apiClient.patch(`/ordenes/${ordenId}/`, {
      nivel_combustible: nivelCombustible
    });
    return response.data;
  } catch (error) {
    console.error('Error actualizando nivel de combustible de orden:', error);
    throw error;
  }
};

// Función para actualizar las observaciones de una orden
export const updateOrdenObservaciones = async (ordenId, observaciones) => {
  try {
    const response = await apiClient.patch(`/ordenes/${ordenId}/`, {
      observaciones: observaciones
    });
    return response.data;
  } catch (error) {
    console.error('Error actualizando observaciones de orden:', error);
    throw error;
  }
};

// Función para agregar un nuevo detalle a una orden
export const addDetalleOrden = async (ordenId, detalle) => {
  try {
    console.log('Enviando nuevo detalle al backend:', { ordenId, detalle });
    const response = await apiClient.post(`/ordenes/${ordenId}/detalles/`, detalle);
    console.log('Detalle creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error agregando detalle de orden:', error);
    console.error('Detalles del error:', error.response?.data);
    throw error;
  }
};
