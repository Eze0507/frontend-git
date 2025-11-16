// src/pages/register/RegisterForm.jsx
import React from "react";
import { Link } from "react-router-dom";

const RegisterForm = ({
  username,
  email,
  password,
  nombre,
  apellido,
  nit,
  codigoInvitacion,
  setUsername,
  setEmail,
  setPassword,
  setNombre,
  setApellido,
  setNit,
  setCodigoInvitacion,
  onSubmit,
  loading,
  error,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-50 py-8">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">Registrar Cliente</h1>
        <p className="text-sm text-gray-600 text-center mb-6">Complete el formulario para crear su cuenta de cliente</p>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="codigoInvitacion" className="block text-sm font-medium text-gray-700 mb-2">
              Código de Invitación *
            </label>
            <input
              type="text"
              id="codigoInvitacion"
              value={codigoInvitacion}
              onChange={(e) => setCodigoInvitacion(e.target.value)}
              className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Código proporcionado por el taller"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ingresa tu nombre"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-2">
              Apellido
            </label>
            <input
              type="text"
              id="apellido"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ingresa tu apellido"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="nit" className="block text-sm font-medium text-gray-700 mb-2">
              NIT / CI *
            </label>
            <input
              type="text"
              id="nit"
              value={nit}
              onChange={(e) => setNit(e.target.value)}
              className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Número de identificación"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Usuario *
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nombre de usuario para iniciar sesión"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="correo@ejemplo.com (opcional)"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
            shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        {/* Enlace para iniciar sesión */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Link 
              to="/login" 
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;