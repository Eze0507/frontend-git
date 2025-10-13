import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const ESTADO_CHOICES = [
  { value: "Disponible", label: "Disponible" },
  { value: "No disponible", label: "No disponible" },
];

const ItemTallerForm = ({ onSubmit, onCancel, initialData, loading, viewData }) => {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    fabricante: "",
    precio: "",
    costo: "",
    stock: "",
    imagen: null,
    estado: "Disponible",
    area: "",
    tipo: "Item de taller", // Fijo para este formulario
  });
  
  const [imagePreview, setImagePreview] = useState("");
  
  const isViewing = !!viewData;

  useEffect(() => {
    // Función auxiliar para extraer valor de forma segura
    const extractValue = (value) => {
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return "";
      return String(value);
    };
    
    const dataSource = viewData || initialData;
    if (dataSource) {
      setFormData({
        codigo: extractValue(dataSource.codigo),
        nombre: extractValue(dataSource.nombre),
        descripcion: extractValue(dataSource.descripcion),
        fabricante: extractValue(dataSource.fabricante),
        precio: extractValue(dataSource.precio),
        costo: extractValue(dataSource.costo),
        stock: extractValue(dataSource.stock),
        imagen: null, // Siempre null para archivos nuevos
        estado: extractValue(dataSource.estado) || "Disponible",
        area: extractValue(dataSource.area),
        tipo: "Item de taller",
      });
      
      // Establecer la imagen existente como preview
      if (dataSource.imagen && typeof dataSource.imagen === "string") {
        setImagePreview(dataSource.imagen);
      } else {
        setImagePreview("");
      }
    }
  }, [initialData, viewData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      
      // Crear vista previa para archivo nuevo
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        // Si se cancela la selección, volver a la imagen original
        const dataSource = viewData || initialData;
        if (dataSource?.imagen) {
          setImagePreview(dataSource.imagen);
        } else {
          setImagePreview("");
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        data.append(key, value);
      }
    });
    onSubmit(data);
  };

  const isEditing = !!initialData;
  const title = isViewing 
    ? "Ver Ítem de Taller" 
    : isEditing 
    ? "Editar Ítem de Taller" 
    : "Registrar Ítem de Taller";

  return (
    <StyledForm title={title} onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Código */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor="codigo">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            Código
          </label>
          <input
            type="text"
            id="codigo"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            disabled={isViewing}
            required
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
              isViewing ? 'bg-gray-100 text-gray-600' : 'bg-white hover:border-gray-300'
            }`}
            placeholder="Ej: IT001"
          />
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor="nombre">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            disabled={isViewing}
            required
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
              isViewing ? 'bg-gray-100 text-gray-600' : 'bg-white hover:border-gray-300'
            }`}
            placeholder="Ej: Llave de Impacto"
          />
        </div>

        {/* Fabricante */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor="fabricante">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Fabricante
          </label>
          <input
            type="text"
            id="fabricante"
            name="fabricante"
            value={formData.fabricante}
            onChange={handleChange}
            disabled={isViewing}
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
              isViewing ? 'bg-gray-100 text-gray-600' : 'bg-white hover:border-gray-300'
            }`}
            placeholder="Ej: VEVOR, Stanley"
          />
        </div>

        {/* Precio */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor="precio">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Precio
          </label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            disabled={isViewing}
            min="0"
            step="0.01"
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
              isViewing ? 'bg-gray-100 text-gray-600' : 'bg-white hover:border-gray-300'
            }`}
            placeholder="0.00"
          />
        </div>

        {/* Costo */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor="costo">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Costo
          </label>
          <input
            type="number"
            id="costo"
            name="costo"
            value={formData.costo}
            onChange={handleChange}
            disabled={isViewing}
            min="0"
            step="0.01"
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
              isViewing ? 'bg-gray-100 text-gray-600' : 'bg-white hover:border-gray-300'
            }`}
            placeholder="0.00"
          />
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor="stock">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Stock
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            disabled={isViewing}
            min="0"
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
              isViewing ? 'bg-gray-100 text-gray-600' : 'bg-white hover:border-gray-300'
            }`}
            placeholder="0"
          />
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor="estado">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Estado
          </label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            disabled={isViewing}
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
              isViewing ? 'bg-gray-100 text-gray-600' : 'bg-white hover:border-gray-300'
            }`}
          >
            {ESTADO_CHOICES.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Descripción - Ancho completo */}
      <div className="space-y-2 mt-6">
        <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor="descripcion">
          <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descripción
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          disabled={isViewing}
          rows="4"
          className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none ${
            isViewing ? 'bg-gray-100 text-gray-600' : 'bg-white hover:border-gray-300'
          }`}
          placeholder="Describe las características y especificaciones del ítem..."
        />
      </div>

      {/* Imagen - Ancho completo */}
      <div className="space-y-2 mt-6">
        <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor="imagen">
          <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Imagen
        </label>
        
        {!isViewing && (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors duration-200">
            <input
              type="file"
              id="imagen"
              name="imagen"
              onChange={handleChange}
              accept="image/*"
              className="hidden"
            />
            <label htmlFor="imagen" className="cursor-pointer">
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 font-medium">Haz clic para subir una imagen</p>
              <p className="text-gray-400 text-sm mt-1">PNG, JPG, GIF hasta 10MB</p>
            </label>
          </div>
        )}
        
        {/* Mostrar imagen (existente o nueva vista previa) */}
        {imagePreview && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {formData.imagen ? "Nueva imagen:" : isViewing ? "Imagen:" : "Imagen actual:"}
            </p>
            <div className="flex justify-center">
              <img
                src={imagePreview}
                alt="Imagen del ítem"
                className="w-48 h-48 object-cover rounded-xl border-2 border-gray-200 shadow-lg"
                onError={(e) => {
                  console.log("Error cargando imagen:", e.target.src);
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div style={{display: 'none'}} className="w-48 h-48 bg-gray-200 border-2 border-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-500 text-sm">Error al cargar imagen</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Caso sin imagen */}
        {!imagePreview && (
          <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-xl">Sin imagen</p>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
        {onCancel && (
          <Button variant="cancelar" onClick={onCancel} type="button">
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {isViewing ? "Volver" : "Cancelar"}
          </Button>
        )}
        {!isViewing && (
          <Button variant="guardar" type="submit" disabled={loading}>
            <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {isEditing ? "Guardar Cambios" : "Guardar"}
          </Button>
        )}
      </div>
    </StyledForm>
  );
};

export default ItemTallerForm;
