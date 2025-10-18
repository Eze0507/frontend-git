import React, { useEffect, useState } from "react";
import ItemVentaList from "./ItemVentaList";
import ItemVentaForm from "./ItemVentaForm";
import SuccessNotification from "../../components/SuccessNotification";
import { getAllItems, createItem, updateItem, deleteItem } from "../../api/itemsApi";

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
      const allItems = await getAllItems();
      // Solo ítems de tipo "Item de venta"
      setItems(allItems.filter((item) => item.tipo === "Item de venta"));
    } catch (error) {
      console.error("Error al cargar ítems de venta:", error);
      setItems([]);
      // Mostrar mensaje de error específico
      if (error.message.includes('sesión ha expirado')) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
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
        setSuccessMessage("¡Ítem de venta actualizado exitosamente!");
      } else {
        await createItem(formData);
        setSuccessMessage("¡Ítem de venta guardado exitosamente!");
      }
      setShowForm(false);
      setEditingItem(null);
      setShowSuccessNotification(true);
      fetchItems();
    } catch (error) {
      console.error("Error al guardar ítem de venta:", error);
      // Mostrar mensaje de error más específico
      if (error.message.includes('permisos')) {
        alert(error.message);
      } else if (error.message.includes('sesión ha expirado')) {
        alert(error.message);
      } else if (error.message.startsWith('{')) {
        // Error de validación del backend
        try {
          const errorData = JSON.parse(error.message);
          const errorMsg = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          alert(`Error al guardar el ítem de venta:\n${errorMsg}`);
        } catch {
          alert("Error al guardar el ítem de venta");
        }
      } else {
        alert(error.message || "Error al guardar el ítem de venta");
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
      setSuccessMessage("¡Ítem de venta eliminado exitosamente!");
      setShowSuccessNotification(true);
      fetchItems();
    } catch (error) {
      console.error("Error al eliminar ítem de venta:", error);
      alert(error.message || "Error al eliminar el ítem de venta");
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
