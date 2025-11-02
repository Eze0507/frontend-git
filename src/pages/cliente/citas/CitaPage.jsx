import React, { useState, useEffect } from "react";
import CitaCalendar from "./CitaCalendar.jsx";
import CitaForm from "./CitaForm.jsx";
import CitaDetail from "./CitaDetail.jsx";
import { fetchAllCitas, createCita, updateCita, deleteCita } from "../../../api/citasApi.jsx";
import { fetchAllClientes } from "../../../api/clientesApi.jsx";
import { fetchAllVehiculos } from "../../../api/vehiculoApi.jsx";
import { fetchAllEmpleados } from "../../../api/empleadosApi.jsx";

const CitaPage = () => {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedCita, setSelectedCita] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadCitas();
    loadClientes();
    loadVehiculos();
    loadEmpleados();
  }, []);

  const loadCitas = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCitas();
      setCitas(data);
    } catch (error) {
      console.error("Error al cargar citas:", error);
      alert("Error al cargar las citas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const data = await fetchAllClientes();
      setClientes(data.filter((c) => c.activo !== false));
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  const loadVehiculos = async () => {
    try {
      const data = await fetchAllVehiculos();
      setVehiculos(data);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    }
  };

  const loadEmpleados = async () => {
    try {
      const data = await fetchAllEmpleados();
      setEmpleados(data.filter((e) => e.estado !== false));
    } catch (error) {
      console.error("Error al cargar empleados:", error);
    }
  };

  const handleNewCita = (date = null) => {
    setSelectedDate(date);
    setEditing(null);
    setShowForm(true);
  };

  const handleEditCita = (cita) => {
    setEditing(cita);
    setShowForm(true);
    setShowDetail(false);
  };

  const handleViewCita = (cita) => {
    setSelectedCita(cita);
    setShowDetail(true);
    setShowForm(false);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editing) {
        await updateCita(editing.id, formData);
        alert("✅ Cita actualizada correctamente");
      } else {
        await createCita(formData);
        alert("✅ Cita creada correctamente");
      }
      setShowForm(false);
      setEditing(null);
      setSelectedDate(null);
      loadCitas();
    } catch (error) {
      console.error("Error:", error.message);
      // Mostrar el mensaje de error completo al usuario
      const errorMessage = error.message || "Error desconocido";
      alert(errorMessage);
    }
  };

  const handleDeleteCita = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta cita?")) {
      return;
    }
    try {
      await deleteCita(id);
      alert("Cita eliminada correctamente");
      setShowDetail(false);
      setSelectedCita(null);
      loadCitas();
    } catch (error) {
      console.error("Error:", error.message);
      alert("Error al eliminar cita: " + error.message);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
          Calendario de Citas
        </h1>

        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Cargando citas...</p>
          </div>
        )}

        {!loading && (
          <CitaCalendar
            citas={citas}
            onNewCita={handleNewCita}
            onViewCita={handleViewCita}
          />
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CitaForm
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
                setSelectedDate(null);
              }}
              initialData={editing}
              clientes={clientes}
              vehiculos={vehiculos}
              empleados={empleados}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {showDetail && selectedCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl my-auto">
            <CitaDetail
              cita={selectedCita}
              onEdit={() => handleEditCita(selectedCita)}
              onDelete={() => handleDeleteCita(selectedCita.id)}
              onClose={() => {
                setShowDetail(false);
                setSelectedCita(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CitaPage;

