import React, { useEffect, useState } from "react";
import StyledForm from "../../components/form";      // igual que en UserForm
import Button from "../../components/button";        // igual que en UserForm

const EmpleadoForm = ({ onSubmit, onCancel, initialData, cargos = [], usuarios = [], areas = [], loading }) => {
  const [form, setForm] = useState({
    id: null,
    nombre: "", apellido: "", ci: "",
    direccion: "", telefono: "",
    sexo: "M", estado: true, sueldo: 0,
    cargo: "", usuario: "", area: "",
  });

  useEffect(() => {
    console.log('📋 Datos iniciales recibidos:', initialData);
    
    setForm({
      id: initialData?.id || null,
      nombre: initialData?.nombre || "",
      apellido: initialData?.apellido || "",
      ci: initialData?.ci || "",
      direccion: initialData?.direccion || "",
      telefono: initialData?.telefono || "",
      sexo: initialData?.sexo || "M",
      estado: initialData?.estado !== undefined ? Boolean(initialData.estado) : true,
      sueldo: initialData?.sueldo ?? 0,
      // Manejo mejorado para cargo - priorizar cargo_obj si existe
      cargo: initialData?.cargo_obj?.id || 
             (typeof initialData?.cargo === "object" && initialData?.cargo?.id) ||
             initialData?.cargo ||
             "",
      // Manejo mejorado para usuario - priorizar usuario_obj si existe
      usuario: initialData?.usuario_obj?.id || 
              (typeof initialData?.usuario === "object" && initialData?.usuario?.id) ||
              initialData?.usuario ||
              "",
      // Manejo mejorado para área - priorizar area_obj si existe
      area: initialData?.area_obj?.id || 
            (typeof initialData?.area === "object" && initialData?.area?.id) ||
            initialData?.area ||
            "",
    });
    
    console.log('📝 Formulario inicializado con:', {
      id: initialData?.id,
      nombre: initialData?.nombre,
      estado: initialData?.estado,
      estado_boolean: Boolean(initialData?.estado),
      cargo: initialData?.cargo_obj?.id || initialData?.cargo,
      usuario: initialData?.usuario_obj?.id || initialData?.usuario,
      area: initialData?.area_obj?.id || initialData?.area,
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form); // mapping final se hace en la Page (toApiEmpleado)
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Empleado" : "Registrar Empleado"} onSubmit={handleSubmit}>
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

        {/* CI */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">CI</label>
          <input
            name="ci" value={form.ci} onChange={handleChange} required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
        {/* Sexo */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Sexo</label>
          <select
            name="sexo" value={form.sexo} onChange={handleChange} required
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Estado</label>
          <select
            name="estado" 
            value={form.estado ? "true" : "false"}
            onChange={(e)=>setForm(f=>({ ...f, estado: e.target.value === "true" }))}
            className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Sueldo - Campo completo */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Sueldo</label>
        <input
          type="number" name="sueldo" value={form.sueldo}
          onChange={(e)=>setForm(f=>({ ...f, sueldo: e.target.value }))}
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="0.00"
        />
      </div>

      {/* Cargo - Campo completo */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Cargo</label>
        <select
          name="cargo"
          value={typeof form.cargo === "object" ? form.cargo?.id : (form.cargo || "")}
          onChange={(e)=>{
            const id = Number(e.target.value);
            const found = cargos.find(c => c.id === id);
            setForm(f=>({ ...f, cargo: found || id }));
          }}
          required
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecciona un cargo</option>
          {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Área - Campo completo */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Área</label>
        <select
          name="area"
          value={typeof form.area === "object" ? form.area?.id : (form.area || "")}
          onChange={(e)=>{
            const id = Number(e.target.value);
            const found = areas.find(a => a.id === id);
            setForm(f=>({ ...f, area: found || id }));
          }}
          required
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Selecciona un área</option>
          {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Selecciona el área donde trabajará este empleado
        </p>
      </div>

      {/* Usuario (Opcional) - Campo completo */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700">Usuario Asociado</label>
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
          Opcional: Asocia este empleado con un usuario del sistema
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

export default EmpleadoForm;
