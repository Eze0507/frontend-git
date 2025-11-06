import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllOrdenes } from "../../api/ordenesApi";
import BotonPagarOrden from "../../components/pagos/BotonPagarOrden.jsx";

const MisOrdenesPage = () => {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({
    fechaDesde: "",
    fechaHasta: "",
    estadoOrden: "",
    estadoPago: ""
  });

  useEffect(() => {
    loadOrdenes();
  }, []);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [MisOrdenesPage] Cargando órdenes del cliente...');
      const data = await fetchAllOrdenes();
      console.log('✅ [MisOrdenesPage] Órdenes cargadas:', data);
      setOrdenes(data);
    } catch (error) {
      console.error("❌ [MisOrdenesPage] Error al cargar órdenes:", error);
      setError(error.message || "Error al cargar las órdenes. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
  };

  const handleVerDetalle = (orden) => {
    navigate(`/mis-ordenes/${orden.id}`);
  };

  // Filtrado de órdenes
  const filtered = ordenes.filter((orden) => {
    // Búsqueda por texto
    const matchesSearch = 
      orden.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.marcaModelo?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro de fecha desde
    const matchesFechaDesde = !filtros.fechaDesde || orden.fecha >= filtros.fechaDesde;

    // Filtro de fecha hasta
    const matchesFechaHasta = !filtros.fechaHasta || orden.fecha <= filtros.fechaHasta;

    // Filtro de estado de orden
    const matchesEstadoOrden = !filtros.estadoOrden || orden.estado === filtros.estadoOrden;

    // Filtro de estado de pago
    const matchesEstadoPago = !filtros.estadoPago || 
      (filtros.estadoPago === "pagado" && (orden.pago === true || orden.pago === "true" || orden.pago === "True")) ||
      (filtros.estadoPago === "pendiente" && (orden.pago === false || orden.pago === "false" || orden.pago === "False" || !orden.pago));

    return matchesSearch && matchesFechaDesde && matchesFechaHasta && matchesEstadoOrden && matchesEstadoPago;
  });

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      en_proceso: 'bg-blue-100 text-blue-800 border-blue-200',
      finalizada: 'bg-green-100 text-green-800 border-green-200',
      entregada: 'bg-purple-100 text-purple-800 border-purple-200',
      cancelada: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const label = estado === 'en_proceso' ? 'En Proceso' : 
                  estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : '';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${estados[estado] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {label}
      </span>
    );
  };

  const getPagoBadge = (pago) => {
    return (pago === true || pago === "true" || pago === "True") ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        ✓ Pagado
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
        ✗ Pendiente
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando mis órdenes...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes de Trabajo</h1>
              <button
                onClick={() => navigate('/home')}
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
            <h3 className="mt-4 text-lg font-medium text-red-900">Error al cargar órdenes</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={loadOrdenes}
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
              <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes de Trabajo</h1>
              <p className="text-gray-600 mt-1">Historial completo de tus órdenes</p>
            </div>
            <button
              onClick={() => navigate('/admin/home')}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Volver
            </button>
          </div>

          {/* Barra de búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por número de orden, vehículo..."
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

            {/* Estado de orden */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado de la orden:</label>
              <select
                value={filtros.estadoOrden}
                onChange={(e) => handleFiltroChange("estadoOrden", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="finalizada">Finalizada</option>
                <option value="entregada">Entregada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Estado de pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado del pago:</label>
              <select
                value={filtros.estadoPago}
                onChange={(e) => handleFiltroChange("estadoPago", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
          </div>

          {/* Botón limpiar filtros */}
          <div className="mt-4">
            <button
              onClick={() => setFiltros({ fechaDesde: "", fechaHasta: "", estadoOrden: "", estadoPago: "" })}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mb-4">
          <p className="text-gray-600">
            Mostrando <span className="font-semibold">{filtered.length}</span> de <span className="font-semibold">{ordenes.length}</span> órdenes
          </p>
        </div>

        {/* Lista de órdenes */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay órdenes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || Object.values(filtros).some(v => v) 
                ? "No se encontraron órdenes con los criterios especificados"
                : "Aún no tienes órdenes de trabajo registradas"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((orden) => (
              <div key={orden.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{orden.numero}</h3>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Estado de la orden:</span>
                          {getEstadoBadge(orden.estado)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Estado del pago:</span>
                          {getPagoBadge(orden.pago)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Fecha:</span>
                        <span className="ml-2 font-medium text-gray-900">{orden.fecha}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Vehículo:</span>
                        <span className="ml-2 font-medium text-gray-900">{orden.marcaModelo}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-2 font-bold text-green-600">{orden.total || "Bs. 0.00"}</span>
                      </div>
                    </div>

                    {orden.descripcion && (
                      <div className="mt-3">
                        <span className="text-gray-500 text-sm">Descripción:</span>
                        <p className="text-gray-700 text-sm mt-1">{orden.descripcion}</p>
                      </div>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <div className="mt-4 lg:mt-0 lg:ml-6">
                    <div className="flex flex-col lg:flex-row gap-2">
                      <button
                        onClick={() => handleVerDetalle(orden)}
                        className="w-full lg:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Ver detalle
                      </button>
                      
                      {/* Botón de pagar - Solo si NO está pagada y está finalizada o entregada */}
                      {!orden.pago && (orden.estado === 'finalizada' || orden.estado === 'entregada') && (
                        <BotonPagarOrden 
                          ordenId={orden.id} 
                          montoTotal={orden.monto_total}
                          disabled={orden.estado === 'cancelada'}
                          compact={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisOrdenesPage;
