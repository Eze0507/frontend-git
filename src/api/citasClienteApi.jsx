import axios from "axios";

// Creamos una instancia de Axios que se usará para todas las llamadas a la API.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
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
   API: Citas Cliente
   ========================= */

/**
 * Obtener todas las citas del cliente autenticado con filtros opcionales
 */
export async function fetchMisCitas(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.tipo_cita) params.append('tipo_cita', filters.tipo_cita);
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.vehiculo_id) params.append('vehiculo_id', filters.vehiculo_id);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = `/citas-cliente/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(endpoint);
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error('Error al obtener mis citas:', error);
    throw new Error('Error al obtener las citas.');
  }
}


/**
 * Crear una nueva cita (agendada por el cliente)
 */
export async function createCitaCliente(citaData) {
  try {
    const response = await apiClient.post('/citas-cliente/', citaData);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      const errorData = error.response.data;
      
      // Construir mensaje de error con todos los campos que fallaron
      const errores = [];
      
      if (errorData.fecha_hora_inicio) {
        const msg = Array.isArray(errorData.fecha_hora_inicio) 
          ? errorData.fecha_hora_inicio[0] 
          : errorData.fecha_hora_inicio;
        errores.push(`Fecha inicio: ${msg}`);
      }
      if (errorData.fecha_hora_fin) {
        const msg = Array.isArray(errorData.fecha_hora_fin) 
          ? errorData.fecha_hora_fin[0] 
          : errorData.fecha_hora_fin;
        errores.push(`Fecha fin: ${msg}`);
      }
      if (errorData.vehiculo) {
        const msg = Array.isArray(errorData.vehiculo) 
          ? errorData.vehiculo[0] 
          : errorData.vehiculo;
        errores.push(`Vehículo: ${msg}`);
      }
      if (errorData.empleado) {
        const msg = Array.isArray(errorData.empleado) 
          ? errorData.empleado[0] 
          : errorData.empleado;
        errores.push(`Empleado: ${msg}`);
      }
      if (errorData.non_field_errors) {
        const msg = Array.isArray(errorData.non_field_errors) 
          ? errorData.non_field_errors[0] 
          : errorData.non_field_errors;
        errores.push(msg);
      }
      
      // Si hay otros errores, agregarlos
      Object.keys(errorData).forEach(key => {
        if (!['fecha_hora_inicio', 'fecha_hora_fin', 'vehiculo', 'empleado', 'non_field_errors'].includes(key)) {
          const msg = Array.isArray(errorData[key]) 
            ? errorData[key][0] 
            : errorData[key];
          errores.push(`${key}: ${msg}`);
        }
      });
      
      const errorMessage = errores.length > 0 
        ? errores.join('. ') 
        : JSON.stringify(errorData);
      
      throw new Error(errorMessage);
    }
    throw new Error('Error al crear la cita.');
  }
}


/**
 * Confirmar cita (propuesta por empleado)
 */
export async function confirmarCitaCliente(id) {
  try {
    const response = await apiClient.post(`/citas-cliente/${id}/confirmar/`);
    return response.data;
  } catch (error) {
    console.error(`Error al confirmar cita ${id}:`, error);
    throw new Error(error.response?.data?.detail || 'Error al confirmar la cita.');
  }
}

/**
 * Cancelar cita (cliente)
 */
export async function cancelarCitaClienteAction(id) {
  try {
    const response = await apiClient.post(`/citas-cliente/${id}/cancelar/`);
    return response.data;
  } catch (error) {
    console.error(`Error al cancelar cita ${id}:`, error);
    throw new Error(error.response?.data?.detail || 'Error al cancelar la cita.');
  }
}

/**
 * Reprogramar cita (cambiar horario y/o estado)
 */
export async function reprogramarCitaCliente(id, data) {
  try {
    const response = await apiClient.post(`/citas-cliente/${id}/reprogramar/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al reprogramar cita ${id}:`, error);
    const msg = error.response?.data?.detail || error.response?.data?.fecha_hora_fin || error.response?.data?.fecha_hora_inicio || 'Error al reprogramar la cita.';
    throw new Error(Array.isArray(msg) ? msg[0] : msg);
  }
}


/**
 * Obtener calendario de un empleado (horarios ocupados)
 * El backend devuelve TODAS las citas activas, el frontend filtra por día
 */
export async function fetchCalendarioEmpleado(empleadoId, dia) {
  try {
    let endpoint = `/citas-cliente/empleado/${empleadoId}/calendario/`;
    if (dia) {
      endpoint += `?dia=${encodeURIComponent(dia)}`;
    }
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener calendario del empleado ${empleadoId}:`, error);
    throw new Error('Error al obtener el calendario del empleado.');
  }
}

/**
 * Obtener vehículos del cliente autenticado
 */
export async function fetchVehiculosCliente() {
  try {
    // Obtener el ID del cliente desde el endpoint específico en citas-cliente
    const clienteIdResponse = await apiClient.get('/citas-cliente/mi-cliente-id/');
    const clienteId = clienteIdResponse.data?.cliente_id;
    
    if (!clienteId) {
      return [];
    }
    
    // Intentar obtener vehículos filtrados por cliente usando el filtro del backend
    try {
      const vehiculosResponse = await apiClient.get(`/vehiculos/?cliente_id=${clienteId}`);
      const vehiculos = Array.isArray(vehiculosResponse.data) 
        ? vehiculosResponse.data 
        : (vehiculosResponse.data?.results || []);
      
      return vehiculos;
    } catch (filterError) {
      // Fallback: obtener todos los vehículos y filtrar en el frontend
      const allVehiculosResponse = await apiClient.get('/vehiculos/');
      const allVehiculos = Array.isArray(allVehiculosResponse.data) 
        ? allVehiculosResponse.data 
        : (allVehiculosResponse.data?.results || []);
      
      // Filtrar por cliente_id en el frontend
      const vehiculosFiltrados = allVehiculos.filter(v => {
        const vClienteId = v.cliente || v.cliente_id || (v.cliente && typeof v.cliente === 'object' ? v.cliente.id : null);
        return vClienteId === clienteId || Number(vClienteId) === Number(clienteId);
      });
      
      return vehiculosFiltrados;
    }
  } catch (error) {
    return [];
  }
}

/**
 * Convertir datos del formulario al formato de la API
 */
export function toApiCitaCliente(formData) {
  const apiData = {
    vehiculo: formData.vehiculo ? Number(formData.vehiculo) : null,
    empleado: Number(formData.empleado), // Requerido
    fecha_hora_inicio: formData.fecha_hora_inicio,
    fecha_hora_fin: formData.fecha_hora_fin,
    tipo_cita: formData.tipo_cita || 'reparacion',
    // Mapear el campo de la UI "Nota" al campo del modelo "descripcion"
    descripcion: formData.nota || '',
  };
  
  // El cliente se asigna automáticamente en el backend
  
  return apiData;
}

