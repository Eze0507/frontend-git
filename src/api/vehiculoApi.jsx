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
   API: Vehículos
   ========================= */
export async function fetchAllVehiculos() {
  try {
    const response = await apiClient.get('/vehiculos/');
    console.log('📋 Respuesta completa del servidor al cargar vehículos:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      dataType: Array.isArray(response.data) ? 'array' : 'object',
      dataLength: Array.isArray(response.data) ? response.data.length : 
                  (response.data?.results ? response.data.results.length : 'N/A'),
    });
    
    // Soporta array directo o {results:[]}
    let vehiculos = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    
    // Mostrar información detallada de cada vehículo
    console.log('🚗 Vehículos cargados:');
    vehiculos.forEach((vehiculo, index) => {
      console.log(`  ${index + 1}. ID: ${vehiculo.id}, Placa: ${vehiculo.numero_placa}, Cliente: ${vehiculo.cliente_nombre}, Marca: ${vehiculo.marca_nombre}`);
    });
    
    return vehiculos;
  } catch (error) {
    console.error('❌ Error al cargar vehículos:', error);
    throw new Error('Error al obtener los vehículos.');
  }
}

export async function fetchVehiculoById(id) {
  try {
    const response = await apiClient.get(`/vehiculos/${id}/`);
    console.log('📋 Detalles del vehículo:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al cargar vehículo:', error);
    throw new Error('Error al obtener el vehículo.');
  }
}

export async function createVehiculo(payload) {
  try {
    console.log('📤 Enviando datos de vehículo:', payload);
    console.log('🔑 Token actual:', localStorage.getItem('access') ? 'Presente' : 'Ausente');
    
    // Validar campos obligatorios antes del envío
    if (!payload.numero_placa) {
      throw new Error('El número de placa es obligatorio');
    }
    
    const response = await apiClient.post('/vehiculos/', payload);
    console.log('✅ Vehículo creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear vehículo:', error);
    
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
        if (errorData.numero_placa && errorData.numero_placa[0]) {
          throw new Error(`Placa: ${errorData.numero_placa[0]}`);
        }
        if (errorData.año && errorData.año[0]) {
          throw new Error(`Año: ${errorData.año[0]}`);
        }
        if (errorData.cliente && errorData.cliente[0]) {
          throw new Error(`Cliente: ${errorData.cliente[0]}`);
        }
        if (errorData.marca && errorData.marca[0]) {
          throw new Error(`Marca: ${errorData.marca[0]}`);
        }
        if (errorData.modelo && errorData.modelo[0]) {
          throw new Error(`Modelo: ${errorData.modelo[0]}`);
        }
      }
      
      // Manejo específico de errores 403
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para crear vehículos. Contacta al administrador.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error; // Mantener el error original si no es de respuesta HTTP
  }
}

export async function updateVehiculo(id, payload) {
  try {
    console.log('📤 Actualizando vehículo:', { id, payload });
    
    // Validar campos obligatorios antes del envío
    if (!payload.numero_placa) {
      throw new Error('El número de placa es obligatorio');
    }
    
    const response = await apiClient.put(`/vehiculos/${id}/`, payload);
    console.log('✅ Vehículo actualizado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar vehículo:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
      
      // Manejo específico de errores de validación del backend
      if (error.response.status === 400) {
        const errorData = error.response.data;
        if (errorData.numero_placa && errorData.numero_placa[0]) {
          throw new Error(`Placa: ${errorData.numero_placa[0]}`);
        }
        if (errorData.año && errorData.año[0]) {
          throw new Error(`Año: ${errorData.año[0]}`);
        }
        if (errorData.cliente && errorData.cliente[0]) {
          throw new Error(`Cliente: ${errorData.cliente[0]}`);
        }
        if (errorData.marca && errorData.marca[0]) {
          throw new Error(`Marca: ${errorData.marca[0]}`);
        }
        if (errorData.modelo && errorData.modelo[0]) {
          throw new Error(`Modelo: ${errorData.modelo[0]}`);
        }
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el vehículo.');
  }
}

export async function deleteVehiculo(id) {
  try {
    console.log('🗑️ Eliminando vehículo con ID:', id);
    const response = await apiClient.delete(`/vehiculos/${id}/`);
    console.log('✅ Respuesta del servidor al eliminar:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    console.log('✅ Vehículo eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar vehículo:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Manejo específico de errores 403
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para eliminar vehículos. Contacta al administrador.');
      }
      
      // Manejo específico de errores 404
      if (error.response.status === 404) {
        throw new Error('El vehículo no existe o ya fue eliminado.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al eliminar el vehículo.');
  }
}

/* =========================
   API: Marcas y Modelos
   ========================= */
export async function fetchAllMarcas() {
  try {
    const response = await apiClient.get('/vehiculos/marcas/');
    console.log('📋 Marcas cargadas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al cargar marcas:', error);
    throw new Error('Error al obtener las marcas.');
  }
}

export async function fetchAllModelos() {
  try {
    const response = await apiClient.get('/vehiculos/modelos/');
    console.log('📋 Modelos cargados:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al cargar modelos:', error);
    throw new Error('Error al obtener los modelos.');
  }
}

export async function fetchModelosByMarca(marcaId) {
  try {
    const response = await apiClient.get(`/vehiculos/modelos/?marca_id=${marcaId}`);
    console.log(`📋 Modelos cargados para marca ${marcaId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al cargar modelos por marca:', error);
    throw new Error('Error al obtener los modelos de la marca seleccionada.');
  }
}

/* =========================
   API: Clientes (para relación con vehículos)
   ========================= */
export async function fetchAllClientes() {
  try {
    const response = await apiClient.get('/clientes/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los clientes.');
  }
}

/* =========================
   Mapper: Form -> API
   ========================= */
export function toApiVehiculo(form) {
  const clienteId = typeof form.cliente === "object" ? form.cliente?.id : form.cliente;
  const marcaId = typeof form.marca === "object" ? form.marca?.id : form.marca;
  const modeloId = typeof form.modelo === "object" ? form.modelo?.id : form.modelo;
  
  const result = {
    numero_placa: form.numero_placa?.trim() || "",
    vin: form.vin?.trim() || "",
    numero_motor: form.numero_motor?.trim() || "",
    tipo: form.tipo?.trim() || "",
    version: form.version?.trim() || "",
    color: form.color?.trim() || "",
    año: form.año ? Number(form.año) : null,
    cilindrada: form.cilindrada ? Number(form.cilindrada) : null,
    tipo_combustible: form.tipo_combustible?.trim() || "",
  };
  
  // Añadir relaciones si se proporcionan
  if (clienteId) {
    result.cliente = Number(clienteId);
  }
  if (marcaId) {
    result.marca = Number(marcaId);
  }
  if (modeloId) {
    result.modelo = Number(modeloId);
  }
  
  console.log('🔄 Mapped form to API:', { form, result });
  return result;
}

