import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const ProveedorList = ({ proveedores, onEdit, onDelete, onAddNew, onView, loading, error, onRetry }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de proveedores según búsqueda
  const filteredProveedores = useMemo(() => {
    if (!proveedores || !Array.isArray(proveedores)) return [];
    if (!searchTerm) return proveedores;
    
    return proveedores.filter((proveedor) => {
      if (!proveedor) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const nombre = (proveedor.nombre || '').toLowerCase();
      const telefono = (proveedor.telefono || '').toLowerCase();
      const correo = (proveedor.correo || '').toLowerCase();
      const contacto = (proveedor.contacto || '').toLowerCase();
      const nit = (proveedor.nit || '').toLowerCase();
      
      return nombre.includes(searchLower) || 
             telefono.includes(searchLower) || 
             correo.includes(searchLower) ||
             contacto.includes(searchLower) ||
             nit.includes(searchLower);
    });
  }, [searchTerm, proveedores]);

  const columns = ["id", "nombre", "contacto", "telefono", "correo"];

  const tableData = filteredProveedores.map((proveedor) => ({
    id: proveedor?.id || '',
    nombre: proveedor?.nombre || '',
    contacto: proveedor?.contacto || 'N/A',
    telefono: proveedor?.telefono || 'N/A',
    correo: proveedor?.correo || 'N/A'
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de Proveedores
      </h2>

      {/* Mostrar errores */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
          {onRetry && (
            <button 
              onClick={onRetry}
              className="ml-4 text-red-700 underline hover:text-red-900"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Mostrar loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Cargando proveedores...</div>
        </div>
      )}
      
      {!loading && (
        <>
          {/* Botón Nuevo y Buscador */}
          <div className="flex justify-between items-center mb-4">
            <Button variant="guardar" onClick={onAddNew}>
              Nuevo Proveedor
            </Button>
            <div className="flex justify-start flex-1 ml-8">
              <input
                type="text"
                placeholder="Buscar por nombre, contacto, teléfono, correo o nit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-700 w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tabla de proveedores */}
          <CustomTable
            title="Proveedores"
            columns={columns}
            data={tableData}
            onView={(proveedor) => onView(proveedor)}
            onEdit={(proveedor) => onEdit(proveedor)}
            onDelete={onDelete}
          />
        </>
      )}
    </div>
  );
};

export default ProveedorList;
