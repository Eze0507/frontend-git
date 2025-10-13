import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCar, FaWrench, FaOilCan, FaCogs, FaChartLine, FaBolt, FaTools, FaTachometerAlt, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import UserProfile from '../../components/UserProfile';

const HomePage = () => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [username, setUsername] = useState('Usuario');

  // Obtener el nombre del usuario del localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("userRole");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="relative mr-3">
                <FaCar className="text-2xl text-blue-500" />
                <FaWrench className="absolute -bottom-1 -right-1 text-sm text-yellow-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">AutoFix</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Panel Administrativo
              </Link>
              
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm flex items-center space-x-2 hover:bg-gray-700 transition-colors duration-200"
                >
                  <span>Hola, {username}</span>
                  <FaChevronDown className={`text-xs transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowProfile(true);
                          setShowUserDropdown(false);
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <FaUser className="mr-3 text-gray-400" />
                        Ver Perfil
                      </button>
                      <hr className="border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <FaSignOutAlt className="mr-3" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-gray-800 to-gray-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2832&q=80')"
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white">
            <h2 className="text-5xl font-bold mb-4">
              Bienvenido a AutoFix
            </h2>
            <p className="text-xl mb-8 max-w-2xl">
              Sistema integral de gestión para talleres automotrices. 
              Administra clientes, servicios, inventario y finanzas en un solo lugar.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Nuestros Servicios
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de servicios automotrices con la mejor tecnología y personal altamente capacitado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Mantenimiento General */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaWrench className="text-blue-600 text-xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Mantenimiento General</h4>
              <p className="text-gray-600 mb-4">
                Revisiones preventivas, cambio de aceite, filtros y servicios de mantenimiento programado.
              </p>
              <div className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                Más información →
              </div>
            </div>

            {/* Mecánica Automotriz */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaCogs className="text-green-600 text-xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Mecánica Automotriz</h4>
              <p className="text-gray-600 mb-4">
                Reparación de motores, transmisiones, sistemas de frenos y suspensión.
              </p>
              <div className="text-green-600 hover:text-green-700 font-medium cursor-pointer">
                Más información →
              </div>
            </div>

            {/* Electricidad Automotriz */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaBolt className="text-yellow-600 text-xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Electricidad Automotriz</h4>
              <p className="text-gray-600 mb-4">
                Diagnóstico y reparación de sistemas eléctricos, baterías, alternadores y arranques.
              </p>
              <div className="text-yellow-600 hover:text-yellow-700 font-medium cursor-pointer">
                Más información →
              </div>
            </div>

            {/* Diagnóstico Computarizado */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FaTachometerAlt className="text-purple-600 text-xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Diagnóstico Computarizado</h4>
              <p className="text-gray-600 mb-4">
                Análisis avanzado con equipos de última generación para detectar fallas precisas.
              </p>
              <div className="text-purple-600 hover:text-purple-700 font-medium cursor-pointer">
                Más información →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">500+</div>
              <div className="text-lg">Vehículos Reparados</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">15+</div>
              <div className="text-lg">Años de Experiencia</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">98%</div>
              <div className="text-lg">Satisfacción del Cliente</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative mr-3">
              <FaCar className="text-2xl text-blue-500" />
              <FaWrench className="absolute -bottom-1 -right-1 text-sm text-yellow-500" />
            </div>
            <span className="text-xl font-bold text-gray-800">AutoFix</span>
          </div>
          <p className="text-gray-600">
            © 2025 AutoFix - Sistema de Gestión Automotriz. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
};

export default HomePage;
