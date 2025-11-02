import React, { useEffect, useState } from "react";
import StyledForm from "../../components/form";      
import Button from "../../components/button";        

const FacturaProveedorForm = ({ onSubmit, onCancel, initialData, proveedores = [], loading }) => {
  const [form, setForm] = useState({
    id: null,
    numero: "",
    fecha_registro: "",
    observacion: "",
    descuento_porcentaje: "0.00",
    impuesto_porcentaje: "0.00",
    subtotal: "0.00",
    descuento: "0.00",
    impuesto: "0.00",
    total: "0.00",
    proveedor: "",
  });

  useEffect(() => {
    console.log('📋 Datos iniciales recibidos:', initialData);
    
    setForm({
      id: initialData?.id || null,
      numero: initialData?.numero || "",
      fecha_registro: initialData?.fecha_registro || "",
      observacion: initialData?.observacion || "",
      descuento_porcentaje: initialData?.descuento_porcentaje || "0.00",
      impuesto_porcentaje: initialData?.impuesto_porcentaje || "0.00",
      subtotal: initialData?.subtotal || "0.00",
      descuento: initialData?.descuento || "0.00",
      impuesto: initialData?.impuesto || "0.00",
      total: initialData?.total || "0.00",
      proveedor: initialData?.proveedor_id || 
                initialData?.proveedor || 
                "",
    });
    
    console.log('📝 Formulario inicializado con:', {
      id: initialData?.id,
      numero: initialData?.numero,
      proveedor: initialData?.proveedor_id || initialData?.proveedor,
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    // Permitir números decimales
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Calcular descuento, impuesto y total automáticamente
  useEffect(() => {
    const subtotal = parseFloat(form.subtotal) || 0;
    const descuentoPorcentaje = parseFloat(form.descuento_porcentaje) || 0;
    const impuestoPorcentaje = parseFloat(form.impuesto_porcentaje) || 0;
    
    // Calcular monto de descuento
    const descuentoMonto = (subtotal * descuentoPorcentaje) / 100;
    
    // Calcular base imponible (subtotal - descuento)
    const baseImponible = subtotal - descuentoMonto;
    
    // Calcular monto de impuesto sobre la base imponible
    const impuestoMonto = (baseImponible * impuestoPorcentaje) / 100;
    
    // Calcular total
    const totalCalculado = baseImponible + impuestoMonto;
    
    setForm((f) => ({ 
      ...f, 
      descuento: descuentoMonto.toFixed(2),
      impuesto: impuestoMonto.toFixed(2),
      total: totalCalculado.toFixed(2) 
    }));
  }, [form.subtotal, form.descuento_porcentaje, form.impuesto_porcentaje]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Factura de Proveedor" : "Registrar Factura de Proveedor"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Número de Factura */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Número de Factura</label>
          <input
            name="numero" 
            value={form.numero} 
            onChange={handleChange} 
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej: FAC-001"
          />
          <p className="text-xs text-gray-500 mt-1">
            El número de factura debe ser único
          </p>
        </div>

        {/* Fecha de Registro */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Fecha de Registro</label>
          <input
            type="date"
            name="fecha_registro" 
            value={form.fecha_registro} 
            onChange={handleChange} 
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Proveedor */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700">Proveedor</label>
          <select
            name="proveedor"
            value={form.proveedor}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccione un proveedor</option>
            {proveedores.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} - NIT: {p.nit}
              </option>
            ))}
          </select>
        </div>

        {/* Subtotal */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Subtotal</label>
          <input
            name="subtotal" 
            value={form.subtotal} 
            onChange={handleNumericChange} 
            required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
        </div>

        {/* Descuento */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Descuento (%)</label>
          <div className="relative">
            <input
              name="descuento_porcentaje" 
              value={form.descuento_porcentaje} 
              onChange={handleNumericChange}
              className="w-full px-3 py-2 pr-8 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-2.5 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Monto: Bs {form.descuento}
          </p>
        </div>

        {/* Impuesto */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Impuesto - IVA (%)</label>
          <div className="relative">
            <input
              name="impuesto_porcentaje" 
              value={form.impuesto_porcentaje} 
              onChange={handleNumericChange}
              className="w-full px-3 py-2 pr-8 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-2.5 text-gray-500">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Monto: Bs {form.impuesto}
          </p>
        </div>

        {/* Total (calculado automáticamente) */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Total</label>
          <input
            name="total" 
            value={form.total} 
            readOnly
            className="w-full px-3 py-2 rounded-md bg-gray-100 border border-gray-300 text-gray-700 cursor-not-allowed"
            placeholder="0.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            Calculado automáticamente: Subtotal - Descuento (Bs {form.descuento}) + IVA (Bs {form.impuesto})
          </p>
        </div>
      </div>

      {/* Observación - Campo completo */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Observaciones</label>
        <textarea
          name="observacion" 
          value={form.observacion} 
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Notas adicionales sobre la factura..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 mt-6">
        {onCancel && (
          <Button variant="cancelar" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button variant="guardar" type="submit" disabled={loading}>
          {isEditing ? "Guardar Cambios" : "Guardar"}
        </Button>
      </div>
    </StyledForm>
  );
};

export default FacturaProveedorForm;
