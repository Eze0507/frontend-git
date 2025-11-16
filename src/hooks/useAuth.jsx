// src/hooks/useAuth.js
import { useState } from "react";
import axios from "axios";

/**
 * Decodifica un token JWT para obtener su payload.
 * No valida la firma, solo decodifica la información.
 * @param {string} token El token JWT.
 * @returns {object|null} El payload del token o null si hay un error.
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error al decodificar el token:", e);
    return null;
  }
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (username, password) => {
    setLoading(true);
    setError("");

    try {
      // 🔹 Usa la variable de entorno (sirve en local y producción)
      const apiUrl = import.meta.env.VITE_API_URL;

      const response = await axios.post(`${apiUrl}auth/token/`, {
        username,
        password,
      });

      const { access, refresh } = response.data;

      // 1. Guardar tokens en localStorage
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      // 2. Guardar el nombre de usuario directamente del input
      localStorage.setItem("username", username);
      console.log(`✅ Nombre de usuario '${username}' guardado en localStorage.`);

      // 3. Decodificar el token para obtener el rol si está disponible
      const userData = parseJwt(access);
      console.log("Datos decodificados del token:", userData);

      // Función auxiliar para mapear roles
      const mapRole = (role) => {
        const normalized = (role || '').toString().toLowerCase();
        return normalized === 'administrador' ? 'admin' : normalized;
      };

      // Intentar obtener rol desde el token (si existiera)
      if (userData && userData.role) {
        const mappedRole = mapRole(userData.role);
        localStorage.setItem("userRole", mappedRole);
        console.log(`✅ Rol '${userData.role}' mapeado a '${mappedRole}'`);
      } else if (userData && userData.groups && userData.groups.length > 0) {
        const mappedRole = mapRole(userData.groups[0]);
        localStorage.setItem("userRole", mappedRole);
        console.log(`✅ Rol '${userData.groups[0]}' mapeado a '${mappedRole}'`);
      } else {
        // Si el token no trae rol, consultar al backend existente /auth/me/ (sin cambiar backend)
        try {
          const me = await axios.get(`${apiUrl}auth/me/`, {
            headers: { Authorization: `Bearer ${access}` },
          });
          const mappedRole = mapRole(me?.data?.role);
          if (mappedRole) {
            localStorage.setItem("userRole", mappedRole);
            console.log(`✅ Rol '${me?.data?.role}' mapeado a '${mappedRole}'`);
          }
        } catch (e) {
          console.warn('No se pudo obtener rol desde /auth/me/', e?.message || e);
        }
      }

      return true; // login exitoso
    } catch (err) {
      console.error("Error en login:", err.response?.data || err.message);
      setError("Usuario o contraseña incorrectos");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async ({ navigate } = {}) => {
    setLoading(true);
    
    // PRIMERO: Guardar los tokens ANTES de borrar localStorage
    const refresh = localStorage.getItem("refresh");
    const access = localStorage.getItem("access");
    const apiUrl = import.meta.env.VITE_API_URL;
    
    try {
      if (refresh && access) {
        console.log("🔐 Enviando logout al backend...");
        console.log("🔑 Refresh token:", refresh.substring(0, 20) + "...");
        console.log("🔑 Access token:", access.substring(0, 20) + "...");
        
        // Llamar al endpoint de logout del backend para invalidar el refresh token (blacklist)
        // Probar con 'refresh' en lugar de 'refresh_token'
        const response = await axios.post(`${apiUrl}logout/`, {
          refresh: refresh  // Intentar con 'refresh' directamente
        }, {
          headers: {
            "Authorization": `Bearer ${access}`,
            "Content-Type": "application/json",
          }
        });

        if (response.status === 200 || response.status === 205) {
          console.log("✅ Logout exitoso - Token agregado a blacklist:", response.data);
        }
      } else {
        console.warn("⚠️ No se encontraron tokens para enviar al backend");
        console.log("refresh:", refresh);
        console.log("access:", access);
      }
    } catch (error) {
      // Si falla la llamada al backend, mostrar el error pero continuar con el logout local
      console.error("❌ Error al comunicarse con el backend durante logout:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      // DESPUÉS: Limpiar el localStorage solo después de enviar la petición
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
      
      console.log("🧹 Tokens eliminados del localStorage");
      setLoading(false);
      
      // Redirigir a la página principal (HomePage pública)
      window.location.href = "/";
    }
  };

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return !!localStorage.getItem("access");
  };

  // Función para obtener información del usuario
  const getUserInfo = () => {
    return {
      username: localStorage.getItem("username") || "Usuario",
      userRole: localStorage.getItem("userRole") || "Invitado",
    };
  };

  return { 
    login, 
    logout, 
    isAuthenticated, 
    getUserInfo, 
    loading, 
    error 
  };
}
