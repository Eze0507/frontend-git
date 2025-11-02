import React, { useEffect, useState } from "react";
import Button from "../../components/button";
import { getAllItems } from "../../api/itemsApi";
import {
  getDetallesByFactura,
  createDetalleFactura,
  updateDetalleFactura,
  deleteDetalleFactura,
  getResumenFactura,
  recalcularFactura,
} from "../../api/facturaProveedorApi.jsx";

const FacturaDetallesModal = ({ factura, onClose, onUpdate }) => {
  const [detalles, setDetalles] = useState([]);
  const [items, setItems] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    item: "",
    cantidad: "1",
    precio: "0.00",
    descuento: "0.00",
    subtotal: "0.00",
    total: "0.00",
  });

  useEffect(() => {
    loadDetalles();
    loadItems();
    loadResumen();
  }, [factura]);

  async function loadDetalles() {
    try {
      const data = await getDetallesByFactura(factura.id);
      setDetalles(data);
    } catch (e) {
      console.error("Error al cargar detalles:", e.message);
    }
  }

  async function loadItems() {
    try {
      const data = await getAllItems();
      setItems(data);
    } catch (e) {
      console.error("Error al cargar items:", e.message);
    }
  }

  async function loadResumen() {
    try {
      const data = await getResumenFactura(factura.id);
      setResumen(data);
    } catch (e) {
      console.error("Error al cargar resumen:", e.message);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Calcular subtotal y total automáticamente
  useEffect(() => {
    const cantidad = parseFloat(form.cantidad) || 0;
    const precio = parseFloat(form.precio) || 0;
    const descuento = parseFloat(form.descuento) || 0;

    const subtotalCalculado = cantidad * precio;
    const totalCalculado = subtotalCalculado - descuento;

    setForm((f) => ({
      ...f,
      subtotal: subtotalCalculado.toFixed(2),
      total: totalCalculado.toFixed(2),
    }));
  }, [form.cantidad, form.precio, form.descuento]);

  const handleSubmitDetalle = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        factura: factura.id,
        item: parseInt(form.item),
        cantidad: parseInt(form.cantidad),
        precio: parseFloat(form.precio),
        descuento: parseFloat(form.descuento),
        subtotal: parseFloat(form.subtotal),
        total: parseFloat(form.total),
      };

      if (editing) {
        await updateDetalleFactura(editing.id, payload);
        alert("Detalle actualizado correctamente");
      } else {
        await createDetalleFactura(payload);
        alert("Detalle agregado correctamente");
      }

      // Recalcular la factura automáticamente
      await recalcularFactura(factura.id);

      setShowForm(false);
      setEditing(null);
      setForm({
        item: "",
        cantidad: "1",
        precio: "0.00",
        descuento: "0.00",
        subtotal: "0.00",
        total: "0.00",
      });
      loadDetalles();
      loadResumen();
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error("Error:", e.message);
      alert("Error: " + e.message);
    }
  };

  const handleEdit = (detalle) => {
    setEditing(detalle);
    setForm({
      item: detalle.item,
      cantidad: detalle.cantidad.toString(),
      precio: detalle.precio,
      descuento: detalle.descuento,
      subtotal: detalle.subtotal,
      total: detalle.total,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este detalle?")) return;

    try {
      await deleteDetalleFactura(id);
      
      // Recalcular la factura automáticamente
      await recalcularFactura(factura.id);
      
      alert("Detalle eliminado correctamente");
      loadDetalles();
      loadResumen();
      if (onUpdate) onUpdate();
    } catch (e) {
      alert("Error al eliminar detalle: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Detalles de Factura {factura.numero}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Proveedor: {factura.proveedor_nombre} | Fecha: {factura.fecha_registro}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Resumen */}
          {resumen && (
            <>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border border-indigo-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Resumen de Detalles</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Total Items</p>
                    <p className="text-xl font-bold text-indigo-900">
                      {resumen.total_items || 0}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Subtotal (sin desc.)</p>
                    <p className="text-xl font-bold text-gray-700">
                      Bs {parseFloat(resumen.total_subtotal || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Descuento Items</p>
                    <p className="text-xl font-bold text-red-600">
                      -Bs {parseFloat(resumen.total_descuento || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-md shadow-sm border-2 border-green-500">
                    <p className="text-xs text-green-700 mb-1 font-semibold">Total con Desc.</p>
                    <p className="text-xl font-bold text-green-600">
                      Bs {parseFloat(resumen.total_final || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Nota sobre descuentos:</strong> 
                    </p>
                    <ul className="mt-2 text-xs text-blue-700 list-disc list-inside space-y-1">
                      <li><strong>Descuentos por item:</strong> Son montos fijos en Bs aplicados a cada producto individual</li>
                      <li><strong>Total calculado:</strong> {parseFloat(resumen.total_subtotal || 0).toFixed(2)} - {parseFloat(resumen.total_descuento || 0).toFixed(2)} = <strong>{parseFloat(resumen.total_final || 0).toFixed(2)} Bs</strong></li>
                      <li><strong>Descuento e IVA general:</strong> Se aplican sobre este total en la factura principal (porcentaje)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Botón Agregar Detalle */}
          {!showForm && (
            <Button
              variant="guardar"
              onClick={() => {
                setEditing(null);
                setForm({
                  item: "",
                  cantidad: "1",
                  precio: "0.00",
                  descuento: "0.00",
                  subtotal: "0.00",
                  total: "0.00",
                });
                setShowForm(true);
              }}
            >
              + Agregar Detalle
            </Button>
          )}

          {/* Formulario de Detalle */}
          {showForm && (
            <form
              onSubmit={handleSubmitDetalle}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4"
            >
              <h3 className="font-semibold text-gray-800">
                {editing ? "Editar Detalle" : "Nuevo Detalle"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Item
                  </label>
                  <select
                    name="item"
                    value={form.item}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Seleccione un item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre} - Bs {item.precio}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Cantidad
                  </label>
                  <input
                    type="number"
                    name="cantidad"
                    value={form.cantidad}
                    onChange={handleNumericChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Precio Unitario (Bs)
                  </label>
                  <input
                    name="precio"
                    value={form.precio}
                    onChange={handleNumericChange}
                    required
                    className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Descuento (Bs)
                  </label>
                  <input
                    name="descuento"
                    value={form.descuento}
                    onChange={handleNumericChange}
                    className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Descuento en monto fijo por este item
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Subtotal
                  </label>
                  <input
                    name="subtotal"
                    value={form.subtotal}
                    readOnly
                    className="w-full px-3 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Total
                  </label>
                  <input
                    name="total"
                    value={form.total}
                    readOnly
                    className="w-full px-3 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="cancelar"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button variant="guardar" type="submit">
                  {editing ? "Actualizar" : "Agregar"}
                </Button>
              </div>
            </form>
          )}

          {/* Lista de Detalles */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Item
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Precio Unit.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Desc. (Bs)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Subtotal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {detalles.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No hay detalles agregados
                    </td>
                  </tr>
                ) : (
                  detalles.map((detalle) => (
                    <tr key={detalle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {detalle.item_nombre}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {detalle.cantidad}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        Bs {parseFloat(detalle.precio).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        Bs {parseFloat(detalle.descuento).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        Bs {parseFloat(detalle.subtotal).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        Bs {parseFloat(detalle.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(detalle)}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(detalle.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <Button variant="cancelar" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FacturaDetallesModal;
