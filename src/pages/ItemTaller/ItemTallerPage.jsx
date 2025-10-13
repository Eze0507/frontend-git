import React, { useEffect, useState } from "react";
import ItemTallerList from "./ItemTallerList";
import ItemTallerForm from "./ItemTallerForm";
import SuccessNotification from "../../components/SuccessNotification";
import axios from "axios";

const ItemTallerPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar ítems de taller
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/items/");
      // Solo ítems de tipo "Item de taller"
      setItems(response.data.filter((item) => item.tipo === "Item de taller"));
    } catch (error) {
      // Manejo de error simple
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Crear o editar ítem
  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (editingItem) {
        // Si es FormData, usar PATCH para mejor compatibilidad con DRF
        if (formData instanceof FormData) {
          await axios.patch(`http://127.0.0.1:8000/api/items/${editingItem.id}/`, formData);
        } else {
          await axios.put(`http://127.0.0.1:8000/api/items/${editingItem.id}/`, formData);
        }
        setSuccessMessage("¡Ítem de taller actualizado exitosamente!");
      } else {
        await axios.post("http://127.0.0.1:8000/api/items/", formData);
        setSuccessMessage("¡Ítem de taller guardado exitosamente!");
      }
      setShowForm(false);
      setEditingItem(null);
      setViewData(null);
      setShowSuccessNotification(true);
      fetchItems();
    } catch (error) {
      // Manejo de error simple
      alert("Error al guardar el ítem de taller");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar ítem
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este ítem?")) return;
    setLoading(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/items/${id}/`);
      fetchItems();
    } catch (error) {
      alert("Error al eliminar el ítem de taller");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar formulario para nuevo ítem
  const handleAddNew = () => {
    setEditingItem(null);
    setViewData(null);
    setShowForm(true);
  };

  // Mostrar formulario para editar
  const handleEdit = (item) => {
    // Si el item viene de la tabla, puede tener datos renderizados
    // Necesitamos encontrar el item original por ID
    let originalItem = item;
    if (item.id) {
      const foundItem = items.find(i => i.id === item.id);
      if (foundItem) {
        originalItem = foundItem;
      }
    }
    console.log("Datos del ítem de taller para editar:", originalItem); // Debug log
    setEditingItem(originalItem);
    setViewData(null);
    setShowForm(true);
  };

  // Mostrar formulario para ver
  const handleView = (item) => {
    // Si el item viene de la tabla, puede tener datos renderizados
    // Necesitamos encontrar el item original por ID
    let originalItem = item;
    if (item.id) {
      const foundItem = items.find(i => i.id === item.id);
      if (foundItem) {
        originalItem = foundItem;
      }
    }
    console.log("Datos del ítem de taller para ver:", originalItem); // Debug log
    setViewData(originalItem);
    setEditingItem(null);
    setShowForm(true);
  };

  // Cancelar formulario
  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewData(null);
  };

  return (
    <div className="p-4 relative">
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        duration={3000}
      />
      {/* Siempre renderiza la tabla, el modal va encima */}
      <ItemTallerList
        items={items}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
        loading={loading}
      />
      {showForm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <ItemTallerForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={editingItem}
            viewData={viewData}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default ItemTallerPage;
