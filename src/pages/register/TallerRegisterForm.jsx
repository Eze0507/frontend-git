import React from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';

const TallerRegisterForm = ({
  username,
  email,
  password,
  nombreTaller,
  setUsername,
  setEmail,
  setPassword,
  setNombreTaller,
  onSubmit,
  loading,
  error,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-blue-50 to-gray-100 py-8">
      <div className="bg-white shadow-lg rounded-lg px-8 py-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FaStore className="text-3xl text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Registrar Taller</h1>
          <p className="text-gray-600 mt-2">Crea tu cuenta de taller mecánico</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Nombre del Taller */}
          <div>
            <label htmlFor="nombreTaller" className="block text-sm font-medium text-gray-700 mb-2">
              <FaStore className="inline mr-2 text-blue-500" />
              Nombre del Taller
            </label>
            <input
              type="text"
              id="nombreTaller"
              value={nombreTaller}
              onChange={(e) => setNombreTaller(e.target.value)}
              className="shadow-sm rounded-md w-full px-4 py-2.5 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Taller Mecánico El Rayo"
              required
            />
          </div>

          {/* Usuario (Propietario) */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2 text-blue-500" />
              Usuario (Propietario)
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow-sm rounded-md w-full px-4 py-2.5 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre de usuario del propietario"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2 text-blue-500" />
              Email (Opcional)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow-sm rounded-md w-full px-4 py-2.5 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              <FaLock className="inline mr-2 text-blue-500" />
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm rounded-md w-full px-4 py-2.5 border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Botón de Registro */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent 
            rounded-md shadow-sm text-sm font-medium text-white 
            ${loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            } transition-colors duration-200`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </>
            ) : (
              'Registrar Taller'
            )}
          </button>
        </form>

        {/* Links adicionales */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Info adicional */}
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <p className="text-xs text-gray-700">
            <strong>Nota:</strong> Al registrar tu taller, se creará automáticamente una cuenta de administrador 
            para el propietario con todos los permisos necesarios.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TallerRegisterForm;
