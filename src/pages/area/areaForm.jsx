import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const AreaForm = ({ onSubmit, onCancel, initialData, loading, viewData }) => {
  const [formData, setFormData] = useState({
    nombre: "",
  });
  
  const isViewing = !!viewData;

  useEffect(() => {
    const dataSource = viewData || initialData;
    if (dataSource) {
      setFormData({
        nombre: dataSource.nombre || "",
      });
    }
  }, [initialData, viewData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre.trim()) {
      alert("El nombre del área es requerido");
      return;
    }
    
    onSubmit(formData);
  };

  const isEditing = !!initialData;
  const title = isViewing 
    ? "Ver Área" 
    : isEditing 
    ? "Editar Área" 
    : "Registrar Área";

  return (
    <StyledForm title={title} onSubmit={handleSubmit}>
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="nombre">
          Nombre del Área *
        </label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          disabled={isViewing}
          required
          maxLength={100}
          className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isViewing ? 'bg-gray-100 text-gray-600' : 'bg-gray-50'
          }`}
          placeholder="Ingrese el nombre del área"
        />
        <small className="text-gray-500 text-xs mt-1">
          Máximo 100 caracteres
        </small>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button variant="cancelar" onClick={onCancel} type="button">
            {isViewing ? "Volver" : "Cancelar"}
          </Button>
        )}
        {!isViewing && (
          <Button variant="guardar" type="submit" disabled={loading}>
            {loading 
              ? "Guardando..." 
              : isEditing 
              ? "Guardar Cambios" 
              : "Guardar"
            }
          </Button>
        )}
      </div>
    </StyledForm>
  );
};

export default AreaForm;
