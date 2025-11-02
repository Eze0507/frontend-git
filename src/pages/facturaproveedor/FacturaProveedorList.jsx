import React, { useMemo, useState } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const FacturaProveedorList = ({ facturas, onEdit, onDelete, onAddNew, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!facturas || !Array.isArray(facturas)) return [];
    if (!searchTerm) return facturas;
    const s = searchTerm.toLowerCase();
    return facturas.filter((f) => {
      const proveedorNombre = f.proveedor_nombre || "";
      const proveedorNit = f.proveedor_nit || "";
      return (
        (f.numero && f.numero.toLowerCase().includes(s)) ||
        (proveedorNombre && proveedorNombre.toLowerCase().includes(s)) ||
        (proveedorNit && proveedorNit.toLowerCase().includes(s)) ||
        (f.observacion && f.observacion.toLowerCase().includes(s))
      );
    });
  }, [searchTerm, facturas]);

  const columns = ["numero", "proveedor", "fecha_registro", "subtotal", "descuento", "impuesto", "total"];
  
  const tableData = filtered.map((f) => {
    console.log('📊 Procesando factura:', f);
    return {
      id: f?.id || '',
      numero: f?.numero || "",
      fecha_registro: f?.fecha_registro || "",
      observacion: f?.observacion || "",
      descuento: parseFloat(f?.descuento || 0).toFixed(2),
      impuesto: parseFloat(f?.impuesto || 0).toFixed(2),
      subtotal: parseFloat(f?.subtotal || 0).toFixed(2),
      total: parseFloat(f?.total || 0).toFixed(2),
      proveedor: f?.proveedor_nombre || "Sin proveedor",
      proveedor_id: f?.proveedor || null,
      proveedor_nombre: f?.proveedor_nombre || "",
      proveedor_nit: f?.proveedor_nit || "",
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de Facturas de Proveedor
      </h2>

      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nueva Factura
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <input
            type="text"
            placeholder="Buscar por número, proveedor, NIT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md px-3 py-1 bg-white text-gray-700 w-80"
          />
        </div>
      </div>

      <CustomTable
        title="Facturas de Proveedor"
        columns={columns}
        data={tableData}
        onEdit={(row) => {
          console.log('✏️ Editando desde tabla:', row);
          onEdit(row);
        }}
        onDelete={onDelete}
        onViewDetails={onViewDetails}
      />
    </div>
  );
};

export default FacturaProveedorList;
