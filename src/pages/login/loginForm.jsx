// src/components/LoginForm.jsx
import React from "react";
import { Link } from "react-router-dom";

const LoginForm = ({ username, password, setUsername, setPassword, onSubmit, loading, error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-50">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">Welcome Back!</h1>
        
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your password"
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Enlace para registrarse */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Link 
              to="/register" 
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
