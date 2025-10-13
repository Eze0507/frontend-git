import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { fetchAllPermissions } from "../../api/rolesApi";

const RoleForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    permission_ids: [],
  });
  const [permissions, setPermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoadingPermissions(true);
        const data = await fetchAllPermissions();
        if (Array.isArray(data)) {
          setPermissions(data);
        } else {
          setPermissions([]);
        }
      } catch (error) {
        console.error('Error al cargar permisos:', error.message);
        setPermissions([]);
      } finally {
        setLoadingPermissions(false);
      }
    };
    loadPermissions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        permission_ids: initialData.permissions && Array.isArray(initialData.permissions) 
          ? initialData.permissions.map(p => p.id) 
          : [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePermissionChange = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permissionId)
        ? prev.permission_ids.filter(id => id !== permissionId)
        : [...prev.permission_ids, permissionId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // El backend espera permission_ids, no permissions
    const dataToSend = {
      name: formData.name,
      permission_ids: formData.permission_ids
    };
    console.log('Datos que se envían al backend:', dataToSend);
    console.log('Permisos seleccionados:', formData.permission_ids);
    onSubmit(dataToSend);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Rol" : "Registrar Rol"} onSubmit={handleSubmit}>
      {/* Nombre del Rol */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="name">
          Nombre del Rol
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Permisos */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Permisos
        </label>
        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3 bg-gray-50">
          {loadingPermissions ? (
            <div className="text-center text-gray-500">Cargando permisos...</div>
          ) : permissions.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No hay permisos disponibles en el backend.</p>
              <p className="text-xs mt-1">Puedes crear el rol sin permisos por ahora.</p>
            </div>
          ) : (
            permissions.map((permission) => (
              <div key={permission.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`permission-${permission.id}`}
                  checked={formData.permission_ids.includes(permission.id)}
                  onChange={() => handlePermissionChange(permission.id)}
                  className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor={`permission-${permission.id}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {permission.name} ({permission.codename})
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-2">
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

export default RoleForm;
