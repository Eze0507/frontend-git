// src/pages/register/RegisterPage.jsx
import React, { useState } from "react";
import RegisterForm from "./RegisterForm";
import { useRegister } from "../../hooks/useRegister";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { register, loading, error } = useRegister();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [nit, setNit] = useState("");
  const [codigoInvitacion, setCodigoInvitacion] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register({ 
      username, 
      email, 
      password, 
      nombre, 
      apellido, 
      nit, 
      codigo_invitacion: codigoInvitacion 
    });
    if (success) {
      navigate("/login");
    }
  };

  return (
    <RegisterForm
      username={username}
      email={email}
      password={password}
      nombre={nombre}
      apellido={apellido}
      nit={nit}
      codigoInvitacion={codigoInvitacion}
      setUsername={setUsername}
      setEmail={setEmail}
      setPassword={setPassword}
      setNombre={setNombre}
      setApellido={setApellido}
      setNit={setNit}
      setCodigoInvitacion={setCodigoInvitacion}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
};

export default RegisterPage;
