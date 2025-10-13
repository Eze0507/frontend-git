import React, { useEffect, useState } from "react";
import AreaList from "./areaList";
import AreaForm from "./areaForm";
import SuccessNotification from "../../components/SuccessNotification";
import { getAreas, createArea, updateArea, deleteArea } from "../../api/areaApi";

const AreaPage = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [error, setError] = useState("");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Cargar áreas
  const fetchAreas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAreas();
      setAreas(data || []);
    } catch (error) {
      console.error("Error al cargar áreas:", error);
      setError("Error al cargar las áreas");
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // Crear o editar área
  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");
    try {
      if (editingArea) {
        await updateArea(editingArea.id, formData);
        setSuccessMessage("¡Área actualizada exitosamente!");
      } else {
        await createArea(formData);
        setSuccessMessage("¡Área guardada exitosamente!");
      }
      setShowForm(false);
      setEditingArea(null);
      setViewData(null);
      setShowSuccessNotification(true);
      await fetchAreas(); // Recargar la lista
    } catch (error) {
      console.error("Error al guardar área:", error);
      
      // Manejo de errores más específico
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.nombre) {
          setError(`Error en el nombre: ${errorData.nombre.join(', ')}`);
        } else {
          setError("Datos inválidos. Verifique la información ingresada.");
        }
      } else if (error.response?.status === 409) {
        setError("Ya existe un área con ese nombre.");
      } else {
        setError("Error al guardar el área. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Eliminar área
  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro que desea eliminar esta área?")) return;
    
    setLoading(true);
    setError("");
    try {
      await deleteArea(id);
      setSuccessMessage("¡Área eliminada exitosamente!");
      setShowSuccessNotification(true);
      await fetchAreas(); // Recargar la lista
    } catch (error) {
      console.error("Error al eliminar área:", error);
      
      if (error.response?.status === 404) {
        setError("El área no existe o ya fue eliminada.");
      } else if (error.response?.status === 409 || error.response?.status === 400) {
        setError("No se puede eliminar el área porque está siendo utilizada.");
      } else {
        setError("Error al eliminar el área. Intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Mostrar formulario para nueva área
  const handleAddNew = () => {
    setEditingArea(null);
    setViewData(null);
    setError("");
    setShowForm(true);
  };

  // Mostrar formulario para editar
  const handleEdit = (area) => {
    console.log("Datos del área para editar:", area); // Debug log
    setEditingArea(area);
    setViewData(null);
    setError("");
    setShowForm(true);
  };

  // Mostrar formulario para ver
  const handleView = (area) => {
    console.log("Datos del área para ver:", area); // Debug log
    setViewData(area);
    setEditingArea(null);
    setError("");
    setShowForm(true);
  };

  // Cancelar formulario
  const handleCancel = () => {
    setShowForm(false);
    setEditingArea(null);
    setViewData(null);
    setError("");
  };

  return (
    <div className="p-4">
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        duration={3000}
      />
      
      {/* Mostrar errores */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Indicador de carga global */}
      {loading && !showForm && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
          Cargando...
        </div>
      )}

      {/* Siempre renderiza la tabla, el modal va encima */}
      <AreaList
        areas={areas}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
      />
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <AreaForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={editingArea}
            viewData={viewData}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default AreaPage;
