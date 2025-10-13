import React, { useState, useEffect } from 'react';
import RoleList from './roleList.jsx';
import RoleForm from './roleForm.jsx';
import { fetchAllRoles, createRole, updateRole, deleteRole } from '../../api/rolesApi.jsx';

const RolePage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await fetchAllRoles();
      console.log('Roles cargados desde el backend:', data);
      console.log('Estructura del primer rol:', data[0]);
      if (data[0] && data[0].permissions) {
        console.log('Permisos del primer rol:', data[0].permissions);
      }
      setRoles(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleEdit = (role) => {
    setEditingRole(role);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este rol?")) return;
    try {
      await deleteRole(id);
      loadRoles();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, formData);
        alert('Rol actualizado correctamente');
      } else {
        await createRole(formData);
        alert('Rol creado correctamente');
      }
      setShowForm(false);
      setEditingRole(null);
      loadRoles();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative">
      {/* Tabla de roles */}
      <RoleList
        roles={roles}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />
      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <RoleForm
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingRole(null); }}
            initialData={editingRole}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default RolePage;
