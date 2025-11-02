import React, { useEffect, useState } from "react";
import FacturaProveedorList from "./FacturaProveedorList.jsx";
import FacturaProveedorForm from "./FacturaProveedorForm.jsx";
import FacturaDetallesModal from "./FacturaDetallesModal.jsx";
import {
  getAllFacturasProveedor,
  createFacturaProveedor,
  updateFacturaProveedor,
  deleteFacturaProveedor,
} from "../../api/facturaProveedorApi.jsx";
import { getAllProveedor } from "../../api/proveedorApi.jsx";

const FacturaProveedorPage = () => {
  const [facturas, setFacturas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);

  async function loadFacturas() {
    setLoading(true);
    try {
      const data = await getAllFacturasProveedor();
      console.log('📋 Datos de facturas recibidos del backend:', data);
      console.log('📋 Primera factura (ejemplo):', data[0]);
      if (data[0]) {
        console.log('🔍 Claves disponibles en la primera factura:', Object.keys(data[0]));
      }
      setFacturas(data);
    } catch (e) {
      console.error('Error al cargar facturas:', e.message);
      alert('Error al cargar facturas: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadProveedores() {
    try {
      const data = await getAllProveedor();
      console.log('📋 Proveedores cargados:', data.length);
      setProveedores(data);
    } catch (e) {
      console.error('Error al cargar proveedores:', e.message);
    }
  }

  useEffect(() => {
    loadFacturas();
    loadProveedores();
  }, []);

  const handleEdit = (row) => { 
    console.log('✏️ Editando factura:', row);
    setEditing(row); 
    setShowForm(true); 
  };

  const handleDelete = async (id) => {
    console.log('🗑️ Intentando eliminar factura con ID:', id);
    
    if (!id || id === "" || id === null || id === "undefined") {
      console.error('❌ ID inválido recibido:', id);
      alert('Error: No se puede eliminar esta factura porque no tiene un ID válido');
      return;
    }
    
    if (!window.confirm("¿Seguro que quieres eliminar esta factura de proveedor?")) {
      console.log('❌ Eliminación cancelada por el usuario');
      return;
    }
    
    try {
      console.log('🚀 Iniciando eliminación...');
      await deleteFacturaProveedor(id);
      console.log('✅ Eliminación exitosa, recargando lista...');
      alert('Factura eliminada correctamente');
      loadFacturas();
    } catch (e) { 
      console.error('❌ Error en eliminación:', e.message);
      alert('Error al eliminar factura: ' + e.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      console.log('📋 Datos del formulario:', formData);
      
      // Preparar payload para el backend
      const payload = {
        numero: formData.numero,
        fecha_registro: formData.fecha_registro,
        observacion: formData.observacion || "",
        descuento_porcentaje: parseFloat(formData.descuento_porcentaje) || 0,
        impuesto_porcentaje: parseFloat(formData.impuesto_porcentaje) || 0,
        subtotal: parseFloat(formData.subtotal) || 0,
        proveedor: parseInt(formData.proveedor),
      };
      
      console.log('📤 Payload a enviar:', payload);
      
      if (editing) {
        await updateFacturaProveedor(editing.id, payload);
        alert("Factura actualizada correctamente");
      } else {
        await createFacturaProveedor(payload);
        alert("Factura creada correctamente");
      }
      setShowForm(false);
      setEditing(null);
      loadFacturas();
    } catch (e) {
      console.error("Error:", e.message);
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <FacturaProveedorList
        facturas={facturas}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => { setEditing(null); setShowForm(true); }}
        onViewDetails={(factura) => setSelectedFactura(factura)}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          {console.log('📤 Pasando datos al formulario:', { editing, proveedores: proveedores.length })}
          <FacturaProveedorForm
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            initialData={editing}
            proveedores={proveedores}
            loading={loading}
          />
        </div>
      )}

      {selectedFactura && (
        <FacturaDetallesModal
          factura={selectedFactura}
          onClose={() => setSelectedFactura(null)}
          onUpdate={() => loadFacturas()}
        />
      )}
    </div>
  );
};

export default FacturaProveedorPage;
