import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NuevaCitaPage from "./NuevaCitaPage.jsx";
import { FaEye } from "react-icons/fa";
import { fetchMisCitas, confirmarCitaCliente, cancelarCitaClienteAction } from "../../../api/citasClienteApi";

const MisCitasPage = () => {
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [origenMap, setOrigenMap] = useState(() => {
    try {
      const raw = localStorage.getItem('citasOrigen');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    estado: "",
    tipoCita: ""
  });

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMisCitas();
      // Ordenar por fecha_creacion desc (fallback a fecha_hora_inicio)
      const sorted = [...data].sort((a, b) => {
        const ax = a.fecha_creacion || a.fecha_hora_inicio || '';
        const bx = b.fecha_creacion || b.fecha_hora_inicio || '';
        return new Date(bx) - new Date(ax);
      });
      setCitas(sorted);
      // Actualizar mapa de origen sin tocar modelos: si no existe, inferir
      setOrigenMap((prev) => {
        const updated = { ...prev };
        for (const c of data) {
          if (!(c.id in updated)) {
            // Heurística: si llega pendiente por primera vez, asumimos propuesta por empleado
            updated[c.id] = c.estado === 'pendiente' ? 'empleado' : 'cliente';
          }
        }
        localStorage.setItem('citasOrigen', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      setError(error.message || "Error al cargar las citas. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const [selectedCita, setSelectedCita] = useState(null);
  const [showDetalleModal, setShowDetalleModal] = useState(false);

  const handleVerDetalle = (cita) => {
    setSelectedCita(cita);
    setShowDetalleModal(true);
  };

  const closeDetalleModal = () => {
    setShowDetalleModal(false);
    setSelectedCita(null);
  };

  const [showNuevaCita, setShowNuevaCita] = useState(false);
  const handleNuevaCita = () => {
    // Abrir modal en la misma ruta
    setShowNuevaCita(true);
  };

  const [editCita, setEditCita] = useState(null);
  const [showEditarCita, setShowEditarCita] = useState(false);

  // Filtrado de citas
  const filtered = citas.filter((cita) => {
    // Búsqueda por texto
    const matchesSearch = 
      cita.vehiculo_info?.numero_placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.empleado_info?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de fecha desde
    const fechaInicio = cita.fecha_hora_inicio ? new Date(cita.fecha_hora_inicio).toISOString().split('T')[0] : '';
    const matchesFechaDesde = !filtros.fechaDesde || fechaInicio >= filtros.fechaDesde;

    // Filtro de fecha hasta
    const matchesFechaHasta = !filtros.fechaHasta || fechaInicio <= filtros.fechaHasta;

    // Filtro de estado
    const matchesEstado = !filtros.estado || cita.estado === filtros.estado;

    // Filtro de tipo de cita
    const matchesTipoCita = !filtros.tipoCita || cita.tipo_cita === filtros.tipoCita;

    return matchesSearch && matchesFechaDesde && matchesFechaHasta && matchesEstado && matchesTipoCita;
  });

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmada: 'bg-blue-100 text-blue-800 border-blue-200',
      completada: 'bg-green-100 text-green-800 border-green-200',
      cancelada: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const labels = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      completada: 'Completada',
      cancelada: 'Cancelada'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${estados[estado] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {labels[estado] || estado}
      </span>
    );
  };

  const handleConfirmar = async (cita) => {
    if (!window.confirm(`¿Confirmar la cita #${cita.id}?`)) return;
    try {
      await confirmarCitaCliente(cita.id);
      await loadCitas();
    } catch (e) {
      alert(e.message || 'No se pudo confirmar la cita');
    }
  };

  const handleCancelar = async (cita) => {
    if (!window.confirm(`¿Cancelar la cita #${cita.id}?`)) return;
    try {
      await cancelarCitaClienteAction(cita.id);
      await loadCitas();
    } catch (e) {
      alert(e.message || 'No se pudo cancelar la cita');
    }
  };

  const handleEditar = (cita) => {
    setEditCita(cita);
    setShowEditarCita(true);
  };

  const getTipoCitaBadge = (tipo) => {
    const tipos = {
      reparacion: 'bg-purple-100 text-purple-800 border-purple-200',
      mantenimiento: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      diagnostico: 'bg-pink-100 text-pink-800 border-pink-200',
      entrega: 'bg-teal-100 text-teal-800 border-teal-200'
    };
    
    const labels = {
      reparacion: 'Reparación',
      mantenimiento: 'Mantenimiento',
      diagnostico: 'Diagnóstico',
      entrega: 'Entrega'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tipos[tipo] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {labels[tipo] || tipo}
      </span>
    );
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando mis citas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Mis Citas</h1>
              <button
                onClick={() => navigate('/admin/home')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Volver
              </button>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-red-900">Error al cargar citas</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={loadCitas}
              className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Citas</h1>
              <p className="text-gray-600 mt-1">Historial completo de tus citas agendadas</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNuevaCita}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Nueva Cita
              </button>
              <button
                onClick={() => navigate('/admin/home')}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Volver
              </button>
            </div>
          </div>

      {/* Modal Nueva Cita en la misma ruta */}
      {showNuevaCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <NuevaCitaPage 
            onClose={() => { setShowNuevaCita(false); loadCitas(); }}
          />
        </div>
      )}

      {/* Modal Editar Cita */}
      {showEditarCita && editCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <NuevaCitaPage 
            onClose={() => { setShowEditarCita(false); setEditCita(null); loadCitas(); }}
            mode="edit"
            initialCita={editCita}
          />
        </div>
      )}

          {/* Barra de búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por vehículo, empleado, descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Desde:</label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => handleFiltroChange("fechaDesde", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hasta:</label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => handleFiltroChange("fechaHasta", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado:</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange("estado", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Tipo de cita */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cita:</label>
              <select
                value={filtros.tipoCita}
                onChange={(e) => handleFiltroChange("tipoCita", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="reparacion">Reparación</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="diagnostico">Diagnóstico</option>
                <option value="entrega">Entrega</option>
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <div className="mt-4">
            <button
              onClick={() => setFiltros({ fechaDesde: "", fechaHasta: "", estado: "", tipoCita: "" })}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mb-4">
          <p className="text-gray-600">
            Mostrando <span className="font-semibold">{filtered.length}</span> de <span className="font-semibold">{citas.length}</span> citas
          </p>
        </div>

        {/* Lista de citas */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay citas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || Object.values(filtros).some(v => v) 
                ? "No se encontraron citas con los criterios especificados"
                : "Aún no tienes citas agendadas"}
            </p>
            <button
              onClick={handleNuevaCita}
              className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Agendar Nueva Cita
            </button>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((cita) => {
                const origen = origenMap[cita.id] || (cita.estado === 'pendiente' ? 'empleado' : 'cliente');
                const cardBg = origen === 'empleado' ? 'bg-yellow-50' : 'bg-white';
                return (
                  <div key={cita.id} className={`rounded-lg shadow-sm border border-gray-200 ${cardBg}`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-900">#{cita.id}</div>
                        {getEstadoBadge(cita.estado)}
                      </div>
                      <div className="text-gray-900 text-sm mb-1">{formatDateTime(cita.fecha_hora_inicio)}</div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Empleado: </span>
                        {cita.empleado_info ? `${cita.empleado_info.nombre} ${cita.empleado_info.apellido}` : 'Sin empleado'}
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Vehículo: </span>
                        {cita.vehiculo_info?.numero_placa || 'Sin vehículo'}
                      </div>
                      <div className="mt-2">{getTipoCitaBadge(cita.tipo_cita)}</div>
                    </div>
                    <div className="px-4 pb-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleVerDetalle(cita)}
                        className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg"
                      >
                        <FaEye className="w-4 h-4" /> Detalles
                      </button>
                      {origen === 'empleado' ? (
                        cita.estado === 'pendiente' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleConfirmar(cita)}
                              className="flex-1 min-w-[120px] px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelar(cita)}
                              className="flex-1 min-w-[120px] px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : null
                      ) : (
                        (cita.estado !== 'cancelada' && cita.estado !== 'completada') && (
                          <button
                            type="button"
                            onClick={() => handleEditar(cita)}
                            className="flex-1 min-w-[120px] px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                          >
                            Reprogramar
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Citas
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha y Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((cita) => {
                      const origen = origenMap[cita.id] || (cita.estado === 'pendiente' ? 'empleado' : 'cliente');
                      const rowBg = origen === 'empleado' ? 'bg-yellow-50' : 'bg-white';
                      return (
                        <tr key={cita.id} className={`hover:bg-gray-50 ${rowBg}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{cita.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDateTime(cita.fecha_hora_inicio)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.empleado_info ? `${cita.empleado_info.nombre} ${cita.empleado_info.apellido}` : 'Sin empleado'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cita.vehiculo_info?.numero_placa || 'Sin vehículo'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getTipoCitaBadge(cita.tipo_cita)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getEstadoBadge(cita.estado)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleVerDetalle(cita);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <FaEye className="w-4 h-4" /> Detalles
                            </button>
                            {origen === 'empleado' ? (
                              cita.estado === 'pendiente' ? (
                                <>
                                  <button type="button" onClick={() => handleConfirmar(cita)} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Confirmar</button>
                                  <button type="button" onClick={() => handleCancelar(cita)} className="px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Cancelar</button>
                                </>
                              ) : null
                            ) : (
                              (cita.estado !== 'cancelada' && cita.estado !== 'completada') && (
                                <button type="button" onClick={() => handleEditar(cita)} className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Reprogramar</button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Modal de Detalles de Cita */}
        {showDetalleModal && selectedCita && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del Modal */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles de la Cita #{selectedCita.id}
                </h2>
                <button
                  onClick={closeDetalleModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6 space-y-6">
                {/* Información Principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">📅 Fecha y Hora de Inicio</h3>
                    <p className="text-gray-900 font-medium">{formatDateTime(selectedCita.fecha_hora_inicio)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">🕐 Fecha y Hora de Fin</h3>
                    <p className="text-gray-900 font-medium">
                      {selectedCita.fecha_hora_fin ? formatDateTime(selectedCita.fecha_hora_fin) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Estado y Tipo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">📊 Estado</h3>
                    {getEstadoBadge(selectedCita.estado)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">📝 Tipo de Cita</h3>
                    {getTipoCitaBadge(selectedCita.tipo_cita)}
                  </div>
                </div>

                {/* Empleado y Vehículo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">👤 Empleado Asignado</h3>
                    <p className="text-gray-900">
                      {selectedCita.empleado_info 
                        ? `${selectedCita.empleado_info.nombre} ${selectedCita.empleado_info.apellido}` 
                        : 'Sin empleado asignado'}
                    </p>
                    {selectedCita.empleado_info?.telefono && (
                      <p className="text-sm text-gray-600 mt-1">Tel: {selectedCita.empleado_info.telefono}</p>
                    )}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">🚗 Vehículo</h3>
                    {selectedCita.vehiculo_info ? (
                      <div>
                        <p className="text-gray-900 font-medium">{selectedCita.vehiculo_info.numero_placa}</p>
                        {selectedCita.vehiculo_info.marca && selectedCita.vehiculo_info.modelo && (
                          <p className="text-sm text-gray-600 mt-1">
                            {selectedCita.vehiculo_info.marca} {selectedCita.vehiculo_info.modelo}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">Sin vehículo asignado</p>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                {selectedCita.descripcion && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="text-sm font-semibold text-yellow-900 mb-2">📄 Descripción</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedCita.descripcion}</p>
                  </div>
                )}

                {/* Nota */}
                {selectedCita.nota && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="text-sm font-semibold text-green-900 mb-2">💬 Nota</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedCita.nota}</p>
                  </div>
                )}

                {/* Fechas de creación y actualización */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  {selectedCita.fecha_creacion && (
                    <div>
                      <span className="font-medium">Creada el:</span>{' '}
                      {formatDateTime(selectedCita.fecha_creacion)}
                    </div>
                  )}
                  {selectedCita.fecha_actualizacion && (
                    <div>
                      <span className="font-medium">Actualizada el:</span>{' '}
                      {formatDateTime(selectedCita.fecha_actualizacion)}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer del Modal */}
              <div className="flex justify-end p-6 border-t border-gray-200">
                <button
                  onClick={closeDetalleModal}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MisCitasPage;
