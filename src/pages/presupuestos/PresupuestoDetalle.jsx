// src/pages/presupuestos/PresupuestoDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { 
  fetchPresupuestoById, 
  deletePresupuesto 
} from "../../api/presupuestosApi";
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaFileInvoiceDollar, 
  FaCar, 
  FaUser, 
  FaCalendar,
  FaDollarSign,
  FaCheck,
  FaTimes,
  FaPrint,
  FaDownload
} from 'react-icons/fa';

const PresupuestoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [presupuesto, setPresupuesto] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState("detalles");

  useEffect(() => {
    loadPresupuestoData();
  }, [id]);

  const loadPresupuestoData = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carga de presupuesto con ID:', id);
      const presupuestoData = await fetchPresupuestoById(id);
      
      console.log('✅ Datos del presupuesto recibidos:', presupuestoData);
      console.log('✅ Detalles del presupuesto:', presupuestoData.detalles);
      console.log('✅ Vehículo:', presupuestoData.vehiculo);
      console.log('✅ Cliente:', presupuestoData.cliente_nombre);
      
      setPresupuesto(presupuestoData);
      // Los detalles vienen anidados en presupuestoData.detalles
      setDetalles(presupuestoData.detalles || []);
      setError('');
      console.log('✅ Estado actualizado correctamente');
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      console.error("❌ Error completo:", error.message);
      setError('Error al cargar los datos del presupuesto');
    } finally {
      setLoading(false);
      console.log('🏁 Carga finalizada, loading=false');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
      try {
        await deletePresupuesto(id);
        navigate('/presupuestos');
      } catch (error) {
        setError('Error al eliminar el presupuesto');
        console.error('Error deleting presupuesto:', error);
      }
    }
  };

  const handleEdit = () => {
    navigate(`/presupuestos/${id}/editar`);
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(`${import.meta.env.VITE_API_URL}presupuestos/${id}/export_pdf/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Error al generar PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presupuesto_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar el PDF');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(`${import.meta.env.VITE_API_URL}presupuestos/${id}/export_excel/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Error al generar Excel');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `presupuesto_${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Error al descargar el Excel');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Bs. 0,00';
    return `Bs. ${parseFloat(amount).toLocaleString('es-BO', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (estado) => {
    const statusConfig = {
      'pendiente': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
        icon: <FaCalendar className="mr-1" />,
        label: 'Pendiente' 
      },
      'aprobado': { 
        color: 'bg-green-100 text-green-800 border-green-300', 
        icon: <FaCheck className="mr-1" />,
        label: 'Aprobado' 
      },
      'rechazado': { 
        color: 'bg-red-100 text-red-800 border-red-300', 
        icon: <FaTimes className="mr-1" />,
        label: 'Rechazado' 
      },
      'cancelado': { 
        color: 'bg-gray-100 text-gray-800 border-gray-300', 
        icon: <FaTimes className="mr-1" />,
        label: 'Cancelado' 
      },
    };

    const config = statusConfig[estado?.toLowerCase()] || statusConfig['pendiente'];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    console.log('⏳ Renderizando estado de carga...');
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Cargando presupuesto...</span>
        </div>
      </div>
    );
  }

  if (!presupuesto) {
    console.log('⚠️ No hay presupuesto para mostrar');
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-lg text-gray-600 mb-4">Presupuesto no encontrado</div>
          <button
            onClick={() => navigate("/presupuestos")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  console.log('✨ Renderizando presupuesto completo:', presupuesto.id);

  return (
    <>
      <Helmet>
        <title>{`Presupuesto #${presupuesto.id} - Sistema de Taller`}</title>
      </Helmet>
      
      <div className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/presupuestos')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Presupuesto #{presupuesto.id}
                </h1>
                <p className="text-gray-600 mt-1">
                  {presupuesto.fecha_inicio && `Fecha inicio: ${formatDate(presupuesto.fecha_inicio)}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {getStatusBadge(presupuesto.estado)}
              
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaEdit />
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaTrash />
                  Eliminar
                </button>
                <button 
                  onClick={handlePrint}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaPrint />
                  Imprimir
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaDownload />
                  PDF
                </button>
                <button 
                  onClick={handleDownloadExcel}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <FaDownload />
                  Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Información principal en cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Cliente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaUser className="text-blue-600 mr-3 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">Cliente</h2>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Nombre:</span>
                <p className="font-medium">{presupuesto.cliente_nombre || 'Sin cliente'}</p>
              </div>
            </div>
          </div>

          {/* Vehículo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaCar className="text-green-600 mr-3 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">Vehículo</h2>
            </div>
            {presupuesto.vehiculo ? (
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Placa:</span>
                  <p className="font-medium">{presupuesto.vehiculo.placa}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Marca:</span>
                  <p className="font-medium">{presupuesto.vehiculo.marca}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Modelo:</span>
                  <p className="font-medium">{presupuesto.vehiculo.modelo}</p>
                </div>
                {presupuesto.vehiculo.año && (
                  <div>
                    <span className="text-sm text-gray-600">Año:</span>
                    <p className="font-medium">{presupuesto.vehiculo.año}</p>
                  </div>
                )}
                {presupuesto.vehiculo.color && (
                  <div>
                    <span className="text-sm text-gray-600">Color:</span>
                    <p className="font-medium">{presupuesto.vehiculo.color}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No se ha asignado un vehículo</p>
            )}
          </div>

          {/* Resumen financiero */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaDollarSign className="text-green-600 mr-3 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">Resumen</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(presupuesto.subtotal)}</span>
              </div>
              
              {presupuesto.total_descuentos > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Descuentos:</span>
                  <span className="font-medium">-{formatCurrency(presupuesto.total_descuentos)}</span>
                </div>
              )}
              
              {presupuesto.con_impuestos && presupuesto.monto_impuesto > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>IVA ({presupuesto.impuestos}%):</span>
                  <span className="font-medium">{formatCurrency(presupuesto.monto_impuesto)}</span>
                </div>
              )}
              
              <hr />
              
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total:</span>
                <span>{formatCurrency(presupuesto.total)}</span>
              </div>
              
              {presupuesto.fecha_fin && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-800">
                    <FaCalendar className="mr-2" />
                    <span className="text-sm">
                      Fecha fin: {formatDate(presupuesto.fecha_fin)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs de contenido */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'detalles', label: 'Detalles', icon: <FaFileInvoiceDollar /> },
                { id: 'observaciones', label: 'Diagnóstico', icon: <FaEdit /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'detalles' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles del Presupuesto</h3>
                
                {detalles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cantidad
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio Unit.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descuento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {detalles.map((detalle) => {
                          const cantidad = parseFloat(detalle.cantidad) || 0;
                          const precioUnitario = parseFloat(detalle.precio_unitario) || 0;
                          const descuentoPorcentaje = parseFloat(detalle.descuento_porcentaje) || 0;
                          const subtotalSinDescuento = cantidad * precioUnitario;
                          const descuentoMonto = subtotalSinDescuento * (descuentoPorcentaje / 100);
                          const subtotalConDescuento = subtotalSinDescuento - descuentoMonto;

                          return (
                            <tr key={detalle.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {detalle.item?.nombre || 'Item no especificado'}
                                  </div>
                                  {detalle.item?.descripcion && (
                                    <div className="text-sm text-gray-500">
                                      {detalle.item.descripcion}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {cantidad.toLocaleString('es-BO')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(precioUnitario)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {descuentoPorcentaje}%
                                </div>
                                {descuentoMonto > 0 && (
                                  <div className="text-xs text-red-600">
                                    -{formatCurrency(descuentoMonto)}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {formatCurrency(subtotalConDescuento)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay detalles registrados para este presupuesto</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'observaciones' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Diagnóstico</h3>
                {presupuesto.diagnostico ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{presupuesto.diagnostico}</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay diagnóstico registrado para este presupuesto</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PresupuestoDetalle;