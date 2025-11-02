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
   API: Citas
   ========================= */

/**
 * Obtener todas las citas con filtros opcionales
 */
export async function fetchAllCitas(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.tipo_cita) params.append('tipo_cita', filters.tipo_cita);
    if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
    if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
    if (filters.cliente_id) params.append('cliente_id', filters.cliente_id);
    if (filters.vehiculo_id) params.append('vehiculo_id', filters.vehiculo_id);
    if (filters.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = `/citas/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get(endpoint);
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    throw new Error('Error al obtener las citas.');
  }
}

/**
 * Obtener una cita por ID
 */
export async function fetchCitaById(id) {
  try {
    const response = await apiClient.get(`/citas/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener cita ${id}:`, error);
    throw new Error('Error al obtener la cita.');
  }
}

/**
 * Crear una nueva cita
 */
export async function createCita(citaData) {
  try {
    console.log('📤 Enviando datos de cita al backend:', JSON.stringify(citaData, null, 2));
    console.log('🔍 Campo empleado en citaData:', citaData.empleado);
    console.log('🔍 Tipo de empleado:', typeof citaData.empleado);
    const response = await apiClient.post('/citas/', citaData);
    console.log('✅ Respuesta del backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al crear cita:', error);
    if (error.response?.data) {
      const errorData = error.response.data;
      let errorMessage = 'Error al crear la cita.';
      
      // Manejar errores específicos - priorizar mensajes de conflicto de horario
      if (errorData.fecha_hora_inicio) {
        errorMessage = Array.isArray(errorData.fecha_hora_inicio) 
          ? errorData.fecha_hora_inicio[0] 
          : errorData.fecha_hora_inicio;
      } else if (errorData.fecha_hora_fin) {
        errorMessage = Array.isArray(errorData.fecha_hora_fin) 
          ? errorData.fecha_hora_fin[0] 
          : errorData.fecha_hora_fin;
      } else if (errorData.vehiculo) {
        errorMessage = Array.isArray(errorData.vehiculo) 
          ? errorData.vehiculo[0] 
          : errorData.vehiculo;
      } else if (errorData.non_field_errors) {
        errorMessage = Array.isArray(errorData.non_field_errors) 
          ? errorData.non_field_errors[0] 
          : errorData.non_field_errors;
      }
      
      throw new Error(errorMessage);
    }
    throw new Error('Error al crear la cita.');
  }
}

/**
 * Actualizar una cita existente
 */
export async function updateCita(id, citaData) {
  try {
    const response = await apiClient.put(`/citas/${id}/`, citaData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar cita ${id}:`, error);
    if (error.response?.data) {
      const errorData = error.response.data;
      let errorMessage = 'Error al actualizar la cita.';
      
      if (errorData.fecha_hora_fin) {
        errorMessage = errorData.fecha_hora_fin[0] || errorMessage;
      } else if (errorData.vehiculo) {
        errorMessage = errorData.vehiculo[0] || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    throw new Error('Error al actualizar la cita.');
  }
}

/**
 * Eliminar una cita
 */
export async function deleteCita(id) {
  try {
    await apiClient.delete(`/citas/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar cita ${id}:`, error);
    throw new Error('Error al eliminar la cita.');
  }
}

/**
 * Convertir datos del formulario al formato de la API
 */
export function toApiCita(formData) {
  console.log('🔄 FormData recibido en toApiCita:', formData);
  console.log('🔍 Campo empleado en formData:', formData.empleado);
  
  const apiData = {
    cliente: Number(formData.cliente),
    vehiculo: formData.vehiculo ? Number(formData.vehiculo) : null,
    fecha_hora_inicio: formData.fecha_hora_inicio,
    fecha_hora_fin: formData.fecha_hora_fin,
    tipo_cita: formData.tipo_cita || 'reparacion',
    estado: formData.estado || 'pendiente',
    descripcion: formData.descripcion || '',
    nota: formData.nota || '',
  };
  
  // Solo incluir empleado si se especificó explícitamente con un valor válido
  // Si no se incluye, el backend lo asignará automáticamente basado en el usuario
  const empleadoValue = formData.empleado;
  const tieneEmpleadoValido = empleadoValue && 
                               empleadoValue !== "" && 
                               empleadoValue !== null && 
                               empleadoValue !== undefined &&
                               empleadoValue !== "null" &&
                               empleadoValue !== "undefined";
  
  console.log('🔍 ¿Tiene empleado válido?:', tieneEmpleadoValido, 'Valor:', empleadoValue);
  
  if (tieneEmpleadoValido) {
    apiData.empleado = Number(empleadoValue);
    console.log('✅ Empleado incluido en request:', apiData.empleado);
  } else {
    console.log('⚠️ Empleado NO incluido en request - se asignará automáticamente');
    // No incluir el campo empleado en absoluto
  }
  
  console.log('📋 apiData final:', JSON.stringify(apiData, null, 2));
  return apiData;
}


