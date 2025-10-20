import React, { useMemo, useState } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const VehiculoList = ({ vehiculos, marcas = [], modelos = [], onEdit, onDelete, onAddNew, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!vehiculos || !Array.isArray(vehiculos)) return [];
    if (!searchTerm) return vehiculos;
    const s = searchTerm.toLowerCase();
    return vehiculos.filter((v) => {
      return (
        (v?.numero_placa && v.numero_placa.toLowerCase().includes(s)) ||
        (v?.marca_nombre && v.marca_nombre.toLowerCase().includes(s)) ||
        (v?.modelo_nombre && v.modelo_nombre.toLowerCase().includes(s)) ||
        (v?.color && v.color.toLowerCase().includes(s)) ||
        (v?.cliente_nombre && v.cliente_nombre.toLowerCase().includes(s)) ||
        (v?.año && String(v.año).includes(s)) ||
        (v?.vin && v.vin.toLowerCase().includes(s)) ||
        (v?.numero_motor && v.numero_motor.toLowerCase().includes(s))
      );
    });
  }, [searchTerm, vehiculos]);

  const columns = ["numero_placa", "marca", "modelo", "cliente", "año", "color"];

  const tableData = filteredItems.map((v) => ({
    numero_placa: (
      <div className="text-center font-medium text-gray-900">{v?.numero_placa || ''}</div>
    ),
    marca: (
      <div className="text-left font-medium text-gray-900">{v?.marca_nombre || ''}</div>
    ),
    modelo: (
      <div className="text-left text-sm text-gray-600">{v?.modelo_nombre || ''}</div>
    ),
    cliente: (
      <div className="text-center text-gray-800">{v?.cliente_nombre || ''}</div>
    ),
    año: (
      <div className="text-center text-gray-800">{v?.año || ''}</div>
    ),
    color: (
      <div className="text-center text-gray-800">{v?.color || ''}</div>
    ),
    id: v?.id || v?.pk || '',
    originalData: v,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Gestión de Vehículos</h2>

      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nuevo Vehículo
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
        title="Vehículos"
        columns={columns}
        data={tableData}
        onEdit={(row) => onEdit(row.originalData)}
        onView={(row) => onViewDetails(row.originalData)}
        onDelete={(id) => onDelete(id)}
      />
    </div>
  );
};

export default VehiculoList;
