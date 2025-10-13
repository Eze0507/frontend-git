import React, { useState, useEffect } from "react";
import StyledForm from "../../components/form";
import Button from "../../components/button";
import { getAreas } from "../../api/areaApi";

const ESTADO_CHOICES = [
  { value: "Disponible", label: "Disponible" },
  { value: "No disponible", label: "No disponible" },
];

const ServicioForm = ({ onSubmit, onCancel, initialData, viewData, loading }) => {
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    fabricante: "",
    precio: "",
    stock: "",
    imagen: null, // archivo
    estado: "Disponible",
    area: "",
    tipo: "Servicio",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Cargar áreas disponibles
  const fetchAreas = async () => {
    setLoadingAreas(true);
    try {
      const data = await getAreas();
      setAreas(data || []);
    } catch (error) {
      console.error("Error al cargar áreas:", error);
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    // Función auxiliar para extraer valor de forma segura
    const extractValue = (value) => {
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return "";
      return String(value);
    };
    
    if (initialData) {
      console.log("InitialData recibido:", initialData);
      setFormData({
        codigo: extractValue(initialData.codigo),
        nombre: extractValue(initialData.nombre),
        descripcion: extractValue(initialData.descripcion),
        fabricante: extractValue(initialData.fabricante),
        precio: extractValue(initialData.precio),
        stock: extractValue(initialData.stock),
        imagen: null, // no pre-cargamos archivo
        estado: extractValue(initialData.estado) || "Disponible",
        area: extractValue(initialData.area),
        tipo: "Servicio",
      });
      if (initialData.imagen && typeof initialData.imagen === "string") {
        setImagePreview(initialData.imagen);
      }
    } else if (viewData) {
      console.log("ViewData recibido:", viewData);
      console.log("Áreas disponibles:", areas);
      setFormData({
        codigo: extractValue(viewData.codigo),
        nombre: extractValue(viewData.nombre),
        descripcion: extractValue(viewData.descripcion),
        fabricante: extractValue(viewData.fabricante),
        precio: extractValue(viewData.precio),
        stock: extractValue(viewData.stock),
        imagen: null,
        estado: extractValue(viewData.estado) || "Disponible",
        area: extractValue(viewData.area),
        tipo: "Servicio",
      });
    }
  }, [initialData, viewData, areas]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
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
    
    // Validaciones básicas
    if (!formData.area) {
      alert("Debe seleccionar un área para el servicio");
      return;
    }
    
    // Validación específica para campos requeridos
    if (!formData.codigo.trim()) {
      alert("El código es requerido");
      return;
    }
    
    if (!formData.nombre.trim()) {
      alert("El nombre es requerido");
      return;
    }
    
    console.log("Datos del formulario antes de enviar:", formData);
    
    const data = new FormData();
    
    // Agregar todos los campos al FormData
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        data.append(key, value);
        console.log(`Agregando al FormData: ${key} = ${value}`);
      }
    });
    
    // Verificar que los campos críticos estén presentes
    if (!data.has('area')) {
      console.error("¡El área no está en el FormData!");
      data.append('area', formData.area);
    }
    
    if (!data.has('tipo')) {
      data.append('tipo', 'Servicio');
    }
    
    // Verificar que el área se está enviando
    console.log("Área seleccionada:", formData.area);
    console.log("FormData completo:", Array.from(data.entries()));
    
    onSubmit(data);
  };

  const isEditing = !!initialData;
  const isViewing = !!viewData;

  return (
    <StyledForm title={isViewing ? "Ver Servicio" : isEditing ? "Editar Servicio" : "Registrar Servicio"} onSubmit={handleSubmit}>
      {/* Código */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="codigo">
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
          className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isViewing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
        />
      </div>
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="nombre">
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
          className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isViewing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
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
          disabled={isViewing}
          className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isViewing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
        />
      </div>
      {/* Precio */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="precio">
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
          className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isViewing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
          placeholder="0.00"
        />
      </div>
      {/* Estado */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="estado">
          Estado
        </label>
        <select
          id="estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          disabled={isViewing}
          className={`w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isViewing ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50'}`}
        >
          {ESTADO_CHOICES.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {/* Área */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="area">
          Área {!isViewing && '*'}
        </label>
        {isViewing ? (
          // Modo vista: mostrar el nombre del área
          <div className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600">
            {(() => {
              console.log("FormData.area:", formData.area, typeof formData.area);
              console.log("ViewData:", viewData);
              console.log("Areas disponibles:", areas);
              
              // Primero intentar usar area_nombre si está disponible
              if (viewData?.area_nombre && viewData.area_nombre !== 'Área no encontrada') {
                console.log("Usando area_nombre del viewData:", viewData.area_nombre);
                return viewData.area_nombre;
              }
              
              // Si no, buscar en el array de areas con comparación más robusta
              const area = areas.find(area => {
                const areaId = String(area.id);
                const formAreaId = String(formData.area);
                console.log(`Comparando área ${areaId} con formData.area ${formAreaId}`);
                return areaId === formAreaId;
              });
              
              if (area) {
                console.log("Área encontrada:", area.nombre);
                return area.nombre;
              }
              
              // Como último recurso
              console.log("No se encontró el área");
              return 'Área no encontrada';
            })()}
          </div>
        ) : loadingAreas ? (
          <div className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-gray-500">
            Cargando áreas...
          </div>
        ) : (
          <select
            id="area"
            name="area"
            value={formData.area}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          >
            <option value="">Seleccione un área</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.nombre}
              </option>
            ))}
          </select>
        )}
        {!isViewing && areas.length === 0 && !loadingAreas && (
          <small className="text-red-500 text-xs mt-1">
            No hay áreas disponibles. Debe crear al menos un área primero.
          </small>
        )}
      </div>
      {/* Botones */}
      <div className="flex justify-end space-x-2 pt-2">
        {onCancel && (
          <Button variant="cancelar" onClick={onCancel} type="button">
            {isViewing ? "Cerrar" : "Cancelar"}
          </Button>
        )}
        {!isViewing && (
          <Button variant="guardar" type="submit" disabled={loading}>
            {isEditing ? "Guardar Cambios" : "Guardar"}
          </Button>
        )}
      </div>
    </StyledForm>
  );
};

export default ServicioForm;
