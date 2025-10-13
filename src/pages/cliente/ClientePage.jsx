import React, { useEffect, useState } from "react";
import ClienteList from "./ClienteList.jsx";
import ClienteForm from "./ClienteForm.jsx";
import {
  fetchAllClientes, fetchAllUsers,
  createCliente, updateCliente, deleteCliente, toApiCliente,
  checkUserPermissions
} from "../../api/clientesApi.jsx";

const ClientePage = () => {
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadClientes() {
    setLoading(true);
    try {
      const data = await fetchAllClientes();
      console.log('📋 Datos de clientes recibidos del backend:', data);
      console.log('📋 Primer cliente (ejemplo):', data[0]);
      if (data[0]) {
        console.log('🔍 Claves disponibles en el primer cliente:', Object.keys(data[0]));
        console.log('🔍 ID del primer cliente:', data[0].id);
        console.log('🔍 PK del primer cliente:', data[0].pk);
      }
      setClientes(data);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsuarios() {
    try {
      const data = await fetchAllUsers();
      setUsuarios(data);
    } catch (e) {
      console.error(e.message);
    }
  }

  useEffect(() => {
    loadClientes();
    loadUsuarios();
  }, []);

  const handleEdit = (row) => { 
    console.log('✏️ Editando cliente:', row);
    setEditing(row); 
    setShowForm(true); 
  };
  const handleDelete = async (id) => {
    console.log('🗑️ Intentando eliminar cliente con ID:', id);
    
    // Validar que el ID sea válido
    if (!id || id === "" || id === null || id === "undefined") {
      console.error('❌ ID inválido recibido:', id);
      alert('Error: No se puede eliminar este cliente porque no tiene un ID válido');
      return;
    }
    
    if (!window.confirm("¿Seguro que quieres eliminar este cliente?")) {
      console.log('❌ Eliminación cancelada por el usuario');
      return;
    }
    
    try {
      console.log('🚀 Iniciando eliminación...');
      await deleteCliente(id);
      console.log('✅ Eliminación exitosa, recargando lista...');
      alert('Cliente eliminado correctamente');
      loadClientes();
    } catch (e) { 
      console.error('❌ Error en eliminación:', e.message);
      alert('Error al eliminar cliente: ' + e.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Verificar permisos antes de enviar
      const permissions = checkUserPermissions();
      console.log('🔍 Permisos del usuario:', permissions);
      
      const payload = toApiCliente(formData);
      console.log('📋 Datos del formulario:', formData);
      console.log('📤 Payload a enviar:', payload);
      
      if (editing) {
        await updateCliente(editing.id, payload);
        alert("Cliente actualizado correctamente");
      } else {
        await createCliente(payload);
        alert("Cliente creado correctamente");
      }
      setShowForm(false);
      setEditing(null);
      loadClientes();
    } catch (e) {
      console.error("Error:", e.message);
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <ClienteList
        clientes={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={()=>{ setEditing(null); setShowForm(true); }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          {console.log('📤 Pasando datos al formulario:', { editing, usuarios: usuarios.length })}
          <ClienteForm
            onSubmit={handleFormSubmit}
            onCancel={()=>{ setShowForm(false); setEditing(null); }}
            initialData={editing}
            usuarios={usuarios}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default ClientePage;