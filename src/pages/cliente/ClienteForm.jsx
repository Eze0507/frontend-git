import React, { useEffect, useState } from "react";
import StyledForm from "../../components/form";      
import Button from "../../components/button";        

const ClienteForm = ({ onSubmit, onCancel, initialData, usuarios = [], loading }) => {
  const [form, setForm] = useState({
    id: null,
    nombre: "", 
    apellido: "", 
    nit: "",
    direccion: "", 
    telefono: "",
    tipo_cliente: "NATURAL", 
    activo: true,
    usuario: "",
  });

  useEffect(() => {
    console.log('📋 Datos iniciales recibidos:', initialData);
    
    setForm({
      id: initialData?.id || null,
      nombre: initialData?.nombre || "",
      apellido: initialData?.apellido || "",
      nit: initialData?.nit || "",
      direccion: initialData?.direccion || "",
      telefono: initialData?.telefono || "",
      tipo_cliente: initialData?.tipo_cliente || "NATURAL",
      activo: initialData?.activo !== undefined ? Boolean(initialData.activo) : true,
      // Priorizar usuario_id (del mapeo en ClienteList) sobre otras formas
      usuario: initialData?.usuario_id || 
              initialData?.usuario_info?.id || 
              (typeof initialData?.usuario === "object" && initialData?.usuario?.id) ||
              initialData?.usuario ||
              "",
    });
    
    console.log('📝 Formulario inicializado con:', {
      id: initialData?.id,
      nombre: initialData?.nombre,
      activo: initialData?.activo,
      activo_boolean: Boolean(initialData?.activo),
      usuario: initialData?.usuario_id || initialData?.usuario_info?.id || initialData?.usuario,
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form); // mapping final se hace en la Page
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Cliente" : "Registrar Cliente"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Nombre</label>
          <input
            name="nombre" value={form.nombre} onChange={handleChange} required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Apellido */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Apellido</label>
          <input
            name="apellido" value={form.apellido} onChange={handleChange} required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* NIT */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">NIT</label>
          <input
            name="nit" value={form.nit} onChange={handleChange} required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ingrese el NIT"
          />
          <p className="text-xs text-gray-500 mt-1">
            El NIT debe ser único en el sistema
          </p>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Teléfono</label>
          <input
            name="telefono" value={form.telefono} onChange={handleChange}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Dirección - Campo completo */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Dirección</label>
        <input
          name="direccion" value={form.direccion} onChange={handleChange}
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de Cliente */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Tipo de Cliente</label>
          <select
            name="tipo_cliente" value={form.tipo_cliente} onChange={handleChange} required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="NATURAL">Natural</option>
            <option value="EMPRESA">Empresa</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Estado</label>
          <select
            name="activo" 
            value={form.activo ? "true" : "false"}
            onChange={(e)=>setForm(f=>({ ...f, activo: e.target.value === "true" }))}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Usuario Asociado - Campo completo */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Usuario Asociado (Opcional)</label>
        <select
          name="usuario"
          value={typeof form.usuario === "object" ? form.usuario?.id : (form.usuario || "")}
          onChange={(e)=>{
            const id = Number(e.target.value);
            const found = usuarios.find(u => u.id === id);
            setForm(f=>({ ...f, usuario: found || id }));
          }}
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Sin usuario asociado</option>
          {usuarios.map(u => (
            <option key={u.id} value={u.id}>
              {u.username} ({u.email})
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Relación uno a uno: Un usuario solo puede asociarse a un cliente
        </p>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 mt-6">
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

export default ClienteForm;