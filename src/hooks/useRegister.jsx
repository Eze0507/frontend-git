// src/hooks/useRegister.jsx
import { useState } from "react";
import axios from "axios";

export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async ({ username, email, password, nombre, apellido, nit, codigo_invitacion }) => {
    setLoading(true);
    setError("");

    try {
      // 🔹 Usa la variable de entorno (sirve en local y producción)
      const apiUrl = import.meta.env.VITE_API_URL;

      // Validación básica en el frontend
      if (!username || !password || !nombre || !nit || !codigo_invitacion) {
        setError("Los campos usuario, contraseña, nombre, NIT y código de invitación son obligatorios");
        return false;
      }

      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return false;
      }

      // Enviar datos al backend
      const res = await axios.post(
        `${apiUrl}cliente-registro/`,
        {
          username: username.trim(),
          email: email?.trim() || '',
          password,
          nombre: nombre.trim(),
          apellido: apellido?.trim() || '',
          nit: nit.trim(),
          codigo_invitacion: codigo_invitacion.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Registro exitoso:", res.data);
      return true;
    } catch (err) {
      console.error("❌ Error en registro:", err.response?.data);

      // Manejo de errores más específico
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          setError(err.response.data);
        } else if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else if (err.response.data.error) {
          setError(err.response.data.error);
        } else if (err.response.data.username) {
          setError(`Usuario: ${err.response.data.username[0]}`);
        } else if (err.response.data.email) {
          setError(`Email: ${err.response.data.email[0]}`);
        } else if (err.response.data.password) {
          setError(`Contraseña: ${err.response.data.password[0]}`);
        } else if (err.response.data.codigo_invitacion) {
          setError(`Código de invitación: ${err.response.data.codigo_invitacion[0]}`);
        } else if (err.response.data.nit) {
          setError(`NIT: ${err.response.data.nit[0]}`);
        } else if (err.response.data.nombre) {
          setError(`Nombre: ${err.response.data.nombre[0]}`);
        } else {
          setError(JSON.stringify(err.response.data));
        }
      } else {
        setError("Error de conexión con el servidor");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
}