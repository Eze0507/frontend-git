import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";

const ESTADO_CHOICES = [
  { value: "Disponible", label: "Disponible" },
  { value: "No disponible", label: "No disponible" },
];

const ItemVentaForm = ({ onSubmit, onCancel, initialData, viewData, loading }) => {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    fabricante: "",
    precio: "",
    costo: "",
    stock: "",
    imagen: null, // Será un archivo
    estado: "Disponible",
    tipo: "Item de venta", // Fijo para este formulario
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    console.log("useEffect - initialData:", initialData); // Debug log
    console.log("useEffect - viewData:", viewData); // Debug log
    
    // Función auxiliar para extraer valor de forma segura
    const extractValue = (value) => {
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return "";
      return String(value);
    };
    
    if (initialData) {
      setFormData({
        codigo: extractValue(initialData.codigo),
        nombre: extractValue(initialData.nombre),
        descripcion: extractValue(initialData.descripcion),
        fabricante: extractValue(initialData.fabricante),
        precio: extractValue(initialData.precio),
        costo: extractValue(initialData.costo),
        stock: extractValue(initialData.stock),
        imagen: null, // No pre-cargamos archivo
        estado: extractValue(initialData.estado) || "Disponible",
        tipo: "Item de venta",
      });
      // Establecer la imagen actual para edición
      if (initialData.imagen && typeof initialData.imagen === "string") {
        console.log("Imagen de initialData:", initialData.imagen); // Debug log
        setImagePreview(initialData.imagen);
      }
    } else if (viewData) {
      setFormData({
        codigo: extractValue(viewData.codigo),
        nombre: extractValue(viewData.nombre),
        descripcion: extractValue(viewData.descripcion),
        fabricante: extractValue(viewData.fabricante),
        precio: extractValue(viewData.precio),
        costo: extractValue(viewData.costo),
        stock: extractValue(viewData.stock),
        imagen: null,
        estado: extractValue(viewData.estado) || "Disponible",
        tipo: "Item de venta",
      });
      // Establecer la imagen actual para visualización
      if (viewData.imagen && typeof viewData.imagen === "string") {
        console.log("Imagen de viewData:", viewData.imagen); // Debug log
        setImagePreview(viewData.imagen);
      }
    }
  }, [initialData, viewData]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      
      // Crear vista previa
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
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
  const isViewing = !!viewData;

  return (
    <StyledForm title={isViewing ? "Ver Ítem de Venta" : isEditing ? "Editar Ítem de Venta" : "Registrar Ítem de Venta"} onSubmit={handleSubmit}>
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
            required
            disabled={isViewing}
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
              isViewing ? 'bg-gray-100 text-gray-600' : 'bg-white hover:border-gray-300'
            }`}
            placeholder="Ej: IV001"
          />
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center" htmlFor="nombre">
            <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M8 11v6a2 2 0 002 2h4a2 2 0 002-2v-6M8 11h8" />
            </svg>
            Nombre
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            disabled={isViewing}
            className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
              isViewing ? 'bg-gray-100 text-gray-600' : 'bg-white hover:border-gray-300'
            }`}
            placeholder="Ej: Filtro de Aceite"
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
            placeholder="Ej: Fram, GKN"
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
            min="0"
            step="0.01"
            disabled={isViewing}
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
            min="0"
            step="0.01"
            disabled={isViewing}
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
            min="0"
            disabled={isViewing}
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
          placeholder="Describe las características y especificaciones del ítem de venta..."
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
              accept="image/*"
              onChange={handleChange}
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
        
        {/* Vista previa de imagen nueva */}
        {imagePreview && formData.imagen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Nueva imagen:
            </p>
            <div className="flex justify-center">
              <img 
                src={imagePreview} 
                alt="Vista previa" 
                className="w-48 h-48 object-cover rounded-xl border-2 border-gray-200 shadow-lg"
              />
            </div>
          </div>
        )}
        
        {/* Imagen existente */}
        {(initialData?.imagen || viewData?.imagen) && !formData.imagen && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {isViewing ? "Imagen:" : "Imagen actual:"}
            </p>
            <div className="flex justify-center">
              <img 
                src={initialData?.imagen || viewData?.imagen} 
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
        {!imagePreview && !initialData?.imagen && !viewData?.imagen && isViewing && (
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
            {isViewing ? "Cerrar" : "Cancelar"}
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

export default ItemVentaForm;
