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
   API: Clientes
   ========================= */
export async function fetchAllClientes(includeInactive = false) {
  try {
    const endpoint = includeInactive ? '/clientes/' : '/clientes/?activo=true';
    const response = await apiClient.get(endpoint);
    console.log('📋 Respuesta completa del servidor al cargar clientes:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      dataType: Array.isArray(response.data) ? 'array' : 'object',
      dataLength: Array.isArray(response.data) ? response.data.length : 
                  (response.data?.results ? response.data.results.length : 'N/A'),
      endpoint: endpoint
    });
    
    // Soporta array directo o {results:[]}
    let clientes = Array.isArray(response.data) ? response.data : (response.data?.results || []);
    
    // Si el backend no soporta filtrado por query params, filtrar en frontend
    if (!includeInactive && !endpoint.includes('activo=true')) {
      clientes = clientes.filter(cliente => cliente.activo !== false);
    }
    
    // Mostrar información detallada de cada cliente, especialmente los eliminados/inactivos
    console.log('👥 Clientes cargados:');
    clientes.forEach((cliente, index) => {
      console.log(`  ${index + 1}. ID: ${cliente.id}, NIT: ${cliente.nit}, Activo: ${cliente.activo}, Nombre: ${cliente.nombre}`);
    });
    
    return clientes;
  } catch (error) {
    console.error('❌ Error al cargar clientes:', error);
    throw new Error('Error al obtener los clientes.');
  }
}

export async function checkNitAvailability(nit, excludeId = null) {
  try {
    console.log('🔍 Verificando disponibilidad del NIT:', nit, 'excluyendo ID:', excludeId);
    // Buscar clientes con este NIT (incluyendo inactivos)
    const allClientes = await fetchAllClientes(true);
    const clienteConNit = allClientes.find(c => 
      c.nit === nit && (excludeId ? c.id !== excludeId : true)
    );
    
    if (clienteConNit) {
      console.log('❌ NIT ya existe:', clienteConNit);
      return {
        available: false,
        existingClient: clienteConNit,
        isActive: clienteConNit.activo
      };
    }
    
    console.log('✅ NIT disponible');
    return { available: true, existingClient: null, isActive: null };
  } catch (error) {
    console.error('❌ Error al verificar disponibilidad del NIT:', error);
    throw new Error('Error al verificar la disponibilidad del NIT.');
  }
}

export async function createCliente(payload) {
  try {
    console.log('📤 Enviando datos de cliente:', payload);
    console.log('🔑 Token actual:', localStorage.getItem('access') ? 'Presente' : 'Ausente');
    
    // Validar campos obligatorios antes del envío
    if (!payload.nombre || !payload.nit) {
      throw new Error('Nombre y NIT son campos obligatorios');
    }
    
    // Verificar si el NIT ya existe (incluyendo clientes inactivos)
    try {
      const nitCheck = await checkNitAvailability(payload.nit);
      if (!nitCheck.available) {
        const existingClient = nitCheck.existingClient;
        if (!nitCheck.isActive) {
          // El cliente existe pero está inactivo - ofrecer reactivarlo
          const reactivate = window.confirm(
            `Ya existe un cliente con NIT ${payload.nit} pero está inactivo.\n` +
            `¿Deseas reactivar este cliente en lugar de crear uno nuevo?\n\n` +
            `Cliente existente: ${existingClient.nombre} ${existingClient.apellido}`
          );
          
          if (reactivate) {
            // Reactivar el cliente existente actualizando sus datos
            const updatePayload = { ...payload, activo: true };
            const reactivatedClient = await updateCliente(existingClient.id, updatePayload);
            console.log('✅ Cliente reactivado exitosamente:', reactivatedClient);
            return reactivatedClient;
          } else {
            throw new Error('No se puede crear un cliente con un NIT que ya existe en el sistema (incluso si está inactivo).');
          }
        } else {
          throw new Error(`Ya existe un cliente activo con NIT ${payload.nit}: ${existingClient.nombre} ${existingClient.apellido}`);
        }
      }
    } catch (error) {
      if (error.message.includes('No se puede crear') || error.message.includes('Ya existe un cliente')) {
        throw error; // Re-lanzar errores de validación de NIT
      }
      console.warn('⚠️ No se pudo verificar la disponibilidad del NIT, continuando con la creación...', error);
    }
    
    const response = await apiClient.post('/clientes/', payload);
    console.log('✅ Cliente creado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear cliente:', error);
    
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
        if (errorData.nit && errorData.nit[0]) {
          throw new Error(`NIT: ${errorData.nit[0]}`);
        }
        if (errorData.telefono && errorData.telefono[0]) {
          throw new Error(`Teléfono: ${errorData.telefono[0]}`);
        }
        if (errorData.nombre && errorData.nombre[0]) {
          throw new Error(`Nombre: ${errorData.nombre[0]}`);
        }
        if (errorData.apellido && errorData.apellido[0]) {
          throw new Error(`Apellido: ${errorData.apellido[0]}`);
        }
      }
      
      // Manejo específico de errores 403
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para crear clientes. Contacta al administrador.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw error; // Mantener el error original si no es de respuesta HTTP
  }
}

export async function updateCliente(id, payload) {
  try {
    console.log('📤 Actualizando cliente:', { id, payload });
    
    // Validar campos obligatorios antes del envío
    if (!payload.nombre) {
      throw new Error('Nombre es un campo obligatorio');
    }
    
    const response = await apiClient.put(`/clientes/${id}/`, payload);
    console.log('✅ Cliente actualizado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar cliente:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        data: error.response.data
      });
      
      // Manejo específico de errores de validación del backend
      if (error.response.status === 400) {
        const errorData = error.response.data;
        if (errorData.nit && errorData.nit[0]) {
          throw new Error(`NIT: ${errorData.nit[0]}`);
        }
        if (errorData.telefono && errorData.telefono[0]) {
          throw new Error(`Teléfono: ${errorData.telefono[0]}`);
        }
        if (errorData.nombre && errorData.nombre[0]) {
          throw new Error(`Nombre: ${errorData.nombre[0]}`);
        }
        if (errorData.apellido && errorData.apellido[0]) {
          throw new Error(`Apellido: ${errorData.apellido[0]}`);
        }
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al actualizar el cliente.');
  }
}

export async function deleteCliente(id) {
  try {
    console.log('🗑️ Eliminando cliente con ID:', id);
    const response = await apiClient.delete(`/clientes/${id}/`);
    console.log('✅ Respuesta del servidor al eliminar:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
    console.log('✅ Cliente eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar cliente:', error);
    
    if (error.response) {
      console.error('📊 Detalles del error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Manejo específico de errores 403
      if (error.response.status === 403) {
        throw new Error('No tienes permisos para eliminar clientes. Contacta al administrador.');
      }
      
      // Manejo específico de errores 404
      if (error.response.status === 404) {
        throw new Error('El cliente no existe o ya fue eliminado.');
      }
      
      throw new Error(JSON.stringify(error.response.data));
    }
    throw new Error('Error de conexión al eliminar el cliente.');
  }
}

/* =========================
   API: Usuarios (para relación con clientes)
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
export function toApiCliente(form) {
  const usuarioId = typeof form.usuario === "object" ? form.usuario?.id : form.usuario;
  
  const result = {
    nombre: form.nombre?.trim() || "",
    apellido: form.apellido?.trim() || "",
    nit: form.nit?.trim() || "",
    telefono: form.telefono?.trim() || "",
    direccion: form.direccion?.trim() || "",
    tipo_cliente: form.tipo_cliente || "NATURAL", // Valores: NATURAL, EMPRESA
    activo: form.activo ?? true,
  };
  
  // Añadir usuario si se proporciona (relación OneToOne opcional)
  if (usuarioId) {
    result.usuario = Number(usuarioId);
  }
  
  console.log('🔄 Mapped form to API:', { form, result });
  return result;
}