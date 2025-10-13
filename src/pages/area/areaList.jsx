import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const AreaList = ({ areas, onEdit, onDelete, onAddNew, onView }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de áreas según búsqueda
  const filteredAreas = useMemo(() => {
    if (!areas || !Array.isArray(areas)) return [];
    if (!searchTerm) return areas;
    return areas.filter(
      (area) =>
        area &&
        area.nombre &&
        area.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, areas]);

  const columns = [
    "id",
    "nombre"
  ];

  const tableData = filteredAreas.map((area) => ({
    id: area?.id || '',
    nombre: area?.nombre || '',
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de Áreas
      </h2>
      {/* Botón Nuevo y Buscador */}
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="guardar"
          onClick={onAddNew}
        >
          Nueva Área
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <input
            type="text"
            placeholder="Buscar área por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md px-3 py-1 bg-white text-gray-700 w-80"
          />
        </div>
      </div>
      <CustomTable
        title="Áreas"
        columns={columns}
        data={tableData}
        onView={(area) => onView(area)}
        onEdit={(area) => onEdit(area)}
        onDelete={onDelete}
      />
    </div>
  );
};

export default AreaList;
