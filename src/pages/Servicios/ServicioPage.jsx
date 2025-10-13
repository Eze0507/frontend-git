import React, { useEffect, useState } from "react";
import ServicioList from "./ServicioList";
import ServicioForm from "./ServicioForm";
import SuccessNotification from "../../components/SuccessNotification";
import axios from "axios";
import { getAreas } from "../../api/areaApi";

const ServicioPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [areas, setAreas] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar áreas
  const fetchAreas = async () => {
    try {
      const areasData = await getAreas();
      setAreas(areasData || []);
      return areasData || [];
    } catch (error) {
      console.error("Error al cargar áreas:", error);
      return [];
    }
  };

  // Cargar servicios
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/items/");
      // Solo ítems de tipo "Servicio"
      const servicios = response.data.filter((item) => item.tipo === "Servicio");
      
      // Mapear servicios para incluir el nombre del área
      const areasData = areas.length > 0 ? areas : await fetchAreas();
      const serviciosConAreaNombre = servicios.map(servicio => {
        const area = areasData.find(a => a.id == servicio.area);
        return {
          ...servicio,
          area_nombre: area ? area.nombre : 'Área no encontrada'
        };
      });
      
      console.log("Servicios cargados:", serviciosConAreaNombre);
      setItems(serviciosConAreaNombre);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas().then(() => {
      fetchItems();
    });
  }, []);

  // Crear o editar servicio
  const handleSubmit = async (formData) => {
    setLoading(true);
    
    // Debug: Ver los datos que se están enviando
    console.log("Datos enviados al backend:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      let response;
      if (editingItem) {
        response = await axios.put(`http://127.0.0.1:8000/api/items/${editingItem.id}/`, formData, config);
        setSuccessMessage("¡Servicio actualizado exitosamente!");
      } else {
        response = await axios.post("http://127.0.0.1:8000/api/items/", formData, config);
        setSuccessMessage("¡Servicio guardado exitosamente!");
      }
      
      console.log("Respuesta del backend:", response.data);
      
      setShowForm(false);
      setEditingItem(null);
      setViewingItem(null);
      setShowSuccessNotification(true);
      fetchItems();
    } catch (error) {
      console.error("Error completo:", error);
      console.error("Respuesta del error:", error.response?.data);
      console.error("Status del error:", error.response?.status);
      
      if (error.response?.data) {
        const errorMsg = Object.entries(error.response.data)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        alert(`Error al guardar el servicio:\n${errorMsg}`);
      } else {
        alert("Error al guardar el servicio");
      }
    } finally {
      setLoading(false);
    }
  };

  // Eliminar servicio
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este servicio?")) return;
    setLoading(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/items/${id}/`);
      setSuccessMessage("¡Servicio eliminado exitosamente!");
      setShowSuccessNotification(true);
      fetchItems();
    } catch (error) {
      alert("Error al eliminar el servicio");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar formulario para nuevo servicio
  const handleAddNew = () => {
    setEditingItem(null);
    setViewingItem(null);
    setShowForm(true);
  };

  // Mostrar formulario para editar
  const handleEdit = async (item) => {
    console.log("Item original para editar:", item);
    
    // Si el item viene de la tabla, puede tener datos renderizados
    // Necesitamos encontrar el item original por ID
    let originalItem = item;
    if (item.id) {
      const foundItem = items.find(i => i.id === item.id);
      if (foundItem) {
        originalItem = foundItem;
      }
    }
    
    // Si no tenemos áreas cargadas, cargarlas primero
    let areasActualizadas = areas;
    if (areas.length === 0) {
      console.log("Cargando áreas para edición...");
      areasActualizadas = await fetchAreas();
    }
    
    // Asegurar que el item tenga el nombre del área para el modo edición
    const area = areasActualizadas.find(a => a.id == originalItem.area);
    const itemConAreaNombre = {
      ...originalItem,
      area_nombre: area ? area.nombre : (originalItem.area_nombre || 'Área no encontrada')
    };
    console.log("Editar servicio con área:", itemConAreaNombre);
    setEditingItem(itemConAreaNombre);
    setViewingItem(null);
    setShowForm(true);
  };

  // Mostrar formulario para ver
  const handleView = async (item) => {
    console.log("Item original para ver:", item);
    
    // Si el item viene de la tabla, puede tener datos renderizados
    // Necesitamos encontrar el item original por ID
    let originalItem = item;
    if (item.id) {
      const foundItem = items.find(i => i.id === item.id);
      if (foundItem) {
        originalItem = foundItem;
      }
    }
    
    // Si no tenemos áreas cargadas, cargarlas primero
    let areasActualizadas = areas;
    if (areas.length === 0) {
      console.log("Cargando áreas para vista...");
      areasActualizadas = await fetchAreas();
    }
    
    // Asegurar que el item tenga el nombre del área para el modo vista
    const area = areasActualizadas.find(a => a.id == originalItem.area);
    console.log("Área encontrada:", area);
    console.log("Áreas disponibles:", areasActualizadas);
    const itemConAreaNombre = {
      ...originalItem,
      area_nombre: area ? area.nombre : (originalItem.area_nombre || 'Área no encontrada')
    };
    console.log("Ver servicio con área:", itemConAreaNombre);
    setViewingItem(itemConAreaNombre);
    setEditingItem(null);
    setShowForm(true);
  };

  // Cancelar formulario
  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
  };

  return (
    <div className="p-4">
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        duration={3000}
      />
      {/* Siempre renderiza la tabla, el modal va encima */}
      <ServicioList
        items={items}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
      />
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <ServicioForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={editingItem}
            viewData={viewingItem}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default ServicioPage;
