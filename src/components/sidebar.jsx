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
  FaDatabase,
} from "react-icons/fa";
import UserProfile from './UserProfile.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const Sidebar = ({ isVisible = true, onToggle, onMenuItemsReady }) => {
  // Cargar el estado de menús abiertos desde localStorage
  const [openMenu, setOpenMenu] = useState(() => {
    return localStorage.getItem('sidebar_open_menu') || null;
  });
  const [openSubMenu, setOpenSubMenu] = useState(() => {
    return localStorage.getItem('sidebar_open_submenu') || null;
  });
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Hook para detectar cambios de ruta
  const [username, setUsername] = useState(localStorage.getItem("username") || "Usuario");
  const [userRole, setUserRole] = useState("Invitado");

  // Usar el hook de autenticación
  const { logout } = useAuth();


  const toggleMenu = (menu) => {
    const newOpenMenu = openMenu === menu ? null : menu;
    setOpenMenu(newOpenMenu);
    setOpenSubMenu(null); // Cierra submenús al abrir otro menú principal
    // Guardar en localStorage
    if (newOpenMenu) {
      localStorage.setItem('sidebar_open_menu', newOpenMenu);
    } else {
      localStorage.removeItem('sidebar_open_menu');
    }
    localStorage.removeItem('sidebar_open_submenu');
  };

  const toggleSubMenu = (subKey) => {
    const newOpenSubMenu = openSubMenu === subKey ? null : subKey;
    setOpenSubMenu(newOpenSubMenu);
    // Guardar en localStorage
    if (newOpenSubMenu) {
      localStorage.setItem('sidebar_open_submenu', newOpenSubMenu);
    } else {
      localStorage.removeItem('sidebar_open_submenu');
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Iniciando logout desde Sidebar...");
      await logout({ navigate });
      // El hook useAuth ya redirige a "/" con window.location.href
    } catch (error) {
      console.error("❌ Error durante el logout:", error);
      // Fallback: forzar redirección a la página principal incluso si hay error
      window.location.href = "/";
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
      title: "Mi Taller",
      icon: <FaWrench className="mr-2" />,
      key: "mi-taller",
      path: "/admin/mi-taller",
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
  { name: "Backup/Restore", path: "/admin/backup" },
      ],
    },
    {
      title: "Clientes",
      icon: <FaUsers className="mr-2" />,
      key: "clientes",
      subItems: [
        { name: "Cliente", path: "/admin/clientes" },
        { name: "Cita", path: "/admin/clientes/citas" },
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
    admin: ["dashboard", "mi-taller", "administracion", "clientes", "operaciones", "finanzas"],
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

  // Notificar al Layout cuando los menuItems estén listos
  useEffect(() => {
    if (onMenuItemsReady && filteredMenuItems.length > 0) {
      onMenuItemsReady(filteredMenuItems);
    }
  }, [filteredMenuItems, onMenuItemsReady]);

  // Auto-abrir el menú correcto basado en la ruta actual
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Buscar qué menú principal contiene la ruta actual
    for (const menu of menuItems) {
      if (menu.subItems) {
        // Buscar en subItems
        for (const subItem of menu.subItems) {
          if (subItem.path === currentPath) {
            setOpenMenu(menu.key);
            localStorage.setItem('sidebar_open_menu', menu.key);
            return;
          }
          // Buscar en sub-subItems (como inventario)
          if (subItem.subItems) {
            for (const subSubItem of subItem.subItems) {
              if (subSubItem.path === currentPath) {
                setOpenMenu(menu.key);
                setOpenSubMenu(subItem.key);
                localStorage.setItem('sidebar_open_menu', menu.key);
                localStorage.setItem('sidebar_open_submenu', subItem.key);
                return;
              }
            }
          }
        }
      }
    }
  }, [location.pathname]);

  return (
    <>
      <aside className={`bg-gray-800 text-white w-64 flex flex-col absolute top-0 left-0 h-full z-30 sidebar-transition ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sección de Usuario */}
        <div className="p-4 pt-6">
          <div className="flex flex-col items-center justify-center">
            <FaUserCircle className="text-4xl text-gray-400 mb-2" />
            <span className="text-sm font-semibold text-white truncate text-center w-full">
              {username}
            </span>
            <span className="text-xs text-gray-400 capitalize truncate text-center">
              {userRole}
            </span>
          </div>
        </div>

      {/* Menú Desplazable */}
      <nav className="flex-1 overflow-y-auto p-4 pt-2 sidebar-scrollbar">
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

      {/* Botones de Acción */}
      <div className="p-4 pt-2">
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
