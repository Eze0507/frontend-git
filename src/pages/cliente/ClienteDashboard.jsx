import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCarSide, 
  FaClipboardList, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaUser,
  FaTools,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaQuestionCircle,
  FaSignOutAlt,
  FaHistory
} from 'react-icons/fa';
import { fetchVehiculosCliente } from '../../api/vehiculosApi';
import { fetchAllOrdenes } from '../../api/ordenesApi';
import { fetchMisCitas } from '../../api/citasClienteApi';
import { fetchPagos } from '../../api/pagosApi';
import { obtenerPerfilTaller } from '../../api/tallerApi';
import FloatingChatbot from '@/components/FloatingChatbot';

const ClienteDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [tallerInfo, setTallerInfo] = useState(null);
  
  // Estados para datos del backend
  const [vehiculos, setVehiculos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [pagos, setPagos] = useState([]);
  
  // Estados para hover effects
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  // Estados para estadísticas calculadas
  const [stats, setStats] = useState({
    totalVehiculos: 0,
    ordenesActivas: 0,
    proximaCita: null,
    pagosPendientes: 0,
    montoTotal: 0
  });

  // Estado para el menú desplegable
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obtener nombre de usuario
      const storedUsername = localStorage.getItem('username') || 'Cliente';
      setUsername(storedUsername);

      // Cargar información del taller
      try {
        const tallerData = await obtenerPerfilTaller();
        console.log('🏢 Información del taller:', tallerData);
        setTallerInfo(tallerData);
      } catch (err) {
        console.error('Error cargando información del taller:', err);
      }

      // Cargar datos en paralelo
      const [vehiculosData, ordenesData, citasData, pagosData] = await Promise.all([
        fetchVehiculosCliente().catch(err => {
          console.error('Error cargando vehículos:', err);
          return [];
        }),
        fetchAllOrdenes().catch(err => {
          console.error('Error cargando órdenes:', err);
          return [];
        }),
        fetchMisCitas().catch(err => {
          console.error('Error cargando citas:', err);
          return [];
        }),
        fetchPagos().catch(err => {
          console.error('Error cargando pagos:', err);
          return [];
        })
      ]);

      console.log('📊 Datos cargados:', { vehiculosData, ordenesData, citasData, pagosData });

      setVehiculos(vehiculosData);
      setOrdenes(ordenesData);
      setCitas(citasData);
      setPagos(pagosData);

      // Calcular estadísticas
      calcularEstadisticas(vehiculosData, ordenesData, citasData, pagosData);

    } catch (error) {
      console.error('❌ Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (vehiculosData, ordenesData, citasData, pagosData) => {
    // Órdenes activas (no entregadas ni canceladas)
    const ordenesActivas = ordenesData.filter(
      orden => orden.estado !== 'entregada' && orden.estado !== 'cancelada'
    );

    // Próxima cita (citas confirmadas o agendadas, ordenadas por fecha)
    const citasProximas = citasData
      .filter(cita => cita.estado === 'confirmada' || cita.estado === 'agendada')
      .sort((a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio));

    // Pagos pendientes
    const pagosPendientes = pagosData.filter(
      pago => pago.estado === 'pendiente'
    );

    // Monto total de pagos pendientes
    const montoTotal = pagosPendientes.reduce(
      (sum, pago) => sum + (parseFloat(pago.monto) || 0), 
      0
    );

    setStats({
      totalVehiculos: vehiculosData.length,
      ordenesActivas: ordenesActivas.length,
      proximaCita: citasProximas.length > 0 ? citasProximas[0] : null,
      pagosPendientes: pagosPendientes.length,
      montoTotal: montoTotal
    });
  };

  const getVehiculoPrincipal = () => {
    if (vehiculos.length === 0) return null;
    
    // Vehículo con más órdenes o el primero
    const vehiculoConOrdenes = vehiculos.reduce((prev, current) => {
      const ordenesActuales = ordenes.filter(o => o.vehiculo === current.id).length;
      const ordenesPrev = ordenes.filter(o => o.vehiculo === prev.id).length;
      return ordenesActuales > ordenesPrev ? current : prev;
    }, vehiculos[0]);

    return vehiculoConOrdenes;
  };

  const getEstadoOrdenColor = (estado) => {
    const colores = {
      'pendiente': '#FFA500',
      'en_proceso': '#2196F3',
      'completada': '#4CAF50',
      'entregada': '#4CAF50',
      'cancelada': '#F44336'
    };
    return colores[estado] || '#9E9E9E';
  };

  const getEstadoOrdenTexto = (estado) => {
    const textos = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'completada': 'Completada',
      'entregada': 'Entregada',
      'cancelada': 'Cancelada'
    };
    return textos[estado] || estado;
  };

  const handleLogout = () => {
    // Limpiar localStorage completamente
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('email');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellido');
    localStorage.removeItem('telefono');
    localStorage.removeItem('direccion');
    
    // Redirigir a la página principal con recarga completa
    window.location.href = '/';
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return 'No disponible';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  const vehiculoPrincipal = getVehiculoPrincipal();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando tu dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section - Bienvenida */}
      <div style={styles.heroSection}>
        <div>
          <h1 style={styles.heroTitle}>¡Bienvenido, {username}! 👋</h1>
          <p style={styles.heroSubtitle}>
            Aquí está el resumen de tus servicios automotrices
          </p>
        </div>

        {/* Información del Taller en el centro */}
        {tallerInfo && (
          <div style={styles.tallerInfoCenter}>
            {tallerInfo.logo && (
              <img 
                src={tallerInfo.logo} 
                alt={tallerInfo.nombre_taller}
                style={styles.tallerLogoCentral}
              />
            )}
            <div style={styles.tallerDetailsCenter}>
              <h2 style={styles.tallerNombreCenter}>{tallerInfo.nombre_taller || 'Taller Automotriz'}</h2>
              <div style={styles.tallerContactCenter}>
                {tallerInfo.telefono && (
                  <div style={styles.tallerContactItemCenter}>
                    <span>📞</span>
                    <a href={`tel:${tallerInfo.telefono}`} style={styles.tallerLinkCenter}>
                      {tallerInfo.telefono}
                    </a>
                  </div>
                )}
                {tallerInfo.ubicacion && (
                  <div style={styles.tallerContactItemCenter}>
                    <span>📍</span>
                    <span style={styles.tallerTextCenter}>{tallerInfo.ubicacion}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={styles.heroRightSection}>
          <div style={styles.heroStats}>
            <div style={styles.heroStatItem}>
              <FaCarSide style={styles.heroStatIcon} />
              <div>
                <p style={styles.heroStatValue}>{stats.totalVehiculos}</p>
                <p style={styles.heroStatLabel}>Vehículos</p>
              </div>
            </div>
            <div style={styles.heroStatItem}>
              <FaTools style={{...styles.heroStatIcon, color: '#2196F3'}} />
              <div>
                <p style={styles.heroStatValue}>{stats.ordenesActivas}</p>
                <p style={styles.heroStatLabel}>Servicios Activos</p>
              </div>
            </div>
          </div>

          {/* Menú de Usuario */}
          <div style={styles.userMenuContainer} className="user-menu-container">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={styles.userMenuButton}
            >
              <span style={styles.userMenuText}>Hola, {username}</span>
              <span style={{...styles.userMenuArrow, transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
            </button>
            
            {showUserMenu && (
              <div style={styles.userMenuDropdown}>
                <button 
                  onClick={() => { navigate('/cliente/perfil'); setShowUserMenu(false); }}
                  style={styles.userMenuItem}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <FaUser style={styles.userMenuIcon} />
                  <span>Ver Perfil</span>
                </button>
                <button 
                  onClick={() => { navigate('/cliente/vehiculos'); setShowUserMenu(false); }}
                  style={styles.userMenuItem}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <FaCarSide style={styles.userMenuIcon} />
                  <span>Mis Vehículos</span>
                </button>
                <button 
                  onClick={() => { navigate('/cliente/ordenes'); setShowUserMenu(false); }}
                  style={styles.userMenuItem}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <FaClipboardList style={styles.userMenuIcon} />
                  <span>Mis Órdenes</span>
                </button>
                <button 
                  onClick={() => { navigate('/cliente/citas'); setShowUserMenu(false); }}
                  style={styles.userMenuItem}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <FaCalendarAlt style={styles.userMenuIcon} />
                  <span>Mis Citas</span>
                </button>
                <button 
                  onClick={() => { navigate('/cliente/pagos'); setShowUserMenu(false); }}
                  style={styles.userMenuItem}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <FaMoneyBillWave style={styles.userMenuIcon} />
                  <span>Mis Pagos</span>
                </button>
                <button 
                  onClick={() => { navigate('/cliente/historial'); setShowUserMenu(false); }}
                  style={styles.userMenuItem}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <FaHistory style={styles.userMenuIcon} />
                  <span>Historial de Servicios</span>
                </button>
                <div style={styles.userMenuDivider}></div>
                <button 
                  onClick={handleLogout}
                  style={{...styles.userMenuItem, color: '#d32f2f'}}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <FaSignOutAlt style={{...styles.userMenuIcon, color: '#d32f2f'}} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Columna Principal */}
        <div style={styles.leftColumn}>
          {/* Resumen Rápido */}
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Resumen Rápido</h3>
            
            {/* Servicios Activos */}
            <div style={styles.summarySection}>
              <div style={styles.summarySectionHeader}>
                <FaTools style={styles.summarySectionIcon} />
                <span style={styles.summarySectionTitle}>Servicios Activos</span>
              </div>
              {ordenes.filter(o => o.estado !== 'entregada' && o.estado !== 'cancelada').slice(0, 3).map(orden => (
                <div 
                  key={orden.id} 
                  style={{
                    ...styles.summaryItem,
                    ...(hoveredItem === `orden-${orden.id}` && styles.summaryItemHover)
                  }}
                  onMouseEnter={() => setHoveredItem(`orden-${orden.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => navigate('/cliente/ordenes')}
                >
                  <div style={styles.summaryItemContent}>
                    <p style={styles.summaryItemTitle}>{orden.marcaModelo}</p>
                    <p style={styles.summaryItemSubtitle}>Orden {orden.numero}</p>
                  </div>
                  <div style={{...styles.statusBadge, backgroundColor: getEstadoOrdenColor(orden.estado)}}>
                    {getEstadoOrdenTexto(orden.estado)}
                  </div>
                </div>
              ))}
              {ordenes.filter(o => o.estado !== 'entregada' && o.estado !== 'cancelada').length === 0 && (
                <p style={styles.emptyMessage}>No hay servicios activos</p>
              )}
            </div>

            {/* Pagos Pendientes */}
            {stats.pagosPendientes > 0 && (
              <div style={styles.summarySection}>
                <div style={styles.summarySectionHeader}>
                  <FaExclamationTriangle style={{...styles.summarySectionIcon, color: '#FFA500'}} />
                  <span style={styles.summarySectionTitle}>Pagos Pendientes</span>
                </div>
                <div style={styles.pendingPayment}>
                  <p style={styles.pendingPaymentAmount}>Bs {stats.montoTotal.toFixed(2)}</p>
                  <p style={styles.pendingPaymentText}>{stats.pagosPendientes} {stats.pagosPendientes === 1 ? 'pago pendiente' : 'pagos pendientes'}</p>
                  <button 
                    style={styles.pendingPaymentButton}
                    onClick={() => navigate('/cliente/pagos')}
                  >
                    Ver Pagos
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tarjetas de Acceso Rápido - Orden: Perfil primero */}
          <div style={styles.quickAccessGrid}>
            <div 
              style={{
                ...styles.actionCard,
                ...(hoveredCard === 'perfil' && styles.actionCardHover)
              }}
              onMouseEnter={() => setHoveredCard('perfil')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate('/cliente/perfil')}
            >
              <div style={{...styles.actionIconCircle, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
                <FaUser style={styles.actionIcon} />
              </div>
              <h4 style={styles.actionTitle}>Mi Perfil</h4>
              <p style={styles.actionDescription}>
                Ver y editar información
              </p>
            </div>

            <div 
              style={{
                ...styles.actionCard,
                ...(hoveredCard === 'vehiculos' && styles.actionCardHover)
              }}
              onMouseEnter={() => setHoveredCard('vehiculos')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate('/cliente/vehiculos')}
            >
              <div style={{...styles.actionIconCircle, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <FaCarSide style={styles.actionIcon} />
              </div>
              <h4 style={styles.actionTitle}>Mis Vehículos</h4>
              <p style={styles.actionDescription}>
                {stats.totalVehiculos} {stats.totalVehiculos === 1 ? 'vehículo registrado' : 'vehículos registrados'}
              </p>
            </div>

            <div 
              style={{
                ...styles.actionCard,
                ...(hoveredCard === 'ordenes' && styles.actionCardHover)
              }}
              onMouseEnter={() => setHoveredCard('ordenes')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate('/cliente/ordenes')}
            >
              <div style={{...styles.actionIconCircle, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
                <FaClipboardList style={styles.actionIcon} />
              </div>
              <h4 style={styles.actionTitle}>Órdenes de Servicio</h4>
              <p style={styles.actionDescription}>
                {stats.ordenesActivas} {stats.ordenesActivas === 1 ? 'servicio activo' : 'servicios activos'}
              </p>
            </div>

            <div 
              style={{
                ...styles.actionCard,
                ...(hoveredCard === 'citas' && styles.actionCardHover)
              }}
              onMouseEnter={() => setHoveredCard('citas')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate('/cliente/citas')}
            >
              <div style={{...styles.actionIconCircle, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>
                <FaCalendarAlt style={styles.actionIcon} />
              </div>
              <h4 style={styles.actionTitle}>Mis Citas</h4>
              <p style={styles.actionDescription}>
                {stats.proximaCita ? `Próxima: ${formatFecha(stats.proximaCita.fecha_hora_inicio)}` : 'Sin citas programadas'}
              </p>
            </div>

            <div 
              style={{
                ...styles.actionCard,
                ...(hoveredCard === 'pagos' && styles.actionCardHover)
              }}
              onMouseEnter={() => setHoveredCard('pagos')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate('/cliente/pagos')}
            >
              <div style={{...styles.actionIconCircle, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'}}>
                <FaMoneyBillWave style={styles.actionIcon} />
              </div>
              <h4 style={styles.actionTitle}>Pagos</h4>
              <p style={styles.actionDescription}>
                {stats.pagosPendientes} {stats.pagosPendientes === 1 ? 'pago pendiente' : 'pagos pendientes'}
              </p>
            </div>

            <div 
              style={{
                ...styles.actionCard,
                ...(hoveredCard === 'historial' && styles.actionCardHover)
              }}
              onMouseEnter={() => setHoveredCard('historial')}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate('/cliente/historial')}
            >
              <div style={{...styles.actionIconCircle, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>
                <FaHistory style={styles.actionIcon} />
              </div>
              <h4 style={styles.actionTitle}>Historial de Servicios</h4>
              <p style={styles.actionDescription}>
                Servicios completados
              </p>
            </div>
          </div>
        </div>

        {/* Panel Lateral Derecho */}
        <div style={styles.rightColumn}>
          {/* Próximas Citas */}
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Próximas Citas</h3>
            <div style={styles.summarySectionHeader}>
              <FaCalendarAlt style={styles.summarySectionIcon} />
              <span style={styles.summarySectionTitle}>Citas Programadas</span>
            </div>
            {citas
              .filter(c => c.estado === 'confirmada' || c.estado === 'agendada')
              .sort((a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio))
              .slice(0, 3)
              .map(cita => (
                <div 
                  key={cita.id} 
                  style={{
                    ...styles.summaryItem,
                    ...(hoveredItem === `cita-${cita.id}` && styles.summaryItemHover)
                  }}
                  onMouseEnter={() => setHoveredItem(`cita-${cita.id}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => navigate('/cliente/citas')}
                >
                  <div style={styles.summaryItemContent}>
                    <p style={styles.summaryItemTitle}>{formatFecha(cita.fecha_hora_inicio)}</p>
                    <p style={styles.summaryItemSubtitle}>{cita.tipo_cita}</p>
                  </div>
                  <FaClock style={styles.summaryItemIcon} />
                </div>
              ))
            }
            {citas.filter(c => c.estado === 'confirmada' || c.estado === 'agendada').length === 0 && (
              <p style={styles.emptyMessage}>No hay citas programadas</p>
            )}
          </div>
        </div>
      </div>

      {/* Chatbot Flotante */}
      <FloatingChatbot />
    </div>
  );
};

// Estilos inline JSX
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '1rem',
    fontSize: '1.1rem',
    color: '#666'
  },
  heroSection: {
    background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '2rem',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    '@media (maxWidth: 768px)': {
      flexDirection: 'column',
      textAlign: 'center'
    }
  },
  tallerInfoCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    padding: '1rem 2rem',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    flex: '1',
    justifyContent: 'center',
    maxWidth: '600px'
  },
  tallerLogoCentral: {
    width: '70px',
    height: '70px',
    objectFit: 'contain',
    borderRadius: '12px',
    backgroundColor: 'white',
    padding: '0.5rem',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  tallerDetailsCenter: {
    flex: 1
  },
  tallerNombreCenter: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
  },
  tallerContactCenter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  tallerContactItemCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem'
  },
  tallerLinkCenter: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'opacity 0.2s',
    opacity: 0.95
  },
  tallerTextCenter: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: '0.9rem'
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    margin: 0
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
    margin: 0
  },
  heroStats: {
    display: 'flex',
    gap: '2rem'
  },
  heroStatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '1rem 1.5rem',
    borderRadius: '15px',
    backdropFilter: 'blur(10px)'
  },
  heroStatIcon: {
    fontSize: '2rem',
    color: 'white'
  },
  heroStatValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    margin: 0
  },
  heroStatLabel: {
    fontSize: '0.9rem',
    opacity: 0.9,
    margin: 0
  },
  heroRightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem'
  },
  userMenuContainer: {
    position: 'relative',
    zIndex: 1000
  },
  userMenuButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '30px',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    fontWeight: '500'
  },
  userMenuText: {
    fontSize: '1rem',
    fontWeight: '500'
  },
  userMenuArrow: {
    fontSize: '0.7rem',
    transition: 'transform 0.3s ease'
  },
  userMenuDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    minWidth: '200px',
    overflow: 'hidden',
    border: '1px solid #e0e0e0'
  },
  userMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1.25rem',
    border: 'none',
    backgroundColor: 'white',
    color: '#333',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    textAlign: 'left',
    fontFamily: 'inherit'
  },
  userMenuIcon: {
    fontSize: '1rem',
    color: '#2563eb'
  },
  userMenuDivider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '0.25rem 0'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '2rem'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem'
  },
  vehicleCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  vehicleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem'
  },
  vehicleTitle: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '0.5rem',
    margin: 0
  },
  vehicleBrand: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0
  },
  vehicleIcon: {
    fontSize: '3rem',
    color: '#667eea',
    opacity: 0.3
  },
  vehicleDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  vehicleDetailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px'
  },
  vehicleDetailLabel: {
    color: '#666',
    fontWeight: '500'
  },
  vehicleDetailValue: {
    color: '#1a1a1a',
    fontWeight: '600'
  },
  vehicleButton: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  vehicleButtonHover: {
    backgroundColor: '#5568d3',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '3rem 2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '4rem',
    color: '#e0e0e0',
    marginBottom: '1rem'
  },
  emptyText: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '1.5rem'
  },
  emptyButton: {
    padding: '0.875rem 2rem',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  quickAccessGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    marginBottom: '3rem'
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  actionCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
  },
  actionIconCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 0.75rem',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
  },
  actionIcon: {
    fontSize: '1.8rem',
    color: 'white'
  },
  actionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '0.4rem',
    margin: '0 0 0.4rem 0'
  },
  actionDescription: {
    fontSize: '0.8rem',
    color: '#666',
    margin: 0
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  summaryTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '1.5rem',
    margin: '0 0 1.5rem 0'
  },
  summarySection: {
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #e0e0e0'
  },
  summarySectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  summarySectionIcon: {
    fontSize: '1.2rem',
    color: '#667eea'
  },
  summarySectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    marginBottom: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  summaryItemHover: {
    backgroundColor: '#e9ecef',
    transform: 'translateX(4px)'
  },
  summaryItemContent: {
    flex: 1
  },
  summaryItemTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '0.25rem',
    margin: '0 0 0.25rem 0'
  },
  summaryItemSubtitle: {
    fontSize: '0.85rem',
    color: '#666',
    margin: 0
  },
  summaryItemIcon: {
    fontSize: '1.2rem',
    color: '#667eea'
  },
  statusBadge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize'
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#999',
    fontSize: '0.9rem',
    padding: '1rem',
    fontStyle: 'italic'
  },
  pendingPayment: {
    backgroundColor: '#fff3cd',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
    border: '2px solid #ffc107'
  },
  pendingPaymentAmount: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  pendingPaymentText: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '1rem',
    margin: '0 0 1rem 0'
  },
  pendingPaymentButton: {
    padding: '0.75rem 2rem',
    backgroundColor: '#ffc107',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  helpCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '20px',
    padding: '2rem',
    textAlign: 'center',
    color: 'white',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
  },
  helpIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.9
  },
  helpTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  helpText: {
    fontSize: '0.95rem',
    opacity: 0.9,
    marginBottom: '1.5rem',
    margin: '0 0 1.5rem 0'
  },
  helpButton: {
    padding: '0.875rem 2rem',
    backgroundColor: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  logoutCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '1.5rem',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  }
};

export default ClienteDashboard;
