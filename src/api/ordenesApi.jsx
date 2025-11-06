// API para gestión de órdenes de trabajo
import axios from 'axios';

// URL base de tu API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configurar axios con interceptores para autenticación
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Importante para cookies CSRF
});

// Función para obtener CSRF token
const getCSRFToken = async () => {
  try {
    // Intentar obtener desde el endpoint de Django admin o cualquier vista que devuelva CSRF
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/admin/`, {
      withCredentials: true
    });
    
    // Extraer token CSRF del HTML response
    const html = response.data;
    const csrfMatch = html.match(/name=['"]csrfmiddlewaretoken['"] value=['"]([^'"]+)['"]/);
    if (csrfMatch) {
      return csrfMatch[1];
    }
  } catch (error) {
    console.log('No se pudo obtener CSRF token del admin');
  }
  
  // Fallback: intentar obtener de cookies
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return value;
    }
  }
  
  return null;
};

// Interceptor para agregar token de autorización
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar headers adicionales para evitar problemas CSRF con JWT
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
    cliente_nombre: orden.cliente_nombre || 'Sin cliente', // Nombre del cliente para pagos
    clienteTelefono: orden.cliente_telefono || '',
    marcaModelo: orden.vehiculo_marca && orden.vehiculo_modelo ? 
      `${orden.vehiculo_marca} ${orden.vehiculo_modelo}` : 
      'Vehículo no disponible',
    vehiculo_placa: orden.vehiculo_placa || '',
    total: `Bs${orden.total || 0}`,
    monto_total: parseFloat(orden.total || 0), // Monto numérico para pagos
    estado: orden.estado,
    fechaCreacion: orden.fecha_creacion,
    fechaInicio: orden.fecha_inicio,
    fechaFinalizacion: orden.fecha_finalizacion,
    fechaEntrega: orden.fecha_entrega,
    kilometraje: orden.kilometraje,
    nivelCombustible: orden.nivel_combustible,
    nivel_combustible: orden.nivel_combustible,  // Agregar ambos formatos para compatibilidad
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
    estadoPago: orden.pago ? "Pagado" : "Pendiente", // Estado de pago basado en el booleano
    pago: orden.pago  // Mantener el valor booleano original del backend
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
    const token = localStorage.getItem('access');
    const userRole = localStorage.getItem('userRole');
    console.log('🔑 Token presente:', !!token);
    console.log('👤 Rol de usuario:', userRole);
    
    const response = await apiClient.get('/ordenes/');
    console.log('📋 Órdenes recibidas del backend:', response.data);
    
    // Transformar datos del backend al formato esperado por el frontend
    const ordenesTransformadas = response.data.map(transformOrdenFromAPI);
    console.log('✅ Órdenes transformadas:', ordenesTransformadas);
    
    return ordenesTransformadas;
  } catch (error) {
    console.error('❌ Error al obtener órdenes:', error);
    console.error('📄 Error response:', error.response?.data);
    console.error('🔢 Status code:', error.response?.status);
    
    if (error.response?.status === 500) {
      throw new Error('Error del servidor. Posiblemente el usuario cliente no está asociado correctamente en la base de datos.');
    }
    
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
    
    // Preparar el payload con el nuevo estado
    let payload = { estado: nuevoEstado };
    
    // Si el nuevo estado es "entregada", actualizar automáticamente la fecha_entrega
    if (nuevoEstado === 'entregada') {
      const fechaActual = new Date().toISOString();
      payload.fecha_entrega = fechaActual;
      console.log(`📅 Estableciendo fecha_entrega automáticamente: ${fechaActual}`);
    } else {
      // Si el estado NO es "entregada", eliminar la fecha_entrega (establecer como null)
      payload.fecha_entrega = null;
      console.log(`🗑️ Eliminando fecha_entrega porque el estado cambió a: ${nuevoEstado}`);
    }
    
    const response = await apiClient.patch(`/ordenes/${id}/`, payload);
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
      fallo_requerimiento: descripcion
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

// Función para actualizar la fecha de finalización de una orden
export const updateOrdenFechaFinalizacion = async (ordenId, fechaFinalizacion) => {
  try {
    const response = await apiClient.patch(`/ordenes/${ordenId}/`, {
      fecha_finalizacion: fechaFinalizacion
    });
    return response.data;
  } catch (error) {
    console.error('Error actualizando fecha de finalización de orden:', error);
    throw error;
  }
};

// Función para agregar un nuevo detalle a una orden
export const addDetalleOrden = async (ordenId, detalle) => {
  try {
    const response = await apiClient.post(`/ordenes/${ordenId}/detalles/`, detalle);
    return response.data;
  } catch (error) {
    console.error('Error agregando detalle de orden:', error);
    console.error('Detalles del error:', error.response?.data);
    throw error;
  }
};

// ========== FUNCIONES PARA NOTAS DE ORDEN ==========

// Función para obtener todas las notas de una orden
export const fetchNotasOrden = async (ordenId) => {
  try {
    console.log('Obteniendo notas para la orden:', ordenId);
    const response = await apiClient.get(`/ordenes/${ordenId}/notas/`);
    console.log('Notas obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo notas de orden:', error);
    throw error;
  }
};

// Función para crear una nueva nota
export const createNotaOrden = async (ordenId, contenido) => {
  try {
    console.log('Creando nueva nota:', { ordenId, contenido });
    const response = await apiClient.post(`/ordenes/${ordenId}/notas/`, {
      contenido: contenido
    });
    console.log('Nota creada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creando nota de orden:', error);
    console.error('Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para eliminar una nota
export const deleteNotaOrden = async (ordenId, notaId) => {
  try {
    console.log('Eliminando nota:', { ordenId, notaId });
    const response = await apiClient.delete(`/ordenes/${ordenId}/notas/${notaId}/`);
    console.log('Nota eliminada exitosamente');
    return response.data;
  } catch (error) {
    console.error('Error eliminando nota de orden:', error);
    console.error('Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para transformar notas del backend al formato del frontend
export const transformNotaFromAPI = (nota) => {
  return {
    id: nota.id,
    contenido: nota.contenido,
    fecha: new Date(nota.fecha_nota).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    fechaOriginal: nota.fecha_nota
  };
};

// ========== FUNCIONES PARA TAREAS DE ORDEN ==========

// Función para obtener todas las tareas de una orden
export const fetchTareasOrden = async (ordenId) => {
  try {
    console.log('Obteniendo tareas para la orden:', ordenId);
    const response = await apiClient.get(`/ordenes/${ordenId}/tareas/`);
    console.log('Tareas obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo tareas de orden:', error);
    throw error;
  }
};

// Función para crear una nueva tarea
export const createTareaOrden = async (ordenId, descripcion) => {
  try {
    console.log('Creando nueva tarea:', { ordenId, descripcion });
    
    // Intentar ambos formatos para compatibilidad
    const payload = {
      descripcion: descripcion.trim(),
      completada: false,  // Para el modelo
      estado: false       // Para el serializer (si existe)
    };
    
    console.log('Payload para crear tarea:', payload);
    
    const response = await apiClient.post(`/ordenes/${ordenId}/tareas/`, payload);
    console.log('Tarea creada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creando tarea de orden:', error);
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    
    // Lanzar error con más información
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        (error.response?.data && typeof error.response.data === 'object' 
                          ? JSON.stringify(error.response.data) 
                          : error.message);
    
    throw new Error(`Error al crear tarea: ${errorMessage}`);
  }
};

// Función para actualizar el estado de una tarea (completada/pendiente)
export const updateTareaOrden = async (ordenId, tareaId, completada) => {
  try {
    console.log('Actualizando estado de tarea:', { ordenId, tareaId, completada });
    
    // Enviar ambos campos para compatibilidad
    const payload = {
      completada: completada,
      estado: completada
    };
    
    const response = await apiClient.patch(`/ordenes/${ordenId}/tareas/${tareaId}/`, payload);
    console.log('Tarea actualizada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error actualizando tarea de orden:', error);
    console.error('Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para eliminar una tarea
export const deleteTareaOrden = async (ordenId, tareaId) => {
  try {
    console.log('Eliminando tarea:', { ordenId, tareaId });
    const response = await apiClient.delete(`/ordenes/${ordenId}/tareas/${tareaId}/`);
    console.log('Tarea eliminada exitosamente');
    return response.data;
  } catch (error) {
    console.error('Error eliminando tarea de orden:', error);
    console.error('Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para transformar tareas del backend al formato del frontend
export const transformTareaFromAPI = (tarea) => {
  // Manejar tanto el campo 'completada' como 'estado' para compatibilidad
  const completada = tarea.completada !== undefined ? tarea.completada : tarea.estado || false;
  
  return {
    id: tarea.id,
    descripcion: tarea.descripcion,
    completada: completada,
    estado: completada ? 'Completada' : 'Pendiente'
  };
};

// ==================== INVENTARIO VEHÍCULO API ====================

// Función para obtener el inventario de un vehículo por orden
export const fetchInventarioVehiculo = async (ordenId) => {
  try {
    console.log('🔍 Obteniendo inventario para orden:', ordenId);
    
    // Como el endpoint de inventario no tiene LIST, vamos a obtenerlo desde la orden completa
    const response = await apiClient.get(`/ordenes/${ordenId}/`);
    console.log('📦 Orden completa obtenida:', response.data);
    
    // El inventario viene en inventario_vehiculo array en la respuesta de la orden
    const inventarioArray = response.data.inventario_vehiculo;
    
    if (inventarioArray && inventarioArray.length > 0) {
      console.log('✅ Inventario encontrado:', inventarioArray[0]);
      return inventarioArray[0];
    }
    
    console.log('📝 No se encontró inventario existente');
    return null;
  } catch (error) {
    console.error('❌ Error obteniendo inventario de vehículo:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para crear un inventario de vehículo
export const createInventarioVehiculo = async (ordenId, inventarioData) => {
  try {
    console.log('Creando inventario para orden:', ordenId, inventarioData);
    const response = await apiClient.post(`/ordenes/${ordenId}/inventario/`, inventarioData);
    console.log('Inventario creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creando inventario de vehículo:', error);
    console.error('Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para actualizar un inventario de vehículo
export const updateInventarioVehiculo = async (ordenId, inventarioId, inventarioData) => {
  try {
    console.log('🔄 Actualizando inventario:', { ordenId, inventarioId, inventarioData });
    console.log('📤 URL de actualización:', `/ordenes/${ordenId}/inventario/${inventarioId}/`);
    const response = await apiClient.patch(`/ordenes/${ordenId}/inventario/${inventarioId}/`, inventarioData);
    console.log('✅ Inventario actualizado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando inventario de vehículo:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    console.error('🌐 Status del error:', error.response?.status);
    throw error;
  }
};

// Función para transformar inventario del backend al formato del frontend
export const transformInventarioFromAPI = (inventario) => {
  console.log('📥 Transformando inventario desde API:', inventario);
  if (!inventario) return null;
  
  const transformed = {
    id: inventario.id,
    ordenTrabajo: inventario.orden_trabajo,
    fechaCreacion: inventario.fecha_creacion,
    extintor: inventario.extintor || false,
    botiquin: inventario.botiquin || false,
    antena: inventario.antena || false,
    llantaRepuesto: inventario.llanta_repuesto || false,
    documentos: inventario.documentos || false,
    encendedor: inventario.encendedor || false,
    pisos: inventario.pisos || false,
    luces: inventario.luces || false,
    llaves: inventario.llaves || false,
    gata: inventario.gata || false,
    herramientas: inventario.herramientas || false,
    tapasRuedas: inventario.tapas_ruedas || false,
    triangulos: inventario.triangulos || false
  };
  console.log('🔄 Datos transformados desde API:', transformed);
  return transformed;
};

// =============== FUNCIONES DE INSPECCIONES ===============

// Función para obtener las inspecciones de una orden
export const fetchInspecciones = async (ordenId) => {
  try {
    console.log('🔍 Obteniendo inspecciones para orden:', ordenId);
    
    // Obtener inspecciones desde la orden completa
    const response = await apiClient.get(`/ordenes/${ordenId}/`);
    console.log('📦 Orden completa obtenida:', response.data);
    
    // Las inspecciones vienen en el array inspecciones de la respuesta
    const inspeccionesArray = response.data.inspecciones || [];
    console.log('✅ Inspecciones encontradas:', inspeccionesArray);
    
    return inspeccionesArray;
  } catch (error) {
    console.error('❌ Error obteniendo inspecciones:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para crear una nueva inspección
export const createInspeccion = async (ordenId, inspeccionData) => {
  try {
    // Normalizar y filtrar campos para evitar enviar claves que el serializer no espera
    const payload = transformInspeccionToAPI(inspeccionData, ordenId);
    const response = await apiClient.post(`/ordenes/${ordenId}/inspecciones/`, payload);
    return response.data;
  } catch (error) {
    console.error('❌ Error creando inspección:', error);
    console.error('📄 Detalles del error:', error.response?.data);

    // Construir mensaje amigable para el frontend
    if (error.response) {
      const data = error.response.data;
      if (error.response.status === 400) {
        const msg = typeof data === 'object' ? Object.entries(data).map(([k,v]) => `${k}: ${Array.isArray(v)? v.join(', '): v}`).join('\n') : String(data);
        throw new Error(`Error creando inspección:\n${msg}`);
      }
    }

    throw error;
  }
};

// Función para actualizar una inspección
export const updateInspeccion = async (ordenId, inspeccionId, inspeccionData) => {
  try {
    // Normalizar y filtrar campos antes de enviar
    const payload = transformInspeccionToAPI(inspeccionData, ordenId);
    console.log('🔄 Actualizando inspección:', { ordenId, inspeccionId });
    console.log('📤 Payload transformado:', payload);
    const response = await apiClient.patch(`/ordenes/${ordenId}/inspecciones/${inspeccionId}/`, payload);
    console.log('✅ Inspección actualizada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando inspección:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Helper: transforma el objeto de inspección del frontend al formato esperado por la API
const transformInspeccionToAPI = (data, ordenId) => {
  if (!data || typeof data !== 'object') return {};

  // Copiar datos para no mutar el original
  const copy = { ...data };

  // El backend parece no aceptar un campo llamado 'descripcion' en Inspeccion
  if ('descripcion' in copy) delete copy.descripcion;

  // Campos del modelo Inspeccion que deben mantener exactamente el mismo nombre
  const exactFieldNames = {
    'tipo_inspeccion': 'tipo_inspeccion',
    'tecnico': 'tecnico',
    'aceite_motor': 'aceite_motor',
    'Filtros_VH': 'Filtros_VH',           // Mantener exactamente como está en el modelo
    'nivel_refrigerante': 'nivel_refrigerante',
    'pastillas_freno': 'pastillas_freno',
    'Estado_neumaticos': 'Estado_neumaticos', // Mantener exactamente como está en el modelo
    'estado_bateria': 'estado_bateria',
    'estado_luces': 'estado_luces',
    'observaciones_generales': 'observaciones_generales' // Mantener el nombre original
  };

  const normalized = {};
  
  // CRUCIAL: Añadir orden_trabajo que es requerido por el serializer
  if (ordenId) {
    normalized.orden_trabajo = ordenId;
  }

  // Mapear solo los campos conocidos usando los nombres exactos del modelo
  for (const [frontendKey, backendKey] of Object.entries(exactFieldNames)) {
    if (frontendKey in copy) {
      normalized[backendKey] = copy[frontendKey];
    }
  }

  // Asegurar que tecnico sea number o null
  if (normalized.tecnico !== undefined && normalized.tecnico !== null && normalized.tecnico !== '') {
    const n = Number(normalized.tecnico);
    normalized.tecnico = Number.isNaN(n) ? null : n;
  } else {
    delete normalized.tecnico;
  }

  // NO eliminar valores vacíos para campos opcionales como observaciones_generales
  // Solo eliminar undefined para evitar problemas
  Object.keys(normalized).forEach((k) => {
    if (normalized[k] === undefined) delete normalized[k];
  });

  return normalized;
};

// Helper: transforma el objeto de prueba de ruta del frontend al formato esperado por la API
const transformPruebaRutaToAPI = (data, ordenId) => {
  if (!data || typeof data !== 'object') return {};

  // Copiar datos para no mutar el original
  const copy = { ...data };

  // Campos del modelo PruebaRuta que deben mantener exactamente el mismo nombre
  const exactFieldNames = {
    'tipo_prueba': 'tipo_prueba',
    'kilometraje_inicio': 'kilometraje_inicio',
    'kilometraje_final': 'kilometraje_final',
    'ruta': 'ruta',
    'frenos': 'frenos',
    'motor': 'motor',
    'suspension': 'suspension',
    'direccion': 'direccion',
    'observaciones': 'observaciones',
    'tecnico': 'tecnico'
  };

  const normalized = {};
  
  // CRUCIAL: Añadir orden_trabajo que es requerido por el serializer
  if (ordenId) {
    normalized.orden_trabajo = ordenId;
  }

  // Mapear solo los campos conocidos usando los nombres exactos del modelo
  for (const [frontendKey, backendKey] of Object.entries(exactFieldNames)) {
    if (frontendKey in copy) {
      normalized[backendKey] = copy[frontendKey];
    }
  }

  // Asegurar que tecnico sea number o null
  if (normalized.tecnico !== undefined && normalized.tecnico !== null && normalized.tecnico !== '') {
    const n = Number(normalized.tecnico);
    normalized.tecnico = Number.isNaN(n) ? null : n;
  } else {
    delete normalized.tecnico;
  }

  // Asegurar que los kilometrajes sean números
  ['kilometraje_inicio', 'kilometraje_final'].forEach(field => {
    if (normalized[field] !== undefined && normalized[field] !== null && normalized[field] !== '') {
      const n = Number(normalized[field]);
      normalized[field] = Number.isNaN(n) ? 0 : n;
    }
  });

  // NO eliminar valores vacíos para campos opcionales como observaciones
  // Solo eliminar undefined para evitar problemas
  Object.keys(normalized).forEach((k) => {
    if (normalized[k] === undefined) delete normalized[k];
  });

  return normalized;
};

// Función para eliminar una inspección
export const deleteInspeccion = async (ordenId, inspeccionId) => {
  try {
    console.log('🗑️ Eliminando inspección:', { ordenId, inspeccionId });
    const response = await apiClient.delete(`/ordenes/${ordenId}/inspecciones/${inspeccionId}/`);
    console.log('✅ Inspección eliminada exitosamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error eliminando inspección:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para obtener empleados/técnicos (para el dropdown)
export const fetchEmpleados = async () => {
  try {
    console.log('👥 Obteniendo lista de empleados');
    const response = await apiClient.get('/empleados/');
    console.log('✅ Empleados obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo empleados:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// ========== FUNCIONES PARA PRUEBAS DE RUTA ==========

// Función para obtener pruebas de ruta de una orden
export const fetchPruebasRuta = async (ordenId) => {
  try {
    console.log('🛣️ Obteniendo pruebas de ruta para orden:', ordenId);
    const response = await apiClient.get(`/ordenes/${ordenId}/pruebas/`);
    console.log('✅ Pruebas de ruta obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo pruebas de ruta:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para crear una nueva prueba de ruta
export const createPruebaRuta = async (ordenId, pruebaData) => {
  try {
    // Normalizar y filtrar campos para evitar enviar claves que el serializer no espera
    const payload = transformPruebaRutaToAPI(pruebaData, ordenId);
    const response = await apiClient.post(`/ordenes/${ordenId}/pruebas/`, payload);
    return response.data;
  } catch (error) {
    console.error('❌ Error creando prueba de ruta:', error);
    console.error('📄 Detalles del error:', error.response?.data);

    if (error.response) {
      const data = error.response.data;
      if (error.response.status === 400) {
        const msg = typeof data === 'object' ? Object.entries(data).map(([k,v]) => `${k}: ${Array.isArray(v)? v.join(', '): v}`).join('\n') : String(data);
        throw new Error(`Error creando prueba de ruta:\n${msg}`);
      }
    }

    throw error;
  }
};

// Función para actualizar una prueba de ruta existente
export const updatePruebaRuta = async (ordenId, pruebaId, pruebaData) => {
  try {
    // Normalizar y filtrar campos antes de enviar
    const payload = transformPruebaRutaToAPI(pruebaData, ordenId);
    console.log('🛣️ Actualizando prueba de ruta:', { ordenId, pruebaId });
    console.log('📤 Payload transformado:', payload);
    const response = await apiClient.put(`/ordenes/${ordenId}/pruebas/${pruebaId}/`, payload);
    console.log('✅ Prueba de ruta actualizada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando prueba de ruta:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para eliminar una prueba de ruta
export const deletePruebaRuta = async (ordenId, pruebaId) => {
  try {
    console.log('🗑️ Eliminando prueba de ruta:', { ordenId, pruebaId });
    const response = await apiClient.delete(`/ordenes/${ordenId}/pruebas/${pruebaId}/`);
    console.log('✅ Prueba de ruta eliminada exitosamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error eliminando prueba de ruta:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// ========== FUNCIONES PARA ASIGNACIONES DE TÉCNICOS ==========

// Función para obtener asignaciones de técnicos de una orden
export const fetchAsignaciones = async (ordenId) => {
  try {
    console.log('👥 Obteniendo asignaciones de técnicos para orden:', ordenId);
    const response = await apiClient.get(`/ordenes/${ordenId}/asignaciones/`);
    console.log('✅ Asignaciones obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo asignaciones:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para crear una nueva asignación de técnico
export const createAsignacion = async (ordenId, tecnicoId) => {
  try {
    console.log('👥 Creando nueva asignación:', { ordenId, tecnicoId });
    const response = await apiClient.post(`/ordenes/${ordenId}/asignaciones/`, { tecnico: tecnicoId });
    console.log('✅ Asignación creada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creando asignación:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para eliminar una asignación de técnico
export const deleteAsignacion = async (ordenId, asignacionId) => {
  try {
    console.log('🗑️ Eliminando asignación:', { ordenId, asignacionId });
    const response = await apiClient.delete(`/ordenes/${ordenId}/asignaciones/${asignacionId}/`);
    console.log('✅ Asignación eliminada exitosamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error eliminando asignación:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para transformar inventario del frontend al formato del backend
export const transformInventarioToAPI = (inventario) => {
  console.log('🔄 Transformando inventario para API:', inventario);
  const transformed = {
    extintor: inventario.extintor || false,
    botiquin: inventario.botiquin || false,
    antena: inventario.antena || false,
    llanta_repuesto: inventario.llantaRepuesto || false,
    documentos: inventario.documentos || false,
    encendedor: inventario.encendedor || false,
    pisos: inventario.pisos || false,
    luces: inventario.luces || false,
    llaves: inventario.llaves || false,
    gata: inventario.gata || false,
    herramientas: inventario.herramientas || false,
    tapas_ruedas: inventario.tapasRuedas || false,
    triangulos: inventario.triangulos || false
  };
  console.log('📤 Datos transformados para enviar:', transformed);
  return transformed;
};

// ========== FUNCIONES PARA IMÁGENES DE ORDEN ==========

// Función para obtener imágenes de una orden
export const fetchImagenes = async (ordenId) => {
  try {
    console.log('🖼️ Obteniendo imágenes para orden:', ordenId);
    const response = await apiClient.get(`/ordenes/${ordenId}/imagenes/`);
    console.log('✅ Imágenes obtenidas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo imágenes:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para subir nueva imagen
export const uploadImagen = async (ordenId, imagenData) => {
  try {
    // Validaciones previas
    if (!imagenData.imagen_file) {
      throw new Error('No se ha seleccionado ningún archivo de imagen');
    }

    // Validar tamaño del archivo (máximo 5MB)
    if (imagenData.imagen_file.size > 5 * 1024 * 1024) {
      throw new Error('El archivo es demasiado grande. Máximo 5MB permitido');
    }

    // Validar tipo de archivo
    if (!imagenData.imagen_file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen (PNG, JPG, GIF)');
    }
    
    // Crear FormData para manejar la subida de archivo
    const formData = new FormData();
    formData.append('imagen_file', imagenData.imagen_file);
    
    if (imagenData.descripcion) {
      formData.append('descripcion', imagenData.descripcion);
    }

    // Configuración específica para evitar CSRF
    const config = {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        // No especificar Content-Type para que Axios lo maneje automáticamente
      },
      withCredentials: false, // Desactivar cookies para esta petición específica
    };

    const response = await apiClient.post(`/ordenes/${ordenId}/imagenes/`, formData, config);
    
    return response.data;
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    
    // Mejorar el mensaje de error para el usuario
    if (error.response) {
      const errorData = error.response.data;
      console.error('Detalles del error del servidor:', errorData);
      
      // Crear mensaje de error más específico
      let errorMessage = 'Error al subir la imagen';
      
      if (error.response.status === 500) {
        errorMessage = 'Error interno del servidor. Posible problema con ImgBB o configuración del backend';
      } else if (error.response.status === 413) {
        errorMessage = 'El archivo es demasiado grande';
      } else if (error.response.status === 400) {
        errorMessage = errorData.detail || errorData.error || 'Datos de imagen inválidos';
      } else if (error.response.status === 401) {
        errorMessage = 'No tienes permisos para subir imágenes';
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw error;
    }
  }
};

// Función para actualizar imagen
export const updateImagen = async (ordenId, imagenId, imagenData) => {
  try {
    console.log('✏️ Actualizando imagen:', imagenId, 'para orden:', ordenId);
    
    // Crear FormData para manejar la subida de archivo
    const formData = new FormData();
    
    if (imagenData.imagen_file) {
      formData.append('imagen_file', imagenData.imagen_file);
    }
    
    if (imagenData.descripcion !== undefined) {
      formData.append('descripcion', imagenData.descripcion);
    }

    // NO especificar Content-Type para que Axios lo maneje automáticamente con el boundary correcto
    const response = await apiClient.patch(`/ordenes/${ordenId}/imagenes/${imagenId}/`, formData);
    
    console.log('✅ Imagen actualizada exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error actualizando imagen:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};

// Función para eliminar imagen
export const deleteImagen = async (ordenId, imagenId) => {
  try {
    console.log('🗑️ Eliminando imagen:', imagenId, 'de orden:', ordenId);
    await apiClient.delete(`/ordenes/${ordenId}/imagenes/${imagenId}/`);
    console.log('✅ Imagen eliminada exitosamente');
  } catch (error) {
    console.error('❌ Error eliminando imagen:', error);
    console.error('📄 Detalles del error:', error.response?.data);
    throw error;
  }
};
