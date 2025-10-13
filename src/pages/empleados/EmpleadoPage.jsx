import React, { useEffect, useState } from "react";
import EmpleadoList from "./EmpleadoList.jsx";
import EmpleadoForm from "./EmpleadoForm.jsx";
import {
  fetchAllEmpleados, fetchAllCargos, fetchAllUsers, fetchAllAreas,
  createEmpleado, updateEmpleado, deleteEmpleado, toApiEmpleado,
  checkUserPermissions
} from "../../api/empleadosApi.jsx";

const EmpleadoPage = () => {
  const [empleados, setEmpleados] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function loadEmpleados() {
    setLoading(true);
    try {
      const data = await fetchAllEmpleados();
      console.log('📋 Datos de empleados recibidos del backend:', data);
      console.log('📋 Primer empleado (ejemplo):', data[0]);
      if (data[0]) {
        console.log('🔍 Claves disponibles en el primer empleado:', Object.keys(data[0]));
        console.log('🔍 ID del primer empleado:', data[0].id);
        console.log('🔍 PK del primer empleado:', data[0].pk);
      }
      setEmpleados(data);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCargos() {
    try {
      const data = await fetchAllCargos();
      setCargos(data);
    } catch (e) {
      console.error(e.message);
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

  async function loadAreas() {
    try {
      const data = await fetchAllAreas();
      setAreas(data);
    } catch (e) {
      console.error(e.message);
    }
  }

  useEffect(() => {
    loadEmpleados();
    loadCargos();
    loadUsuarios();
    loadAreas();
  }, []);

  const handleEdit = (row) => { 
    console.log('✏️ Editando empleado:', row);
    setEditing(row); 
    setShowForm(true); 
  };
  const handleDelete = async (id) => {
    console.log('🗑️ Intentando eliminar empleado con ID:', id);
    
    // Validar que el ID sea válido
    if (!id || id === "" || id === null || id === "undefined") {
      console.error('❌ ID inválido recibido:', id);
      alert('Error: No se puede eliminar este empleado porque no tiene un ID válido');
      return;
    }
    
    if (!window.confirm("¿Seguro que quieres eliminar este empleado?")) {
      console.log('❌ Eliminación cancelada por el usuario');
      return;
    }
    
    try {
      console.log('🚀 Iniciando eliminación...');
      await deleteEmpleado(id);
      console.log('✅ Eliminación exitosa, recargando lista...');
      alert('Empleado eliminado correctamente');
      loadEmpleados();
    } catch (e) { 
      console.error('❌ Error en eliminación:', e.message);
      alert('Error al eliminar empleado: ' + e.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Verificar permisos antes de enviar
      const permissions = checkUserPermissions();
      console.log('🔍 Permisos del usuario:', permissions);
      
      const payload = toApiEmpleado(formData);
      console.log('📋 Datos del formulario:', formData);
      console.log('📤 Payload a enviar:', payload);
      
      if (editing) {
        await updateEmpleado(editing.id, payload);
        alert("Empleado actualizado correctamente");
      } else {
        await createEmpleado(payload);
        alert("Empleado creado correctamente");
      }
      setShowForm(false);
      setEditing(null);
      loadEmpleados();
    } catch (e) {
      console.error("Error:", e.message);
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <EmpleadoList
        empleados={empleados}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={()=>{ setEditing(null); setShowForm(true); }}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          {console.log('📤 Pasando datos al formulario:', { editing, cargos: cargos.length, usuarios: usuarios.length, areas: areas.length })}
          <EmpleadoForm
            onSubmit={handleFormSubmit}
            onCancel={()=>{ setShowForm(false); setEditing(null); }}
            initialData={editing}
            cargos={cargos}
            usuarios={usuarios}
            areas={areas}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default EmpleadoPage;
