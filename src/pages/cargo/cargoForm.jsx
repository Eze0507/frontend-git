import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const CargoForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    sueldo: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || "",
        descripcion: initialData.descripcion || "",
        sueldo: initialData.sueldo || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isEditing = !!initialData;

  return (
    <StyledForm title={isEditing ? "Editar Cargo" : "Registrar Cargo"} onSubmit={handleSubmit}>
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="nombre">
          Nombre del Cargo
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="descripcion">
          Descripción
        </label>
        <input
          type="text"
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {/* Sueldo */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="sueldo">
          Sueldo
        </label>
        <input
          type="number"
          id="sueldo"
          name="sueldo"
          value={formData.sueldo}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="w-full px-3 py-2 rounded-md bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-2">
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

export default CargoForm;
