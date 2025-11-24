import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchHistorialServicios } from "../../api/ordenesApi";
import { FaHistory, FaSearch, FaFilter, FaTimes, FaCheckCircle, FaClock } from "react-icons/fa";

const HistorialServiciosPage = () => {
  const navigate = useNavigate();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    estadoPago: ""
  });
  const [showFiltros, setShowFiltros] = useState(false);

  useEffect(() => {
    loadHistorial();
  }, []);

  const loadHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [HistorialServiciosPage] Cargando historial de servicios...');
      const fechaDesde = filtros.fechaDesde || null;
      const fechaHasta = filtros.fechaHasta || null;
      const data = await fetchHistorialServicios(fechaDesde, fechaHasta);
      console.log('✅ [HistorialServiciosPage] Historial cargado:', data);
      setServicios(data);
    } catch (error) {
      console.error("❌ [HistorialServiciosPage] Error al cargar historial:", error);
      setError(error.message || "Error al cargar el historial de servicios. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const handleAplicarFiltros = () => {
    loadHistorial();
    setShowFiltros(false);
  };

  const handleLimpiarFiltros = () => {
    setFiltros({ fechaDesde: "", fechaHasta: "", estadoPago: "" });
    setSearchTerm("");
    loadHistorial();
  };

  const handleVerDetalle = (servicio) => {
    navigate(`/cliente/ordenes/${servicio.id}`);
  };

  // Filtrado de servicios (búsqueda y estado de pago)
  const filtered = servicios.filter((servicio) => {
    // Búsqueda por texto
    const matchesSearch = 
      servicio.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.marcaModelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.vehiculo_placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      servicio.falloRequerimiento?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de estado de pago
    const matchesEstadoPago = !filtros.estadoPago || 
      (filtros.estadoPago === "pagado" && (servicio.pago === true || servicio.pago === "true" || servicio.pago === "True")) ||
      (filtros.estadoPago === "pendiente" && (servicio.pago === false || servicio.pago === "false" || servicio.pago === "False" || !servicio.pago));

    return matchesSearch && matchesEstadoPago;
  });

  const getEstadoBadge = (estado) => {
    const estados = {
      finalizada: { bg: '#d1fae5', text: '#065f46', border: '#10b981', label: 'Finalizada' },
      entregada: { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1', label: 'Entregada' }
    };
    
    const estadoStyle = estados[estado] || { bg: '#f3f4f6', text: '#374151', border: '#9ca3af', label: estado || 'Desconocido' };
    
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.35rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: estadoStyle.bg,
        color: estadoStyle.text,
        border: `1px solid ${estadoStyle.border}`
      }}>
        {estadoStyle.label}
      </span>
    );
  };

  const getPagoBadge = (pago) => {
    const isPagado = pago === true || pago === "true" || pago === "True";
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.35rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: isPagado ? '#d1fae5' : '#fee2e2',
        color: isPagado ? '#065f46' : '#991b1b',
        border: `1px solid ${isPagado ? '#10b981' : '#ef4444'}`
      }}>
        {isPagado ? '✓ Pagado' : '✗ Pendiente'}
      </span>
    );
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    try {
      const fecha = new Date(fechaString);
      return fecha.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return fechaString;
    }
  };

  const formatMonto = (monto) => {
    if (!monto) return 'Bs. 0.00';
    // Si viene como string "Bs123" o similar, extraer el número
    const numero = typeof monto === 'string' 
      ? parseFloat(monto.replace(/[^0-9.-]/g, '')) 
      : parseFloat(monto);
    return isNaN(numero) ? 'Bs. 0.00' : `Bs. ${numero.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Cargando historial de servicios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.errorTitle}>Error al cargar historial</h3>
          <p style={styles.errorMessage}>{error}</p>
          <button
            onClick={loadHistorial}
            style={styles.retryButton}
          >
            Intentar de nuevo
          </button>
          <button
            onClick={() => navigate('/cliente/inicio')}
            style={styles.backButton}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.headerCard}>
          <div style={styles.headerContent}>
            <div>
              <h1 style={styles.title}>Historial de Servicios Realizados</h1>
              <p style={styles.subtitle}>Servicios completados y entregados</p>
            </div>
            <button
              onClick={() => navigate('/cliente/inicio')}
              style={styles.backButton}
            >
              ← Volver
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div style={styles.searchContainer}>
            <FaSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por número de orden, vehículo, placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              style={styles.filterButton}
            >
              <FaFilter /> {showFiltros ? 'Ocultar' : 'Filtros'}
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFiltros && (
          <div style={styles.filtrosCard}>
            <div style={styles.filtrosHeader}>
              <h3 style={styles.filtrosTitle}>Filtros</h3>
              <button
                onClick={() => setShowFiltros(false)}
                style={styles.closeButton}
              >
                <FaTimes />
              </button>
            </div>
            <div style={styles.filtrosGrid}>
              <div>
                <label style={styles.label}>Desde:</label>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => handleFiltroChange("fechaDesde", e.target.value)}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Hasta:</label>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => handleFiltroChange("fechaHasta", e.target.value)}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Estado del pago:</label>
                <select
                  value={filtros.estadoPago}
                  onChange={(e) => handleFiltroChange("estadoPago", e.target.value)}
                  style={styles.select}
                >
                  <option value="">Todos</option>
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
            </div>
            <div style={styles.filtrosActions}>
              <button
                onClick={handleAplicarFiltros}
                style={styles.applyButton}
              >
                Aplicar filtros
              </button>
              <button
                onClick={handleLimpiarFiltros}
                style={styles.clearButton}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Contador de resultados */}
        <div style={styles.counter}>
          <p style={styles.counterText}>
            Mostrando <strong>{filtered.length}</strong> de <strong>{servicios.length}</strong> servicios realizados
          </p>
        </div>

        {/* Lista de servicios */}
        {filtered.length === 0 ? (
          <div style={styles.emptyCard}>
            <FaHistory style={styles.emptyIcon} />
            <h3 style={styles.emptyTitle}>No hay servicios realizados</h3>
            <p style={styles.emptyText}>
              {searchTerm || Object.values(filtros).some(v => v) 
                ? "No se encontraron servicios con los criterios especificados"
                : "Aún no tienes servicios completados"}
            </p>
          </div>
        ) : (
          <div style={styles.servicesList}>
            {filtered.map((servicio) => (
              <div key={servicio.id} style={styles.serviceCard}>
                <div style={styles.serviceContent}>
                  <div style={styles.serviceHeader}>
                    <h3 style={styles.serviceTitle}>{servicio.numero}</h3>
                    <div style={styles.badgesContainer}>
                      {getEstadoBadge(servicio.estado)}
                      {getPagoBadge(servicio.pago)}
                    </div>
                  </div>
                  
                  <div style={styles.serviceDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Fecha de entrega:</span>
                      <span style={styles.detailValue}>
                        {formatFecha(servicio.fechaEntrega || servicio.fechaFinalizacion || servicio.fechaCreacion)}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Vehículo:</span>
                      <span style={styles.detailValue}>
                        {servicio.marcaModelo || 'N/A'}
                        {servicio.vehiculo_placa && ` (${servicio.vehiculo_placa})`}
                      </span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Total:</span>
                      <span style={styles.detailValueTotal}>{formatMonto(servicio.total)}</span>
                    </div>
                  </div>

                  {servicio.falloRequerimiento && (
                    <div style={styles.descriptionSection}>
                      <span style={styles.descriptionLabel}>Descripción del servicio:</span>
                      <p style={styles.descriptionText}>{servicio.falloRequerimiento}</p>
                    </div>
                  )}
                </div>

                <div style={styles.serviceAction}>
                  <button
                    onClick={() => handleVerDetalle(servicio)}
                    style={styles.detailButton}
                  >
                    Ver detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  maxWidth: {
    maxWidth: '1200px',
    margin: '0 auto'
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
  headerCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 0.5rem 0'
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    margin: 0
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    gap: '0.5rem'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    fontSize: '1.1rem'
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem 1rem 0.75rem 2.75rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s'
  },
  filterButton: {
    padding: '0.75rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  filtrosCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  filtrosHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  filtrosTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: 0
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.2rem',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.25rem'
  },
  filtrosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.9rem',
    outline: 'none'
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '0.9rem',
    outline: 'none',
    backgroundColor: 'white'
  },
  filtrosActions: {
    display: 'flex',
    gap: '0.5rem'
  },
  applyButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  clearButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  counter: {
    marginBottom: '1rem'
  },
  counterText: {
    color: '#6b7280',
    fontSize: '0.9rem',
    margin: 0
  },
  servicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1.5rem'
  },
  serviceContent: {
    flex: 1
  },
  serviceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem'
  },
  serviceTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0
  },
  badgesContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  serviceDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  detailLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500'
  },
  detailValue: {
    fontSize: '0.95rem',
    color: '#1a1a1a',
    fontWeight: '600'
  },
  detailValueTotal: {
    fontSize: '1.1rem',
    color: '#10b981',
    fontWeight: '700'
  },
  descriptionSection: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb'
  },
  descriptionLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
    display: 'block',
    marginBottom: '0.5rem'
  },
  descriptionText: {
    fontSize: '0.9rem',
    color: '#374151',
    margin: 0,
    lineHeight: '1.5'
  },
  serviceAction: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  detailButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '3rem',
    color: '#d1d5db',
    marginBottom: '1rem'
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  emptyText: {
    fontSize: '0.95rem',
    color: '#6b7280',
    margin: 0
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '3rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto'
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  errorMessage: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
    margin: '0 0 1.5rem 0'
  },
  retryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginRight: '0.5rem'
  }
};

export default HistorialServiciosPage;

