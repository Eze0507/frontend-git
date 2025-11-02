import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const ProveedorForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    correo: "",
    direccion: "",
    nit: ""
  });  

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        contacto: initialData.contacto || "",
        telefono: initialData.telefono || "",
        correo: initialData.correo || "",
        direccion: initialData.direccion || "",
        nit: initialData.nit || ""
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    if (formData.telefono && !/^\d{7,15}$/.test(formData.telefono.replace(/[\s-]/g, ''))) {
      newErrors.telefono = "Formato de teléfono inválido (7-15 dígitos)";
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "Formato de correo inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const isEditing = !!initialData;
  const title = isEditing ? "Editar Proveedor" : "Registrar Proveedor";

  return (
    <StyledForm title={title} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="nombre">
            Nombre *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            maxLength={100}
            className={`w-full px-3 py-2 rounded-md border ${
              errors.nombre ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50`}
            placeholder="Ej: Tigo"
          />
          {errors.nombre && (
            <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="contacto">
            Persona de Contacto
          </label>
          <input
            type="text"
            id="contacto"
            name="contacto"
            value={formData.contacto}
            onChange={handleChange}
            maxLength={100}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            placeholder="Ej: Carlitos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="telefono">
            Teléfono
          </label>
          <input
            type="tel"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            maxLength={20}
            className={`w-full px-3 py-2 rounded-md border ${
              errors.telefono ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50`}
            placeholder="Ej: 78455695"
          />
          {errors.telefono && (
            <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="correo">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            maxLength={254}
            className={`w-full px-3 py-2 rounded-md border ${
              errors.correo ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50`}
            placeholder="Ej: tigo@hotmail.com"
          />
          {errors.correo && (
            <p className="text-red-500 text-xs mt-1">{errors.correo}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="nit">
            NIT
          </label>
          <input
            type="text"
            id="nit"
            name="nit"
            value={formData.nit}
            onChange={handleChange}
            maxLength={25}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            placeholder="Ej: 74589632"
          />
          <small className="text-gray-500 text-xs">
            Debe ser único
          </small>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="direccion">
          Dirección
        </label>
        <textarea
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          rows="3"
          maxLength={200}
          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 resize-none"
          placeholder="Ej: Plan 3000"
        />
        <small className="text-gray-500 text-xs">
          Máximo 200 caracteres
        </small>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button variant="cancelar" onClick={onCancel} type="button">
            Cancelar
          </Button>
        )}
        <Button variant="guardar" type="submit" disabled={loading}>
          {loading 
            ? "Guardando..." 
            : isEditing 
            ? "Guardar Cambios" 
            : "Guardar"
          }
        </Button>
      </div>
    </StyledForm>
  );
};

export default ProveedorForm;
