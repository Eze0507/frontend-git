import React, { useMemo, useState } from "react";
import Button from "../../components/button.jsx";
import { FaSearch, FaPlus } from "react-icons/fa";

const VehiculoList = ({ vehiculos, onEdit, onDelete, onAddNew, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!vehiculos || !Array.isArray(vehiculos)) return [];
    if (!searchTerm) return vehiculos;
    const s = searchTerm.toLowerCase();
    return vehiculos.filter((v) => {
      return (
        (v.numero_placa && v.numero_placa.toLowerCase().includes(s)) ||
        (v.marca_nombre && v.marca_nombre.toLowerCase().includes(s)) ||
        (v.modelo_nombre && v.modelo_nombre.toLowerCase().includes(s)) ||
        (v.color && v.color.toLowerCase().includes(s)) ||
        (v.cliente_nombre && v.cliente_nombre.toLowerCase().includes(s)) ||
        (v.año && String(v.año).includes(s)) ||
        (v.vin && v.vin.toLowerCase().includes(s)) ||
        (v.numero_motor && v.numero_motor.toLowerCase().includes(s))
      );
    });
  }, [searchTerm, vehiculos]);

  const columns = ["numero_placa", "marca", "modelo", "color", "año", "cliente"];
  const tableData = filtered.map((v) => {
    console.log('📊 Procesando vehículo:', v);
    return {
      id: v?.id || v?.pk || '',
      numero_placa: v?.numero_placa || "",
      marca: v?.marca_nombre || "Sin marca",
      modelo: v?.modelo_nombre || "Sin modelo",
      color: v?.color || "Sin color",
      año: v?.año || "Sin año",
      cliente: v?.cliente_nombre || "Sin cliente asignado",
      // Datos adicionales para el formulario de edición
      vin: v?.vin || "",
      numero_motor: v?.numero_motor || "",
      tipo: v?.tipo || "",
      version: v?.version || "",
      cilindrada: v?.cilindrada || "",
      tipo_combustible: v?.tipo_combustible || "",
      // Relaciones (para el formulario)
      cliente_obj: v?.cliente || null,
      marca_obj: v?.marca || null,
      modelo_obj: v?.modelo || null,
    };
  });

  return (
    <div className="w-full">
      {/* Header responsivo */}
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        {/* Desktop layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Vehículos</h1>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o núm. de placa"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          {/* Botón de acción */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="guardar" 
              onClick={onAddNew}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FaPlus className="w-4 h-4" />
              <span>Nuevo Vehículo</span>
            </Button>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Vehículos</h1>
            <Button 
              variant="guardar" 
              onClick={onAddNew}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1"
            >
              <FaPlus className="w-4 h-4" />
              <span className="text-sm">Nuevo</span>
            </Button>
          </div>
          
          {/* Barra de búsqueda móvil */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar vehículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>


      {/* Tabla responsiva */}
      <div className="bg-white rounded-b-lg shadow-lg">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row[col]}
                    </td>
                  ))}
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log('👁️ Ver detalles clickeado para fila:', row);
                          onViewDetails(row);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium text-sm"
                      >
                        Ver detalle
                      </button>
                      <button
                        onClick={() => {
                          console.log('✏️ Editando desde tabla:', row);
                          onEdit(row);
                        }}
                        className="text-green-600 hover:text-green-900 font-medium text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          console.log('🗑️ Botón Eliminar clickeado para ID:', row.id);
                          if (!row.id || row.id === "" || row.id === null) {
                            console.error('❌ ID inválido para eliminar:', row.id);
                            alert('Error: No se puede eliminar este elemento porque no tiene un ID válido');
                            return;
                          }
                          onDelete(row.id);
                        }}
                        className="text-red-600 hover:text-red-900 font-medium text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {tableData.map((row, rowIndex) => (
            <div key={rowIndex} className="border-b border-gray-200 p-4 hover:bg-gray-50">
              <div className="space-y-2">
                {/* Información principal */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{row.numero_placa}</h3>
                    <p className="text-sm text-gray-600">{row.marca} {row.modelo}</p>
                  </div>
                  <span className="text-sm text-gray-500">{row.año}</span>
                </div>
                
                {/* Información secundaria */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Cliente:</span>
                    <p className="font-medium">{row.cliente}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Color:</span>
                    <p className="font-medium">{row.color}</p>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => onViewDetails(row)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100"
                  >
                    Ver detalle
                  </button>
                  <button
                    onClick={() => onEdit(row)}
                    className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (!row.id || row.id === "" || row.id === null) {
                        console.error('❌ ID inválido para eliminar:', row.id);
                        alert('Error: No se puede eliminar este elemento porque no tiene un ID válido');
                        return;
                      }
                      onDelete(row.id);
                    }}
                    className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehiculoList;
