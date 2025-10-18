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
  const [password2, setPassword2] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register({ username, email, password, password2 });
    if (success) {
      navigate("/login");
    }
  };

  return (
    <RegisterForm
      username={username}
      email={email}
      password={password}
      password2={password2}
      setUsername={setUsername}
      setEmail={setEmail}
      setPassword={setPassword}
      setPassword2={setPassword2}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
};

export default RegisterPage;
