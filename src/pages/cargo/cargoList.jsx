import React, { useMemo } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const CargoList = ({ cargos, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  // Filtrado de cargos según búsqueda
  const filteredCargos = useMemo(() => {
    if (!cargos || !Array.isArray(cargos)) return [];
    if (!searchTerm) return cargos;
    return cargos.filter(
      (cargo) =>
        cargo &&
        cargo.nombre &&
        cargo.descripcion &&
        (cargo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cargo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, cargos]);

  const columns = ["nombre", "descripcion", "sueldo"];
  const tableData = filteredCargos.map((cargo) => ({
    nombre: cargo?.nombre || '',
    descripcion: cargo?.descripcion || '',
    sueldo: cargo?.sueldo !== undefined ? cargo.sueldo : '',
    id: cargo?.id || '',
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de cargos
      </h2>
      {/* Botón Nuevo Cargo y Buscador */}
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="guardar"
          onClick={onAddNew}
        >
          Nuevo Cargo
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
        title="Cargos"
        columns={columns}
        data={tableData}
        onEdit={(cargo) => onEdit(cargo)}
        onDelete={onDelete}
      />
    </div>
  );
};

export default CargoList;
