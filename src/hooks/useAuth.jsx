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

      // Intentar obtener rol desde el token (si existiera)
      if (userData && userData.role) {
        localStorage.setItem("userRole", userData.role);
      } else if (userData && userData.groups && userData.groups.length > 0) {
        localStorage.setItem("userRole", userData.groups[0]);
      } else {
        // Si el token no trae rol, consultar al backend existente /auth/me/ (sin cambiar backend)
        try {
          const me = await axios.get(`${apiUrl}auth/me/`, {
            headers: { Authorization: `Bearer ${access}` },
          });
          const serverRole = (me?.data?.role || '').toString().toLowerCase();
          // Mapear nombres de grupos a claves de front
          const mapped = serverRole === 'administrador' ? 'admin' : serverRole;
          if (mapped) {
            localStorage.setItem("userRole", mapped);
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
    try {
      const refresh = localStorage.getItem("refresh");
      const access = localStorage.getItem("access");
      const apiUrl = import.meta.env.VITE_API_URL;
      
      if (refresh && access) {
        // Llamar al endpoint de logout del backend para invalidar el refresh token
        const response = await axios.post(`${apiUrl}logout/`, {
          refresh
        }, {
          headers: {
            "Authorization": `Bearer ${access}`,
          }
        });

        if (response.status === 200) {
          console.log("✅ Logout exitoso:", response.data.message);
        }
      }
    } catch (error) {
      // Si falla la llamada al backend, continuar con el logout local
      console.warn("❌ Error al comunicarse con el backend durante logout:", error);
    } finally {
      // Siempre limpiar el localStorage sin importar si el backend respondió
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
      
      console.log("🧹 Tokens eliminados del localStorage");
      setLoading(false);
      
      // Forzar recarga completa a la página de login
      window.location.href = "/login";
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
