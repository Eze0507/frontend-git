import axios from "axios";

async function login(username, password) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const res = await axios.post(`${apiUrl}/auth/token/`, {
      username,
      password,
    });

    const { access, refresh } = res.data;

    // Guardar tokens
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    // Configurar axios para futuras peticiones
    axios.defaults.headers.common["Authorization"] = `Bearer ${access}`;

    console.log("Login correcto ✅");
    return true;
  } catch (err) {
    console.error("Error login ❌:", err.response?.data);
    return false;
  }
}
