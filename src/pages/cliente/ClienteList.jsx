import React, { useMemo, useState } from "react";
import CustomTable from "../../components/table.jsx";
import Button from "../../components/button.jsx";

const ClienteList = ({ clientes, onEdit, onDelete, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = useMemo(() => {
    if (!clientes || !Array.isArray(clientes)) return [];
    if (!searchTerm) return clientes;
    const s = searchTerm.toLowerCase();
    return clientes.filter((c) => {
      const usuarioNombre =
        c.usuario_nombre || (typeof c.usuario === "object" ? c.usuario?.username : "");
      return (
        (c.nombre && c.nombre.toLowerCase().includes(s)) ||
        (c.apellido && c.apellido.toLowerCase().includes(s)) ||
        (c.nit && String(c.nit).toLowerCase().includes(s)) ||
        (c.telefono && String(c.telefono).toLowerCase().includes(s)) ||
        (c.tipo_cliente && c.tipo_cliente.toLowerCase().includes(s)) ||
        (usuarioNombre && usuarioNombre.toLowerCase().includes(s))
      );
    });
  }, [searchTerm, clientes]);

  const columns = ["nombre", "apellido", "nit", "telefono", "tipo_cliente_display", "usuario", "estado"];
  const tableData = filtered.map((c) => {
    console.log('📊 Procesando cliente:', c);
    return {
      id: c?.id || c?.pk || '', // Usar pk como alternativa si id no existe
      nombre: c?.nombre || "",
      apellido: c?.apellido || "",
      nit: c?.nit || "",
      telefono: c?.telefono || "",
      direccion: c?.direccion || "",
      tipo_cliente: c?.tipo_cliente || "NATURAL", // MANTENER VALOR ORIGINAL DEL BACKEND
      activo: c?.activo ?? true, // Valor booleano original
      // Para mostrar en la tabla (solo visual)
      tipo_cliente_display: c?.tipo_cliente === "EMPRESA" ? "Empresa" : "Natural",
      usuario: c?.usuario_nombre || (typeof c?.usuario === "object" ? c?.usuario?.username : "") || "Sin usuario",
      estado: c?.activo === false ? "Inactivo" : "Activo", // Texto para mostrar
      // Para edición - mantener los objetos completos
      usuario_info: c?.usuario || null,
    };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Gestión de clientes
      </h2>

      <div className="flex justify-between items-center mb-2">
        <Button variant="guardar" onClick={onAddNew}>
          Nuevo Cliente
        </Button>
        <div className="flex justify-start flex-1 ml-8">
          <input
            type="text"
            placeholder="Buscar por nombre, NIT, teléfono, tipo, usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-md px-3 py-1 bg-white text-gray-700 w-80"
          />
        </div>
      </div>

      <CustomTable
        title="Clientes"
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

export default ClienteList;