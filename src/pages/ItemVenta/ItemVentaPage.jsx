import React, { useEffect, useState } from "react";
import ItemVentaList from "./ItemVentaList";
import ItemVentaForm from "./ItemVentaForm";
import SuccessNotification from "../../components/SuccessNotification";
import axios from "axios";

const ItemVentaPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar ítems de venta
  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/items/");
      // Solo ítems de tipo "Item de venta"
      setItems(response.data.filter((item) => item.tipo === "Item de venta"));
    } catch (error) {
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
        setSuccessMessage("¡Ítem de venta actualizado exitosamente!");
      } else {
        await axios.post("http://127.0.0.1:8000/api/items/", formData);
        setSuccessMessage("¡Ítem de venta guardado exitosamente!");
      }
      setShowForm(false);
      setEditingItem(null);
      setShowSuccessNotification(true);
      fetchItems();
    } catch (error) {
      alert("Error al guardar el ítem de venta");
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
      alert("Error al eliminar el ítem de venta");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar formulario para nuevo ítem
  const handleAddNew = () => {
    setEditingItem(null);
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
    console.log("Datos del ítem para editar:", originalItem); // Debug log
    setEditingItem(originalItem);
    setViewingItem(null);
    setShowForm(true);
  };

  // Mostrar vista de detalle
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
    console.log("Datos del ítem para ver:", originalItem); // Debug log
    setViewingItem(originalItem);
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
      <ItemVentaList
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
        onView={handleView}
        loading={loading}
      />
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <ItemVentaForm
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

export default ItemVentaPage;
