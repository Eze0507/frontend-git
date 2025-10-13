import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const RoleList = ({ roles, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de roles según búsqueda
  const filteredRoles = useMemo(() => {
    if (!roles || !Array.isArray(roles)) return [];
    if (!searchTerm) return roles;
    return roles.filter(
      (role) =>
        role &&
        role.name &&
        (role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (role.permissions && role.permissions.some(perm => 
            perm.name.toLowerCase().includes(searchTerm.toLowerCase())
          )))
    );
  }, [searchTerm, roles]);

  const columns = ["name", "permissions"];
  const tableData = filteredRoles.map((role) => ({
    name: role?.name || '',
    permissions: role?.permissions && Array.isArray(role.permissions) && role.permissions.length > 0 
      ? role.permissions.map(p => p.name || p).join(', ') 
      : 'Sin permisos',
    id: role?.id || '',
    originalRole: role, // Agregar el objeto completo del rol
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de Roles
      </h2>
      {/* Botón Nuevo Rol y Buscador */}
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="guardar"
          onClick={onAddNew}
        >
          Nuevo Rol
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md px-3 py-1 bg-white text-gray-700 w-80"
          />
        </div>
      </div>
      <CustomTable
        title="Roles"
        columns={columns}
        data={tableData}
        onEdit={(role) => onEdit(role.originalRole)}
        onDelete={onDelete}
      />
    </div>
  );
};

export default RoleList;
