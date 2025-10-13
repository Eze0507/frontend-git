import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 Importar el hook
import LoginForm from "./loginForm";
import { useAuth } from "../../hooks/useAuth";

const LoginPage = () => {
const { login, loading, error } = useAuth();
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const navigate = useNavigate(); // 👈 Instanciar el hook

const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
    console.log("✅ Login exitoso");
      navigate("/admin/dashboard"); // 👈 Redirigir al dashboard
    }
};

return (
    <LoginForm
    username={username}
    password={password}
    setUsername={setUsername}
    setPassword={setPassword}
    onSubmit={handleSubmit}
    loading={loading}
    error={error}
    />
);
};

export default LoginPage;
