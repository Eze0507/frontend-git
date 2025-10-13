import React, { useEffect, useState } from "react";
import PresupuestoList from "./PresupuestoList.jsx";
import {
  fetchAllPresupuestos,
  createPresupuesto, updatePresupuesto, deletePresupuesto, toApiPresupuesto,
  checkUserPermissions
} from "../../api/presupuestosApi.jsx";

const PresupuestoPage = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  async function loadPresupuestos() {
    setLoading(true);
    try {
      const data = await fetchAllPresupuestos();
      console.log('📋 Datos de presupuestos recibidos:', data);
      setPresupuestos(data);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPresupuestos();
  }, []);

  const handleEdit = (row) => { 
    console.log('✏️ Editando presupuesto:', row);
    setEditing(row); 
  };

  const handleDelete = async (id) => {
    console.log('🗑️ Intentando eliminar presupuesto con ID:', id);
    
    if (!id || id === "" || id === null || id === "undefined") {
      console.error('❌ ID inválido recibido:', id);
      alert('Error: No se puede eliminar este presupuesto porque no tiene un ID válido');
      return;
    }
    
    if (!window.confirm("¿Seguro que quieres eliminar este presupuesto?")) {
      console.log('❌ Eliminación cancelada por el usuario');
      return;
    }
    
    try {
      console.log('🚀 Iniciando eliminación...');
      await deletePresupuesto(id);
      console.log('✅ Eliminación exitosa, recargando lista...');
      alert('Presupuesto eliminado correctamente');
      loadPresupuestos();
    } catch (e) { 
      console.error('❌ Error en eliminación:', e.message);
      alert('Error al eliminar presupuesto: ' + e.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Verificar permisos antes de enviar
      const permissions = checkUserPermissions();
      console.log('🔍 Permisos del usuario:', permissions);
      
      const payload = toApiPresupuesto(formData);
      console.log('📋 Datos del formulario:', formData);
      console.log('📤 Payload a enviar:', payload);
      
      if (editing) {
        await updatePresupuesto(editing.id, payload);
        alert("Presupuesto actualizado correctamente");
      } else {
        await createPresupuesto(payload);
        alert("Presupuesto creado correctamente");
      }
      setEditing(null);
      loadPresupuestos();
    } catch (e) {
      console.error("Error:", e.message);
      alert("Error: " + e.message);
    }
  };

  const handleAddNew = () => {
    setEditing(null);
    // Aquí podrías abrir un modal de formulario o navegar a una página de creación
    alert("Funcionalidad de nuevo presupuesto - próximamente");
  };

  return (
    <div className="p-6 space-y-6 relative">
      <PresupuestoList
        presupuestos={presupuestos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
      />
    </div>
  );
};

export default PresupuestoPage;
