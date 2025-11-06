import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}ia/chatbot/`;

/**
 * Envía un mensaje al chatbot de Gemini
 * @param {string} message - Mensaje del usuario
 * @returns {Promise<{response: string}>} Respuesta del chatbot
 */
export const sendMessageToChatbot = async (message) => {
  try {
    const token = localStorage.getItem("access");
    
    console.log("🤖 Enviando mensaje al chatbot:", message);
    console.log("🔑 Token:", token ? "Presente" : "No disponible");
    console.log("🌐 URL:", API_URL);
    
    const response = await axios.post(
      API_URL,
      { message },
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true,
      }
    );

    console.log("✅ Respuesta del chatbot:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error completo:", error);
    console.error("❌ Response:", error.response?.data);
    console.error("❌ Status:", error.response?.status);
    
    if (error.response?.status === 403) {
      throw new Error("Acceso denegado. Verifica la configuración del backend.");
    } else if (error.response?.status === 503) {
      throw new Error("El servicio de chatbot no está disponible en este momento.");
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error || "Mensaje inválido. Por favor intenta de nuevo.");
    } else if (error.response?.status === 500) {
      throw new Error(error.response?.data?.error || "Error del servidor. Por favor contacta al administrador.");
    } else if (error.response?.status === 401) {
      throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
    } else {
      throw new Error("Error al comunicarse con el chatbot. Por favor intenta de nuevo.");
    }
  }
};
