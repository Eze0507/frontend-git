// src/components/Sidebar.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaChevronDown,
  FaChevronRight,
  FaUserCog,
  FaUsers,
  FaCogs,
  FaMoneyBillWave,
  FaHome,
  FaSignOutAlt,
  FaUserCircle,
  FaWrench,
  FaCar,
  FaUser,
  FaBars,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import UserProfile from './UserProfile.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const Sidebar = ({ isVisible = true, onToggle }) => {
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation(); // Hook para detectar cambios de ruta
  const [username, setUsername] = useState(localStorage.getItem("username") || "Usuario");
  const [userRole, setUserRole] = useState("Invitado");

  // Usar el hook de autenticación
  const { logout } = useAuth();


  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
    setOpenSubMenu(null); // Cierra submenús al abrir otro menú principal
  };

  const toggleSubMenu = (subKey) => {
    setOpenSubMenu(openSubMenu === subKey ? null : subKey);
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Iniciando logout...");
      await logout({ navigate });
    } catch (error) {
      console.error("❌ Error durante el logout:", error);
      // Fallback: forzar redirección al login incluso si hay error
      window.location.href = "/login";
    }
  };

  const handleShowProfile = () => {
    setShowProfile(true);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
  };

  // Este efecto se ejecutará cada vez que cambie la URL.
  // Así nos aseguramos de que la información del usuario se actualice después del login.
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserRole = localStorage.getItem("userRole");
    
    setUsername(storedUsername || "Usuario");
    setUserRole(storedUserRole || "Invitado");
    
    console.log("Username en sidebar:", storedUsername);
    console.log("UserRole en sidebar:", storedUserRole);
  }, [location.pathname]); // Se dispara con cada cambio de navegación

  const menuItems = [
    {
      title: "Dashboard",
      icon: <FaHome className="mr-2" />,
      key: "dashboard",
      path: "/admin/dashboard",
    },
    {
      title: "Administración",
      icon: <FaUserCog className="mr-2" />,
      key: "administracion",
      subItems: [
  { name: "Rol", path: "/admin/roles" },
  { name: "Usuario", path: "/admin/usuarios" },
  { name: "Empleado", path: "/admin/empleados" },
  { name: "Cargo", path: "/admin/cargos" },
  { name: "Asistencia", path: "/admin/asistencias" },
  { name: "Nómina", path: "/admin/nominas" },
  { name: "Bitácora", path: "/admin/bitacora" },
      ],
    },
    {
      title: "Clientes",
      icon: <FaUsers className="mr-2" />,
      key: "clientes",
      subItems: [
        { name: "Cliente", path: "/admin/clientes" },
        { name: "Cita", path: "/admin/clientes/citas" },
        { name: "Asistente Virtual", path: "/admin/clientes/asistente" },
        { name: "Historial", path: "/admin/clientes/historial" },
      ],
    },
    {
      title: "Operaciones",
      icon: <FaCogs className="mr-2" />,
      key: "operaciones",
      subItems: [
        { name: "Presupuesto", path: "/presupuestos" },
        { name: "Orden de Trabajo", path: "/ordenes" },
        { name: "Vehículo", path: "/admin/operaciones/vehiculos" },
        { name: "Reconocimiento de Placas", path: "/admin/reconocimiento" },
        {
          name: "inventario",
          key: "inventario",
          subItems: [
            { name: "Item de Venta", path: "/admin/operaciones/inventario/venta" },
            { name: "Item de Taller", path: "/admin/operaciones/inventario/taller" },
          ],
        },
        { name: "Servicios", path: "/admin/operaciones/servicios" },
        { name: "Proveedores", path: "/admin/proveedores" },
        { name: "Área", path: "/admin/operaciones/area" },
      ],
    },
    {
      title: "Finanzas",
      icon: <FaMoneyBillWave className="mr-2" />,
      key: "finanzas",
      subItems: [
        { name: "Historial de Pagos", path: "/pagos" },
        { name: "Factura Proveedor", path: "/admin/finanzas/facturas-proveedor" },
        { name: "Reportes", path: "/admin/finanzas/reportes" },
      ],
    },
  ];

  // Filtrado por rol (sin cambiar estructura ni flujo)
  const allowedByRole = {
    admin: ["dashboard", "administracion", "clientes", "operaciones", "finanzas"],
    empleado: ["dashboard", "clientes", "operaciones"],
    cliente: [],
  };

  const normalizedRole = (userRole || '').toLowerCase();
  const mappedRole = normalizedRole === 'administrador' ? 'admin' : normalizedRole;
  const allowedKeys = allowedByRole[mappedRole] || [];
  
  // Memorizar filteredMenuItems para evitar bucles infinitos
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(mi => allowedKeys.includes(mi.key));
  }, [userRole]);

  // 🔍 Lógica de búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = [];

    filteredMenuItems.forEach((menu) => {
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
  }, [searchQuery, filteredMenuItems]);

  return (
    <>
      {/* Botón toggle cuando el sidebar está oculto */}
      {!isVisible && (
        <button
          onClick={onToggle}
          className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-3 rounded-md shadow-lg hover:bg-gray-700 transition-all duration-200 transform hover:scale-105"
        >
          <FaBars className="text-lg" />
        </button>
      )}
      
      <aside className={`bg-gray-800 text-white w-64 flex flex-col absolute top-0 left-0 h-full z-50 sidebar-transition ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 text-center border-b border-gray-700 shadow-md">
          {/* Botón toggle cuando el sidebar está visible */}
          <div className="flex justify-between items-center mb-2">
            <div className="flex-1"></div>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
            >
              <FaBars className="text-lg" />
            </button>
          </div>
          
          <Link to="/admin/home" className="block hover:opacity-80 transition-opacity duration-200">
          <div className="flex items-center justify-center mb-2">
            <div className="relative">
              <FaCar className="text-3xl text-blue-400 mr-1" />
              <FaWrench className="absolute -bottom-1 -right-1 text-lg text-yellow-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">AutoFix</h2>
          <p className="text-xs text-gray-400 mt-1">Sistema de Gestión Automotriz</p>
        </Link>
      </div>

      {/* 🔍 Buscador */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Buscar funcionalidad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-900 text-white text-sm rounded-md border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
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

        {/* Resultados */}
        {searchQuery && searchResults.length > 0 && (
          <div className="mt-2 bg-gray-900 rounded-md max-h-64 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery("");
                  window.location.href = result.path;
                }}
                className="w-full flex items-start gap-2 px-3 py-2 hover:bg-gray-700 rounded transition-colors text-left"
              >
                <span className="text-gray-400 mt-0.5">{result.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{result.title}</p>
                  {result.parent && (
                    <p className="text-xs text-gray-400">{result.parent}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && (
          <div className="mt-2 p-3 text-center text-sm text-gray-400">
            No se encontraron resultados
          </div>
        )}
      </div>

      {/* Menú Desplazable */}
      <nav className="flex-1 overflow-y-auto p-4 sidebar-scrollbar">
        <ul className="space-y-2">
          {filteredMenuItems.map((menu) => (
            <li key={menu.key}>
              {menu.subItems ? (
                <>
                  {/* 🔽 Módulos con subItems */}
                  <div
                    className="flex items-center justify-between p-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => toggleMenu(menu.key)}
                  >
                    <div className="flex items-center">
                      {menu.icon}
                      <span>{menu.title}</span>
                    </div>
                    {openMenu === menu.key ? (
                      <FaChevronDown className="text-xs" />
                    ) : (
                      <FaChevronRight className="text-xs" />
                    )}
                  </div>

                  {openMenu === menu.key && (
                    <ul className="ml-4">
                      {menu.subItems.map((sub, idx) => (
                        <li key={idx}>
                          {sub.subItems ? (
                            <>
                              <div
                                className={`flex items-center justify-between block p-2 hover:bg-gray-700 cursor-pointer ${openSubMenu === sub.key ? 'bg-gray-700' : ''}`}
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleSubMenu(sub.key);
                                }}
                              >
                                <span>{sub.name}</span>
                                {openSubMenu === sub.key ? (
                                  <FaChevronDown className="text-xs ml-2" />
                                ) : (
                                  <FaChevronRight className="text-xs ml-2" />
                                )}
                              </div>
                              {openSubMenu === sub.key && (
                                <ul className="ml-4">
                                  {sub.subItems.map((ssub, sidx) => (
                                    <li key={sidx}>
                                      <button
                                        onClick={() => window.location.href = ssub.path}
                                        className="w-full text-left block p-2 hover:bg-gray-700 text-white"
                                      >
                                        {ssub.name}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => window.location.href = sub.path}
                              className="w-full text-left block p-2 hover:bg-gray-700"
                            >
                              {sub.name}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                /* 🔗 Items simples (ej: Dashboard) */
                <button
                  onClick={() => window.location.href = menu.path}
                  className="w-full text-left flex items-center p-2 hover:bg-gray-700"
                >
                  {menu.icon}
                  <span>{menu.title}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Sección de Usuario y Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-4">
          <FaUserCircle className="text-2xl text-gray-400 mr-3" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white truncate">
              {username}
            </span>
            <span className="text-xs text-gray-400 capitalize">
              {userRole}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleShowProfile}
            className="flex items-center w-full p-2 rounded-md text-indigo-400 hover:bg-indigo-800 hover:text-white transition-colors duration-200"
          >
            <FaUser className="mr-3" />
            <span className="text-sm">Ver Perfil</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center w-full p-2 rounded-md text-red-400 hover:bg-red-800 hover:text-white transition-colors duration-200"
          >
            <FaSignOutAlt className="mr-3" />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Modal del Perfil */}
      {showProfile && (
        <UserProfile onClose={handleCloseProfile} />
      )}
    </aside>
    </>
  );
};

export default Sidebar;
