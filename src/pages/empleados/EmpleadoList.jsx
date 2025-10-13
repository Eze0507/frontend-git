import React, { useMemo, useState } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const EmpleadoList = ({ empleados, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!empleados || !Array.isArray(empleados)) return [];
    if (!searchTerm) return empleados;
    const s = searchTerm.toLowerCase();
    return empleados.filter((e) => {
      const cargoNombre =
        e.cargo_nombre || (typeof e.cargo === "object" ? e.cargo?.nombre : "");
      const usuarioNombre =
        e.usuario_nombre || (typeof e.usuario === "object" ? e.usuario?.username : "");
      const areaNombre =
        e.area_nombre || (typeof e.area === "object" ? e.area?.nombre : "");
      return (
        (e.nombre && e.nombre.toLowerCase().includes(s)) ||
        (e.apellido && e.apellido.toLowerCase().includes(s)) ||
        (e.ci && String(e.ci).toLowerCase().includes(s)) ||
        (e.telefono && String(e.telefono).toLowerCase().includes(s)) ||
        (cargoNombre && cargoNombre.toLowerCase().includes(s)) ||
        (usuarioNombre && usuarioNombre.toLowerCase().includes(s)) ||
        (areaNombre && areaNombre.toLowerCase().includes(s))
      );
    });
  }, [searchTerm, empleados]);

  const columns = ["nombre", "apellido", "ci", "telefono", "cargo", "area", "usuario", "estado"];
  const tableData = filtered.map((e) => {
    console.log('📊 Procesando empleado:', e);
    return {
      id: e?.id || e?.pk || '', // Usar pk como alternativa si id no existe
      nombre: e?.nombre || "",
      apellido: e?.apellido || "",
      ci: e?.ci || "",
      telefono: e?.telefono || "",
      direccion: e?.direccion || "",
      sexo: e?.sexo || "M",
      estado_valor: e?.estado ?? true, // Valor booleano original
      sueldo: e?.sueldo ?? 0,
      // Para mostrar en la tabla
      cargo: e?.cargo_nombre || (typeof e?.cargo === "object" ? e?.cargo?.nombre : e?.cargo) || "",
      area: e?.area_nombre || (typeof e?.area === "object" ? e?.area?.nombre : e?.area) || "",
      usuario: e?.usuario_nombre || (typeof e?.usuario === "object" ? e?.usuario?.username : "") || "Sin usuario",
      estado: e?.estado === false ? "Inactivo" : "Activo", // Texto para mostrar
      // Para edición - mantener los objetos completos
      cargo_obj: e?.cargo || null,
      area_obj: e?.area || null,
      usuario_obj: e?.usuario || null,
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de empleados
      </h2>

      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nuevo Empleado
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <input
            type="text"
            placeholder="Buscar por nombre, CI, teléfono, cargo, área, usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md px-3 py-1 bg-white text-gray-700 w-80"
          />
        </div>
      </div>

      <CustomTable
        title="Empleados"
        columns={columns}
        data={tableData}
        onEdit={(row) => {
          console.log('✏️ Editando desde tabla:', row);
          onEdit(row);
        }}
        onDelete={onDelete}
      />
    </div>
  );
};

export default EmpleadoList;
