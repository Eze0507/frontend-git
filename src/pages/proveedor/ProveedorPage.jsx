import React, { useEffect, useState } from "react";
import ProveedorList from "./ProveedorList";
import ProveedorForm from "./ProveedorForm";
import ProveedorDetails from "./ProveedorDetails";
import SuccessNotification from "../../components/SuccessNotification";
import { getAllProveedor, createProveedor, updateProveedor, deleteProveedor, getProveedor } from "../../api/proveedorApi";

const ProveedorPage = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [viewProveedor, setViewProveedor] = useState(null);
  const [error, setError] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar proveedores
  const fetchProveedores = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("🔍 Cargando proveedores...");
      const data = await getAllProveedor();
      console.log("✅ Proveedores cargados:", data);
      setProveedores(data || []);
    } catch (error) {
      console.error("❌ Error al cargar proveedores:", error);
      console.error("Error completo:", error.response || error);
      setError("Error al cargar los proveedores");
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProveedores();
  }, []);

  // Crear o editar proveedor
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");
    try {
      if (editingProveedor) {
        await updateProveedor(editingProveedor.id, formData);
        setSuccessMessage("¡Proveedor actualizado exitosamente!");
      } else {
        await createProveedor(formData);
        setSuccessMessage("¡Proveedor guardado exitosamente!");
      }
      setShowForm(false);
      setEditingProveedor(null);
      setShowSuccessNotification(true);
      await fetchProveedores(); // Recargar la lista
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      
      // Manejo de errores más específico
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMessage = "Datos inválidos. Verifique la información ingresada.";
        
        if (errorData.nombre) {
          errorMessage = `Error en el nombre: ${errorData.nombre.join(', ')}`;
        } else if (errorData.email) {
          errorMessage = `Error en el email: ${errorData.email.join(', ')}`;
        } else if (errorData.telefono) {
          errorMessage = `Error en el teléfono: ${errorData.telefono.join(', ')}`;
        }
        
        setError(errorMessage);
      } else if (error.response?.status === 409) {
        setError("Ya existe un proveedor con esos datos.");
      } else {
        setError("Error al guardar el proveedor. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Eliminar proveedor
  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro que desea eliminar este proveedor?")) return;
    
    setLoading(true);
    setError("");
    try {
      await deleteProveedor(id);
      setSuccessMessage("¡Proveedor eliminado exitosamente!");
      setShowSuccessNotification(true);
      await fetchProveedores(); // Recargar la lista
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      
      if (error.response?.status === 404) {
        setError("El proveedor no existe o ya fue eliminado.");
      } else if (error.response?.status === 409 || error.response?.status === 400) {
        setError("No se puede eliminar el proveedor porque está siendo utilizado.");
      } else {
        setError("Error al eliminar el proveedor. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Mostrar formulario para nuevo proveedor
  const handleAddNew = () => {
    setEditingProveedor(null);
    setError("");
    setShowForm(true);
    setShowDetails(false);
  };

  // Mostrar formulario para editar
  const handleEdit = async (proveedor) => {
    console.log("Datos del proveedor desde tabla:", proveedor);
    
    // Obtener los datos completos del proveedor desde el backend
    try {
      setLoading(true);
      const proveedorCompleto = await getProveedor(proveedor.id);
      console.log("Datos completos del proveedor:", proveedorCompleto);
      setEditingProveedor(proveedorCompleto);
      setError("");
      setShowForm(true);
      setShowDetails(false);
    } catch (error) {
      console.error("Error al obtener datos del proveedor:", error);
      setError("Error al cargar los datos del proveedor");
    } finally {
      setLoading(false);
    }
  };

  // Mostrar detalles del proveedor
  const handleView = async (proveedor) => {
    console.log("Datos del proveedor desde tabla:", proveedor);
    
    // Obtener los datos completos del proveedor desde el backend
    try {
      setLoading(true);
      const proveedorCompleto = await getProveedor(proveedor.id);
      console.log("Datos completos del proveedor:", proveedorCompleto);
      setViewProveedor(proveedorCompleto);
      setError("");
      setShowDetails(true);
      setShowForm(false);
    } catch (error) {
      console.error("Error al obtener datos del proveedor:", error);
      setError("Error al cargar los datos del proveedor");
    } finally {
      setLoading(false);
    }
  };

  // Cancelar formulario
  const handleCancel = () => {
    setShowForm(false);
    setEditingProveedor(null);
    setError("");
  };

  // Cerrar detalles
  const handleCloseDetails = () => {
    setShowDetails(false);
    setViewProveedor(null);
  };

  return (
    <div className="relative">
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        duration={3000}
      />
      
      {/* Tabla de proveedores */}
      <ProveedorList
        proveedores={proveedores}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
        onView={handleView}
        loading={loading}
        error={error}
        onRetry={fetchProveedores}
      />

      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <ProveedorForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={editingProveedor}
            loading={loading}
          />
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="max-w-4xl w-full mx-4">
            <ProveedorDetails
              proveedor={viewProveedor}
              onClose={handleCloseDetails}
              onEdit={() => handleEdit(viewProveedor)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedorPage;
