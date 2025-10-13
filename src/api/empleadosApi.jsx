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

// Si tu backend espera cargo_id (DRF típico con FK)
const USE_CARGO_ID = true;

/* =========================
   API: Empleados
   ========================= */
export async function fetchAllEmpleados() {
  try {
    const response = await apiClient.get('/empleados/');
    // Soporta array directo o {results:[]}
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    throw new Error('Error al obtener los empleados.');
  }
}

export async function createEmpleado(payload) {
  try {
    console.log('📤 Enviando datos de empleado:', payload);
    console.log('🔑 Token actual:', localStorage.getItem('access') ? 'Presente' : 'Ausente');
    
    const response = await apiClient.post('/empleados/', payload);
    console.log('✅ Empleado creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear empleado:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Manejo específico de errores 403
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para crear empleados. Contacta al administrador.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al registrar el empleado.');
  }
}

export async function updateEmpleado(id, payload) {
  try {
    const response = await apiClient.put(`/empleados/${id}/`, payload);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el empleado.');
  }
}

export async function deleteEmpleado(id) {
  try {
    console.log('🗑️ Eliminando empleado con ID:', id);
    const response = await apiClient.delete(`/empleados/${id}/`);
    console.log('✅ Empleado eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar empleado:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Manejo específico de errores 403
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para eliminar empleados. Contacta al administrador.');
      }
      
      // Manejo específico de errores 404
      if (error.response.status === 404) {
        throw new Error('El empleado no existe o ya fue eliminado.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al eliminar el empleado.');
  }
}

/* =========================
   API: Cargos
   ========================= */
export async function fetchAllCargos() {
  try {
    const response = await apiClient.get('/cargos/', {
      params: { page_size: 1000 },
    });

    // Soporta varias formas: [] | {results:[]} | {data:[]}
    const raw = Array.isArray(response.data) ? response.data : (response.data?.results || response.data?.data || []);

    // Normaliza a {id, nombre}
    return raw
      .map((c) => ({
        id: c.id ?? c.pk ?? c.value ?? c.codigo ?? c.ID ?? c.Id ?? null,
        nombre: c.nombre ?? c.descripcion ?? c.label ?? c.name ?? c.Nombre ?? "—",
        _raw: c, // por si luego necesitas más campos
      }))
      .filter((c) => c.id != null);
  } catch (error) {
    throw new Error('Error al obtener los cargos.');
  }
}

/* =========================
   API: Usuarios (para relación con empleados)
   ========================= */
export async function fetchAllUsers() {
  try {
    const response = await apiClient.get('/users/');
    return response.data;
  } catch (error) {
    throw new Error('Error al obtener los usuarios.');
  }
}

/* =========================
   API: Áreas (para relación con empleados)
   ========================= */
export async function fetchAllAreas() {
  try {
    const response = await apiClient.get('/areas/');
    // Soporta array directo o {results:[]}
    return Array.isArray(response.data) ? response.data : (response.data?.results || []);
  } catch (error) {
    throw new Error('Error al obtener las áreas.');
  }
}

/* =========================
   Utilidades de permisos
   ========================= */
export function checkUserPermissions() {
  const token = localStorage.getItem('access');
  if (!token) {
    return { hasToken: false, userRole: null, tokenData: null };
  }
  
  try {
    // Decodificar el token JWT para obtener información del usuario
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

/* =========================
   Mapper: Form -> API
   ========================= */
export function toApiEmpleado(form) {
  const cargoId = typeof form.cargo === "object" ? form.cargo?.id : form.cargo;
  const usuarioId = typeof form.usuario === "object" ? form.usuario?.id : form.usuario;
  const areaId = typeof form.area === "object" ? form.area?.id : form.area;
  
  const base = {
    nombre: form.nombre?.trim() || "",
    apellido: form.apellido?.trim() || "",
    ci: form.ci?.trim() || "",
    direccion: form.direccion?.trim() || "",
    telefono: form.telefono?.trim() || "",
    sexo: form.sexo || "M",     // M/F/O
    estado: form.estado ?? true,
    sueldo: Number(form.sueldo || 0),
  };
  
  const result = USE_CARGO_ID
    ? { ...base, cargo_id: Number(cargoId || 0) }
    : { ...base, cargo: Number(cargoId || 0) };
  
  // Añadir area_id si se proporciona (requerido)
  if (areaId) {
    result.area_id = Number(areaId);
  }
  
  // Añadir usuario_id si se proporciona (opcional según el serializer)
  if (usuarioId) {
    result.usuario_id = Number(usuarioId);
  }
  
  return result;
}
