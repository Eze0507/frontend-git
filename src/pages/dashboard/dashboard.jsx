import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FaUsers, 
  FaUserTie, 
  FaClipboardList, 
  FaDollarSign, 
  FaCalendarAlt,
  FaWrench,
  FaChartLine,
  FaArrowRight,
  FaFileInvoice,
  FaTools,
  FaCar,
  FaUserCheck
} from "react-icons/fa";
import { fetchDashboardAdmin, fetchDashboardEmpleado } from "@/api/dashboardApi";

// Componente de gráfico de barras simple con SVG
const BarChart = ({ data, title, color = "#3b82f6" }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const svgWidth = 400;
  const svgHeight = 200;
  const barSpacing = 10;
  const barWidth = (svgWidth - (barSpacing * (data.length + 1))) / data.length;

  const containerRef = useRef(null);

  const handleMouseMove = (e, index) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="p-4 relative" ref={containerRef}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 150;
          const x = barSpacing + (index * (barWidth + barSpacing));
          const y = svgHeight - height - 30;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                fill={color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                rx="4"
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseLeave={handleMouseLeave}
              />
              <text
                x={x + barWidth / 2}
                y={svgHeight - 5}
                fontSize="10"
                textAnchor="middle"
                fill="#666"
              >
                {item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={y - 5}
                fontSize="11"
                textAnchor="middle"
                fill="#333"
                fontWeight="bold"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Tooltip con nombre completo - centrado en el cursor */}
      {hoveredIndex !== null && (
        <div
          className="absolute bg-gray-900 text-white text-xs rounded px-2 py-1 z-50 pointer-events-none shadow-lg whitespace-nowrap"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 10}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {data[hoveredIndex].labelCompleto || data[hoveredIndex].label}
        </div>
      )}
    </div>
  );
};

// Componente de gráfico de líneas simple
const LineChart = ({ data, title, color = "#10b981" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  if (data.length === 1) {
    // Si solo hay un punto, mostrar un círculo
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
              <span className="text-2xl font-bold" style={{ color }}>{data[0].value}</span>
            </div>
            <p className="text-sm text-gray-600">{data[0].label}</p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const svgWidth = 400;
  const svgHeight = 200;
  const padding = 40;

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * (svgWidth - 2 * padding);
    const y = svgHeight - padding - (item.value / maxValue) * (svgHeight - 2 * padding);
    return { x, y, value: item.value, label: item.label };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Área bajo la línea */}
        <path
          d={`${pathData} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`}
          fill="url(#lineGradient)"
        />
        {/* Línea */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Puntos y etiquetas */}
        {points.map((point, index) => (
          <g key={index}>
            <circle cx={point.x} cy={point.y} r="5" fill={color} stroke="white" strokeWidth="2" />
            <text
              x={point.x}
              y={point.y - 15}
              fontSize="10"
              textAnchor="middle"
              fill="#333"
              fontWeight="bold"
            >
              {point.value}
            </text>
            <text
              x={point.x}
              y={svgHeight - 10}
              fontSize="9"
              textAnchor="middle"
              fill="#666"
            >
              {point.label.length > 6 ? point.label.substring(0, 6) : point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Componente de gráfico de pastel simple
const PieChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
  const centerX = 100;
  const centerY = 100;
  const radius = 80;
  
  let currentAngle = -90;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    const endAngle = currentAngle;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    return {
      path: `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      color: colors[index % colors.length],
      label: item.label,
      value: item.value,
      percentage: percentage.toFixed(1)
    };
  });

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex flex-col md:flex-row items-center justify-center gap-6">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {segments.map((segment, index) => (
            <g key={index}>
              <path
                d={segment.path}
                fill={segment.color}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                stroke="white"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-700">
                {segment.label}: <strong>{segment.value}</strong> ({segment.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const role = localStorage.getItem('userRole') || 'admin';
        setUserRole(role);

        let data;
        if (role === 'admin' || role === 'administrador') {
          data = await fetchDashboardAdmin();
        } else if (role === 'empleado') {
          data = await fetchDashboardEmpleado();
        } else {
          setError('Rol no reconocido');
          setLoading(false);
          return;
        }

        console.log('Dashboard data loaded:', data);
        setDashboardData(data);
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
        setError(err.message || 'Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getEstadoBadgeClass = (estado) => {
    const estados = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'en_proceso': 'bg-blue-100 text-blue-800',
      'finalizada': 'bg-green-100 text-green-800',
      'entregada': 'bg-purple-100 text-purple-800',
      'cancelada': 'bg-red-100 text-red-800',
      'confirmada': 'bg-green-100 text-green-800',
      'completada': 'bg-blue-100 text-blue-800'
    };
    return estados[estado] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'finalizada': 'Finalizada',
      'entregada': 'Entregada',
      'cancelada': 'Cancelada',
      'confirmada': 'Confirmada',
      'completada': 'Completada'
    };
    return labels[estado] || estado;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold">Error</p>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No se pudieron cargar los datos del dashboard.</p>
      </div>
    );
  }

  // Dashboard para Administrador
  if (userRole === 'admin' || userRole === 'administrador') {
    const { estadisticas, graficos, ordenes_recientes } = dashboardData;

    // Preparar datos para gráficos
    const ingresosMensualesData = graficos?.ingresos_mensuales?.map(item => ({
      label: new Date(item.mes + '-01').toLocaleDateString('es-ES', { month: 'short' }),
      value: Math.round(item.total)
    })) || [];

    const ordenesPorEstadoData = graficos?.ordenes_por_estado 
      ? Object.entries(graficos.ordenes_por_estado).map(([key, value]) => ({
          label: getEstadoLabel(key),
          value: value
        }))
      : [];

    const serviciosData = graficos?.servicios_mas_usados?.map(item => ({
      label: item.nombre_corto || item.nombre || 'Sin nombre',
      labelCompleto: item.nombre || 'Sin nombre', // Para tooltip
      value: item.veces_usado || 0
    })) || [];

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Administrativo</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/ordenes')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaFileInvoice /> Ver Órdenes
            </button>
            <button
              onClick={() => navigate('/admin/clientes')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaUsers /> Ver Clientes
            </button>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Clientes</p>
                <p className="text-3xl font-bold mt-2">{estadisticas?.total_clientes || 0}</p>
              </div>
              <FaUsers className="text-4xl opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Empleados</p>
                <p className="text-3xl font-bold mt-2">{estadisticas?.total_empleados || 0}</p>
              </div>
              <FaUserTie className="text-4xl opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
    <div>
                <p className="text-purple-100 text-sm font-medium">Total Órdenes</p>
                <p className="text-3xl font-bold mt-2">{estadisticas?.total_ordenes || 0}</p>
              </div>
              <FaClipboardList className="text-4xl opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Ingresos Totales</p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(estadisticas?.ingresos_totales || 0)}
                </p>
                <p className="text-yellow-100 text-xs mt-1">
                  Este mes: {formatCurrency(estadisticas?.ingresos_mes_actual || 0)}
                </p>
              </div>
              <FaDollarSign className="text-4xl opacity-80" />
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/ordenes')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group"
            >
              <FaFileInvoice className="text-blue-600 text-2xl mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-800">Órdenes</p>
              <p className="text-sm text-gray-600">Gestionar órdenes</p>
            </button>
            <button
              onClick={() => navigate('/admin/clientes')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left group"
            >
              <FaUsers className="text-green-600 text-2xl mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-800">Clientes</p>
              <p className="text-sm text-gray-600">Ver clientes</p>
            </button>
            <button
              onClick={() => navigate('/admin/empleados')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left group"
            >
              <FaUserTie className="text-purple-600 text-2xl mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-800">Empleados</p>
              <p className="text-sm text-gray-600">Gestionar empleados</p>
            </button>
            <button
              onClick={() => navigate('/admin/clientes/citas')}
              className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-left group"
            >
              <FaCalendarAlt className="text-yellow-600 text-2xl mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-semibold text-gray-800">Citas</p>
              <p className="text-sm text-gray-600">{estadisticas?.citas_pendientes || 0} pendientes</p>
            </button>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <LineChart 
              data={ingresosMensualesData} 
              title="Ingresos Mensuales (Últimos 6 meses)"
              color="#10b981"
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <PieChart 
              data={ordenesPorEstadoData} 
              title="Órdenes por Estado"
            />
          </div>
        </div>

        {serviciosData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <BarChart 
              data={serviciosData} 
              title="Servicios Más Utilizados"
              color="#3b82f6"
            />
          </div>
        )}

        {/* Tabla de últimas órdenes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaClipboardList className="text-blue-600" />
              Últimas Órdenes
            </h2>
            <button
              onClick={() => navigate('/ordenes')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
            >
              Ver todas <FaArrowRight />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ordenes_recientes && ordenes_recientes.length > 0 ? (
                  ordenes_recientes.map((orden) => (
                    <tr key={orden.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/ordenes/${orden.id}`)}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{orden.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {orden.cliente}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeClass(orden.estado)}`}>
                          {getEstadoLabel(orden.estado)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(orden.total)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {orden.fecha ? new Date(orden.fecha).toLocaleDateString('es-ES') : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      No hay órdenes recientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard para Empleado
  if (userRole === 'empleado') {
    const { estadisticas, citas_hoy, proximas_citas, ordenes_recientes } = dashboardData;

    // Formatear fecha/hora correctamente
    const formatearFechaHora = (fechaHoraISO) => {
      if (!fechaHoraISO) return 'Fecha no disponible';
      try {
        const fecha = new Date(fechaHoraISO);
        return fecha.toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (e) {
        return 'Fecha no disponible';
      }
    };

    const formatearHora = (fechaHoraISO) => {
      if (!fechaHoraISO) return 'Hora no disponible';
      try {
        const fecha = new Date(fechaHoraISO);
        return fecha.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (e) {
        return 'Hora no disponible';
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Mi Dashboard</h1>
        </div>

        {/* Tarjetas de estadísticas simplificadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/admin/clientes/citas')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Citas Hoy</p>
                <p className="text-3xl font-bold mt-2">{estadisticas?.citas_hoy || 0}</p>
                {citas_hoy && citas_hoy.length > 0 && (
                  <p className="text-blue-100 text-xs mt-1">{citas_hoy.length} programadas</p>
                )}
              </div>
              <FaCalendarAlt className="text-4xl opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/ordenes')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Órdenes</p>
                <p className="text-3xl font-bold mt-2">{estadisticas?.total_ordenes || 0}</p>
                <p className="text-green-100 text-xs mt-1">Total del taller</p>
              </div>
              <FaFileInvoice className="text-4xl opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate('/ordenes')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Citas Esta Semana</p>
                <p className="text-3xl font-bold mt-2">{estadisticas?.citas_semana || 0}</p>
                <p className="text-purple-100 text-xs mt-1">Programadas</p>
              </div>
              <FaCalendarAlt className="text-4xl opacity-80" />
            </div>
          </div>
        </div>

        {/* Accesos rápidos - Solo 2 botones */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/ordenes')}
              className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group border-2 border-blue-200"
            >
              <FaFileInvoice className="text-blue-600 text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-gray-800 text-lg">Órdenes</p>
              <p className="text-sm text-gray-600 mt-1">Ver y gestionar todas las órdenes</p>
            </button>
            <button
              onClick={() => navigate('/admin/clientes/citas')}
              className="p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left group border-2 border-green-200"
            >
              <FaCalendarAlt className="text-green-600 text-3xl mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-bold text-gray-800 text-lg">Mis Citas</p>
              <p className="text-sm text-gray-600 mt-1">Ver y gestionar mis citas</p>
            </button>
          </div>
        </div>

        {/* Citas de hoy y Próximas citas en una sola sección */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Citas de Hoy */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" />
                Citas de Hoy
              </h2>
              {citas_hoy && citas_hoy.length > 0 && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                  {citas_hoy.length}
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {citas_hoy && citas_hoy.length > 0 ? (
                citas_hoy.map((cita) => (
                  <div
                    key={cita.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/clientes/citas')}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{cita.cliente}</p>
                        <p className="text-sm text-gray-600 mt-1">{cita.tipo}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatearHora(cita.fecha_hora)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeClass(cita.estado)}`}>
                        {getEstadoLabel(cita.estado)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No hay citas programadas para hoy</p>
              )}
            </div>
          </div>

          {/* Próximas Citas */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                Próximas Citas
              </h2>
              <button
                onClick={() => navigate('/admin/clientes/citas')}
                className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm font-medium"
              >
                Ver todas <FaArrowRight />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {proximas_citas && proximas_citas.length > 0 ? (
                proximas_citas.map((cita) => (
                  <div
                    key={cita.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/admin/clientes/citas')}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{cita.cliente}</p>
                        <p className="text-sm text-gray-600 mt-1">{cita.tipo}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatearFechaHora(cita.fecha_hora)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeClass(cita.estado)}`}>
                        {getEstadoLabel(cita.estado)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No hay citas próximas</p>
              )}
            </div>
          </div>
        </div>

        {/* Órdenes - Tabla completa */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaClipboardList className="text-blue-600" />
              Órdenes
            </h2>
            <button
              onClick={() => navigate('/ordenes')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <FaFileInvoice /> Ver todas
            </button>
          </div>
          {ordenes_recientes && ordenes_recientes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordenes_recientes.map((orden) => (
                    <tr 
                      key={orden.id} 
                      className="hover:bg-gray-50 cursor-pointer" 
                      onClick={() => navigate(`/ordenes/${orden.id}`)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{orden.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                        {orden.cliente}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeClass(orden.estado)}`}>
                          {getEstadoLabel(orden.estado)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {orden.fecha ? new Date(orden.fecha).toLocaleDateString('es-ES') : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FaClipboardList className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No hay órdenes asignadas</p>
              <p className="text-gray-400 text-sm mb-4">Las órdenes que te asignen aparecerán aquí</p>
              <button
                onClick={() => navigate('/ordenes')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <FaFileInvoice /> Ver todas las órdenes
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <p className="text-yellow-800">Rol no reconocido. Por favor, contacte al administrador.</p>
    </div>
  );
};

export default Dashboard;
