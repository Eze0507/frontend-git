import React, { useState, useEffect } from "react";
import Button from "../../components/button.jsx";

const NominaForm = ({ onSubmit, onCancel, initialData, loading }) => {
  const [formData, setFormData] = useState({
    mes: "",
    fecha_inicio: "",
    fecha_corte: "",
    estado: "Pendiente",
    generar_detalles: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        mes: initialData.mes || "",
        fecha_inicio: initialData.fecha_inicio || "",
        fecha_corte: initialData.fecha_corte || "",
        estado: initialData.estado || "Pendiente",
        generar_detalles: false
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.mes || formData.mes < 1 || formData.mes > 12) {
      alert('Por favor ingresa un mes válido (1-12)');
      return;
    }
    
    if (!formData.fecha_inicio || !formData.fecha_corte) {
      alert('Por favor completa todas las fechas');
      return;
    }
    
    if (new Date(formData.fecha_corte) < new Date(formData.fecha_inicio)) {
      alert('La fecha de corte debe ser posterior a la fecha de inicio');
      return;
    }

    onSubmit(formData);
  };

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {initialData ? "Editar Nómina" : "Nueva Nómina"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Mes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mes <span className="text-red-500">*</span>
            </label>
            <select
              name="mes"
              value={formData.mes}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 bg-white text-gray-700"
            >
              <option value="">Seleccionar mes...</option>
              {meses.map((mes, index) => (
                <option key={index + 1} value={index + 1}>
                  {mes} ({index + 1})
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 bg-white text-gray-700"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Pagada">Pagada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 bg-white text-gray-700"
            />
          </div>

          {/* Fecha Corte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Corte <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fecha_corte"
              value={formData.fecha_corte}
              onChange={handleChange}
              required
              className="w-full border rounded-md px-3 py-2 bg-white text-gray-700"
            />
          </div>
        </div>

        {/* Generar detalles automáticamente */}
        {!initialData && (
          <div className="mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="generar_detalles"
                checked={formData.generar_detalles}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-sm text-gray-700">
                Generar detalles automáticamente para todos los empleados activos
              </span>
            </label>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="cancelar"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="guardar"
            disabled={loading}
          >
            {loading ? "Guardando..." : (initialData ? "Actualizar" : "Crear Nómina")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NominaForm;
