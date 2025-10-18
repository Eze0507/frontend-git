import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const ServicioList = ({ items, onEdit, onView, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de servicios según búsqueda
  const filteredItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    if (!searchTerm) return items;
    return items.filter(
      (item) =>
        item &&
        item.nombre &&
        item.descripcion &&
        (item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, items]);

  const columns = [
    "codigo",
    "nombre", 
    "descripcion",
    "precio",
    "estado",
    "area"
  ];
  const tableData = filteredItems.map((item) => ({
    codigo: (
      <div className="text-center font-medium text-gray-900">
        {item?.codigo || ''}
      </div>
    ),
    nombre: (
      <div className="text-left font-medium text-gray-900">
        {item?.nombre || ''}
      </div>
    ),
    descripcion: (
      <div className="text-left text-sm text-gray-600 max-w-xs">
        {item?.descripcion || ''}
      </div>
    ),
    precio: (
      <div className="text-center">
        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-sm">
          Bs. {item?.precio !== undefined ? item.precio : '0.00'}
        </span>
      </div>
    ),
    estado: (
      <div className="text-center">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-semibold shadow-sm ${
          item?.estado === 'Disponible' 
            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white' 
            : 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
        }`}>
          {item?.estado === 'Disponible' ? (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {item?.estado || 'No definido'}
        </span>
      </div>
    ),
    area: (
      <div className="text-center text-gray-800">
        {item?.area_nombre || ''}
      </div>
    ),
    id: item?.id || '',
    // Incluir los datos originales para facilitar la edición
    originalData: item,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de Servicios
      </h2>
      {/* Botón Nuevo y Buscador */}
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="guardar"
          onClick={onAddNew}
        >
          Nuevo Servicio
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
        title="Servicios"
        columns={columns}
        data={tableData}
        onEdit={(item) => onEdit(item)}
        onView={(item) => onView(item)}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ServicioList;
