import React, { useState, useEffect } from 'react';
import { FaBars, FaUser, FaBell, FaCar, FaWrench, FaSearch, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { obtenerPerfilTaller } from '@/api/tallerApi';

const Header = ({ sidebarVisible, onToggleSidebar, menuItems = [] }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // Cargar inmediatamente desde localStorage para evitar el flash
  const [nombreTaller, setNombreTaller] = useState(() => {
    return localStorage.getItem('nombre_taller') || "AutoFix";
  });
  const [logoTaller, setLogoTaller] = useState(() => {
    return localStorage.getItem('logo_taller') || null;
  });

  // Efecto para obtener el nombre y logo del taller
  useEffect(() => {
    const fetchTallerInfo = async () => {
      try {
        const tallerData = await obtenerPerfilTaller();
        if (tallerData && tallerData.nombre_taller) {
          setNombreTaller(tallerData.nombre_taller);
          // También guardarlo en localStorage para acceso rápido
          localStorage.setItem('nombre_taller', tallerData.nombre_taller);
        }
        if (tallerData && tallerData.logo) {
          setLogoTaller(tallerData.logo);
          localStorage.setItem('logo_taller', tallerData.logo);
        }
      } catch (error) {
        console.log('No se pudo cargar el perfil del taller, usando valores cacheados');
      }
    };

    // Solo obtener si hay un token de acceso (usuario autenticado)
    if (localStorage.getItem('access')) {
      fetchTallerInfo();
    }
  }, []);

  // Efecto para buscar en el menú
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    menuItems.forEach((menu) => {
      // Buscar en menú principal (solo si tiene path directo)
      if (menu.path && menu.title.toLowerCase().includes(query)) {
        results.push({
          title: menu.title,
          path: menu.path,
          icon: menu.icon,
        });
      }

      // Buscar en submenús
      if (menu.subItems) {
        menu.subItems.forEach((sub) => {
          // Solo agregar si tiene path (no es contenedor)
          if (sub.path && sub.name.toLowerCase().includes(query)) {
            results.push({
              title: sub.name,
              path: sub.path,
              icon: menu.icon,
              parent: menu.title,
            });
          }

          // Buscar en sub-submenús
          if (sub.subItems) {
            sub.subItems.forEach((ssub) => {
              if (ssub.path && ssub.name.toLowerCase().includes(query)) {
                results.push({
                  title: ssub.name,
                  path: ssub.path,
                  icon: menu.icon,
                  parent: `${menu.title} > ${sub.name}`,
                });
              }
            });
          }
        });
      }
    });

    setSearchResults(results);
  }, [searchQuery, menuItems]);

  return (
    <header className={`bg-gray-800 text-white shadow-md transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1) ${
      sidebarVisible ? 'ml-64' : 'ml-0'
    } fixed top-0 right-0 left-0 z-40`}>
      <div className="flex items-center h-16 px-6">
        {/* Botón para toggle del sidebar */}
        <button
          onClick={onToggleSidebar}
          className="text-white hover:bg-gray-700 p-2 rounded-md transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <FaBars className="text-xl" />
        </button>

        {/* Logo y nombre del Taller */}
        <Link to="/admin/home" className="flex items-center gap-2 ml-2 hover:opacity-80 transition-opacity duration-200">
          {logoTaller ? (
            <img 
              src={logoTaller} 
              alt="Logo del taller" 
              className="h-10 w-10 object-contain rounded"
              onError={(e) => {
                // Si falla la carga de la imagen, mostrar iconos por defecto
                e.target.style.display = 'none';
                setLogoTaller(null);
              }}
            />
          ) : (
            <div className="relative">
              <FaCar className="text-2xl text-blue-400" />
              <FaWrench className="absolute -bottom-1 -right-1 text-sm text-yellow-400" />
            </div>
          )}
          <h1 className="text-xl font-bold">{nombreTaller}</h1>
        </Link>

        {/* Buscador */}
        <div className="flex-1 max-w-2xl ml-12 relative">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Buscar funcionalidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-gray-700 text-white text-sm rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white p-1"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>

          {/* Resultados de búsqueda */}
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-900 rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.map((result, idx) => (
                <Link
                  key={idx}
                  to={result.path}
                  onClick={() => setSearchQuery("")}
                  className="flex items-start gap-2 px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  <span className="text-gray-400 mt-0.5">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{result.title}</p>
                    {result.parent && (
                      <p className="text-xs text-gray-400">{result.parent}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full mt-2 w-full bg-gray-900 rounded-md shadow-lg p-4 text-center text-sm text-gray-400 z-50">
              No se encontraron resultados
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
