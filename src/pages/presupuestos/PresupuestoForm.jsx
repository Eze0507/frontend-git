// src/pages/presupuestos/PresupuestoForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  createPresupuesto, 
  updatePresupuesto, 
  fetchPresupuestoById,
  fetchItemsForPresupuesto,
  fetchVehiculosForPresupuesto,
  fetchClientesForPresupuesto
} from '../../api/presupuestosApi';
import { fetchAllClientes } from '../../api/clientesApi';
import { FaPlus, FaTrash, FaSave, FaArrowLeft, FaCalculator } from 'react-icons/fa';

const PresupuestoForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  // Estados principales
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Estados para datos auxiliares
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [items, setItems] = useState([]);

  // Estado del formulario
  const [formData, setFormData] = useState({
    diagnostico: '',
    cliente: '',
    vehiculo: '',
    estado: 'pendiente',
    con_impuestos: false,
    impuestos: '13.00',
    observaciones: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  // Estado de los detalles
  const [detalles, setDetalles] = useState([
    {
      item: '',
      cantidad: '1.00',
      precio_unitario: '0.00',
      descuento_porcentaje: '0.00'
    }
  ]);

  // Estados calculados
  const [totales, setTotales] = useState({
    subtotal: 0,
    total_descuentos: 0,
    monto_impuesto: 0,
    total_final: 0
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      loadPresupuesto();
    }
  }, [id, isEditing]);

  useEffect(() => {
    calculateTotals();
  }, [detalles, formData.con_impuestos, formData.impuestos]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [clientesData, vehiculosData, itemsData] = await Promise.all([
        fetchClientesForPresupuesto(),
        fetchVehiculosForPresupuesto(),
        fetchItemsForPresupuesto()
      ]);

      console.log('Clientes cargados:', clientesData);
      console.log('Vehículos cargados:', vehiculosData);
      console.log('Items cargados:', itemsData);

      setClientes(clientesData);
      setVehiculos(vehiculosData);
      setItems(itemsData);
    } catch (error) {
      setError('Error al cargar los datos iniciales');
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPresupuesto = async () => {
    try {
      const data = await fetchPresupuestoById(id);
      setFormData({
        diagnostico: data.diagnostico || '',
        cliente: data.cliente || '',
        vehiculo: data.vehiculo?.id || '',
        estado: data.estado || 'pendiente',
        con_impuestos: data.con_impuestos || false,
        impuestos: data.impuestos || '13.00',
        observaciones: data.observaciones || '',
        fecha_inicio: data.fecha_inicio || '',
        fecha_fin: data.fecha_fin || ''
      });

      if (data.detalles && data.detalles.length > 0) {
        setDetalles(data.detalles.map(detalle => ({
          id: detalle.id,
          item: detalle.item?.id || detalle.item || '',
          cantidad: detalle.cantidad || '1.00',
          precio_unitario: detalle.precio_unitario || '0.00',
          descuento_porcentaje: detalle.descuento_porcentaje || '0.00'
        })));
      }
    } catch (error) {
      setError('Error al cargar el presupuesto');
      console.error('Error loading presupuesto:', error);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDescuentos = 0;

    detalles.forEach(detalle => {
      const cantidad = parseFloat(detalle.cantidad) || 0;
      const precio = parseFloat(detalle.precio_unitario) || 0;
      const descuentoPorcentaje = parseFloat(detalle.descuento_porcentaje) || 0;
      
      const subtotalDetalle = cantidad * precio;
      const descuentoDetalle = subtotalDetalle * (descuentoPorcentaje / 100);
      
      subtotal += subtotalDetalle;
      totalDescuentos += descuentoDetalle;
    });

    const subtotalConDescuentos = subtotal - totalDescuentos;
    
    // Calcular impuestos sobre el subtotal menos descuentos
    const montoImpuesto = formData.con_impuestos 
      ? subtotalConDescuentos * (parseFloat(formData.impuestos) / 100)
      : 0;

    const totalFinal = subtotalConDescuentos + montoImpuesto;

    setTotales({
      subtotal: subtotal,
      total_descuentos: totalDescuentos,
      monto_impuesto: montoImpuesto,
      total_final: totalFinal
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDetalleChange = (index, field, value) => {
    setDetalles(prev => prev.map((detalle, i) => 
      i === index ? { ...detalle, [field]: value } : detalle
    ));
  };

  const addDetalle = () => {
    setDetalles(prev => [...prev, {
      item: '',
      cantidad: '1.00',
      precio_unitario: '0.00',
      descuento_porcentaje: '0.00'
    }]);
  };

  const removeDetalle = (index) => {
    if (detalles.length > 1) {
      setDetalles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    
    // Guardar el ID en formData para que el select funcione correctamente
    setFormData(prev => ({
      ...prev,
      cliente: clienteId
    }));
  };

  const handleItemChange = (index, itemId) => {
    const item = items.find(i => i.id.toString() === itemId);
    
    if (item) {
      handleDetalleChange(index, 'item', itemId);
      handleDetalleChange(index, 'precio_unitario', item.precio || '0.00');
    } else {
      handleDetalleChange(index, 'item', itemId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (detalles.some(d => !d.item || !d.cantidad || !d.precio_unitario)) {
      setError('Todos los detalles deben tener item, cantidad y precio');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const presupuestoData = {
        ...formData,
        vehiculo: formData.vehiculo || null,
        con_impuestos: formData.con_impuestos,
      };

      console.log('Datos del presupuesto a enviar:', presupuestoData);

      // Enviar detalles anidados junto al presupuesto para que el serializer los cree/actualice
      const payload = {
        diagnostico: presupuestoData.diagnostico,
        fecha_inicio: presupuestoData.fecha_inicio || null,
        fecha_fin: presupuestoData.fecha_fin || null,
        estado: presupuestoData.estado || 'pendiente',
        con_impuestos: presupuestoData.con_impuestos || false,
        impuestos: presupuestoData.impuestos || '0.00',
        vehiculo_id: presupuestoData.vehiculo || null,
        cliente: presupuestoData.cliente || null, // Enviar el ID del cliente
        detalles: detalles.map(d => ({
          id: d.id || undefined,
          item_id: d.item,
          cantidad: d.cantidad,
          precio_unitario: d.precio_unitario,
          descuento_porcentaje: d.descuento_porcentaje || '0.00'
        }))
      };

      console.log('Payload a enviar al backend:', payload);

      let presupuesto;
      if (isEditing) {
        presupuesto = await updatePresupuesto(id, payload);
      } else {
        presupuesto = await createPresupuesto(payload);
      }

      navigate('/presupuestos');
    } catch (error) {
      console.error('Error completo:', error);
      setError('Error al guardar el presupuesto: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Bs. ${parseFloat(amount || 0).toLocaleString('es-BO', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/presupuestos')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-3xl font-bold text-gray-800">
              {isEditing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
            </h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del presupuesto */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Información General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnóstico
              </label>
              <textarea
                name="diagnostico"
                value={formData.diagnostico}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Diagnóstico del vehículo o situación"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pendiente">Pendiente</option>
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Cliente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <select
                name="cliente"
                value={formData.cliente}
                onChange={handleClienteChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {`${cliente.nombre} ${cliente.apellido || ''}`.trim()} - {cliente.ci}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehículo (Opcional)
              </label>
              <select
                name="vehiculo"
                value={formData.vehiculo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin vehículo asignado</option>
                {vehiculos.length > 0 ? vehiculos.map(vehiculo => (
                  <option key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.numero_placa || vehiculo.placa || 'S/N'} - {vehiculo.marca?.nombre || vehiculo.marca || ''} {vehiculo.modelo?.nombre || vehiculo.modelo || ''}
                  </option>
                )) : (
                  <option disabled>No hay vehículos disponibles</option>
                )}
              </select>
            </div>


          </div>
        </div>

        {/* Detalles del presupuesto */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Detalles del Presupuesto</h2>
            <button
              type="button"
              onClick={addDetalle}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus className="text-sm" />
              Agregar Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Cantidad</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Precio Unit.</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Desc. (%)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Subtotal</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle, index) => {
                  const cantidad = parseFloat(detalle.cantidad) || 0;
                  const precio = parseFloat(detalle.precio_unitario) || 0;
                  const descuento = parseFloat(detalle.descuento_porcentaje) || 0;
                  const subtotal = cantidad * precio;
                  const descuentoMonto = subtotal * (descuento / 100);
                  const subtotalFinal = subtotal - descuentoMonto;

                  return (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-2">
                        <select
                          value={detalle.item}
                          onChange={(e) => handleItemChange(index, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Seleccionar item</option>
                          {items.map(item => (
                            <option key={item.id} value={item.id}>
                              {item.nombre}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={detalle.cantidad}
                          onChange={(e) => handleDetalleChange(index, 'cantidad', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={detalle.precio_unitario}
                          onChange={(e) => handleDetalleChange(index, 'precio_unitario', e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={detalle.descuento_porcentaje}
                          onChange={(e) => handleDetalleChange(index, 'descuento_porcentaje', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-2 font-medium">
                        {formatCurrency(subtotalFinal)}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => removeDetalle(index)}
                          disabled={detalles.length === 1}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Configuración de impuestos y totales */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Impuestos y Totales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="con_impuestos"
                  name="con_impuestos"
                  checked={formData.con_impuestos}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="con_impuestos" className="text-sm font-medium text-gray-700">
                  Aplicar impuestos
                </label>
              </div>

              {formData.con_impuestos && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje de Impuesto (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    name="impuestos"
                    value={formData.impuestos}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FaCalculator className="mr-2" />
                Resumen de Totales
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(totales.subtotal)}</span>
                </div>
                
                {totales.total_descuentos > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuentos:</span>
                    <span className="font-medium">-{formatCurrency(totales.total_descuentos)}</span>
                  </div>
                )}
                
                {formData.con_impuestos && totales.monto_impuesto > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>IVA ({formData.impuestos}%):</span>
                    <span className="font-medium">{formatCurrency(totales.monto_impuesto)}</span>
                  </div>
                )}
                
                <hr className="my-2" />
                
                <div className="flex justify-between text-lg font-bold text-gray-800">
                  <span>Total Final:</span>
                  <span>{formatCurrency(totales.total_final)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/presupuestos')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <FaSave />
                {isEditing ? 'Actualizar' : 'Crear'} Presupuesto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PresupuestoForm;