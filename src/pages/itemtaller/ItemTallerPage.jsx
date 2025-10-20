import React, { useEffect, useState } from "react";
import ItemTallerList from "./ItemTallerList";
import ItemTallerForm from "./ItemTallerForm";
import SuccessNotification from "../../components/SuccessNotification";
import { getAllItems, createItem, updateItem, deleteItem } from "../../api/itemsApi";

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
      const allItems = await getAllItems();
      // Solo ítems de tipo "Item de taller"
      setItems(allItems.filter((item) => item.tipo === "Item de taller"));
    } catch (error) {
      console.error("Error al cargar ítems de taller:", error);
      setItems([]);
      // Mostrar mensaje de error específico
      if (error.message.includes('sesión ha expirado')) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        // Opcional: redirigir al login
        // window.location.href = '/login';
      }
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
        await updateItem(editingItem.id, formData);
        setSuccessMessage("¡Ítem de taller actualizado exitosamente!");
      } else {
        await createItem(formData);
        setSuccessMessage("¡Ítem de taller guardado exitosamente!");
      }
      setShowForm(false);
      setEditingItem(null);
      setViewData(null);
      setShowSuccessNotification(true);
      fetchItems();
    } catch (error) {
      console.error("Error al guardar ítem de taller:", error);
      // Mostrar mensaje de error más específico
      if (error.message.includes('permisos')) {
        alert(error.message);
      } else if (error.message.includes('sesión ha expirado')) {
        alert(error.message);
        // Opcional: redirigir al login
        // window.location.href = '/login';
      } else if (error.message.startsWith('{')) {
        // Error de validación del backend
        try {
          const errorData = JSON.parse(error.message);
          const errorMsg = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          alert(`Error al guardar el ítem de taller:\n${errorMsg}`);
        } catch {
          alert("Error al guardar el ítem de taller");
        }
      } else {
        alert(error.message || "Error al guardar el ítem de taller");
      }
    } finally {
      setLoading(false);
    }
  };

  // Eliminar ítem
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este ítem?")) return;
    setLoading(true);
    try {
      await deleteItem(id);
      setSuccessMessage("¡Ítem de taller eliminado exitosamente!");
      setShowSuccessNotification(true);
      fetchItems();
    } catch (error) {
      console.error("Error al eliminar ítem de taller:", error);
      alert(error.message || "Error al eliminar el ítem de taller");
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
