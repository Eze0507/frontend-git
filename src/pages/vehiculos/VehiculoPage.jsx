import React, { useEffect, useState } from "react";
import VehiculoList from "./VehiculoList.jsx";
import VehiculoForm from "./VehiculoForm.jsx";
import VehiculoDetails from "./VehiculoDetails.jsx";
import SuccessNotification from "../../components/SuccessNotification";
import {
  fetchAllVehiculos, fetchVehiculoById, fetchAllClientes, fetchAllMarcas, fetchAllModelos,
  createVehiculo, updateVehiculo, deleteVehiculo, toApiVehiculo
} from "../../api/vehiculoApi.jsx";

const VehiculoPage = () => {
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function loadVehiculos() {
    setLoading(true);
    try {
      const data = await fetchAllVehiculos();
      console.log('📋 Datos de vehículos recibidos del backend:', data);
      console.log('📋 Primer vehículo (ejemplo):', data[0]);
      if (data[0]) {
        console.log('🔍 Claves disponibles en el primer vehículo:', Object.keys(data[0]));
        console.log('🔍 ID del primer vehículo:', data[0].id);
        console.log('🔍 PK del primer vehículo:', data[0].pk);
      }
      setVehiculos(data);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadClientes() {
    try {
      const data = await fetchAllClientes();
      console.log('📋 Clientes cargados para vehículos:', data);
      setClientes(data);
    } catch (e) {
      console.error('Error al cargar clientes:', e.message);
    }
  }

  async function loadMarcas() {
    try {
      const data = await fetchAllMarcas();
      console.log('📋 Marcas cargadas:', data);
      setMarcas(data);
    } catch (e) {
      console.error('Error al cargar marcas:', e.message);
    }
  }

  async function loadModelos() {
    try {
      const data = await fetchAllModelos();
      console.log('📋 Modelos cargados:', data);
      setModelos(data);
    } catch (e) {
      console.error('Error al cargar modelos:', e.message);
    }
  }

  useEffect(() => {
    loadVehiculos();
    loadClientes();
    loadMarcas();
    loadModelos();
  }, []);

  const handleEdit = async (row) => { 
    console.log('✏️ Editando vehículo:', row);
    try {
      // Obtener los datos completos del vehículo desde el backend
      const vehiculoCompleto = await fetchVehiculoById(row.id);
      console.log('📋 Datos completos para edición:', vehiculoCompleto);
      setEditing(vehiculoCompleto); 
      setShowForm(true); 
    } catch (error) {
      console.error('❌ Error al obtener datos del vehículo para edición:', error);
      // Fallback: usar los datos de la tabla
      setEditing(row); 
      setShowForm(true); 
    }
  };

  const handleViewDetails = async (row) => {
    console.log('👁️ Viendo detalles del vehículo:', row);
    try {
      // Obtener los datos completos del vehículo desde el backend
      const vehiculoCompleto = await fetchVehiculoById(row.id);
      console.log('📋 Datos completos del vehículo:', vehiculoCompleto);
      setSelectedVehiculo(vehiculoCompleto);
      setShowDetails(true);
    } catch (error) {
      console.error('❌ Error al obtener detalles del vehículo:', error);
      // Fallback: usar los datos de la tabla
      setSelectedVehiculo(row);
      setShowDetails(true);
    }
  };

  const handleDelete = async (id) => {
    console.log('🗑️ Intentando eliminar vehículo con ID:', id);
    
    // Validar que el ID sea válido
    if (!id || id === "" || id === null || id === "undefined") {
      console.error('❌ ID inválido recibido:', id);
      alert('Error: No se puede eliminar este vehículo porque no tiene un ID válido');
      return;
    }
    
    if (!window.confirm("¿Seguro que quieres eliminar este vehículo?")) {
      console.log('❌ Eliminación cancelada por el usuario');
      return;
    }
    
    try {
      console.log('🚀 Iniciando eliminación...');
      await deleteVehiculo(id);
      console.log('✅ Eliminación exitosa, recargando lista...');
      setSuccessMessage('Vehículo eliminado correctamente');
      setShowSuccessNotification(true);
      loadVehiculos();
    } catch (e) { 
      console.error('❌ Error en eliminación:', e.message);
      alert('Error al eliminar vehículo: ' + e.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      console.log('📋 Datos del formulario:', formData);
      
      const payload = toApiVehiculo(formData);
      console.log('📤 Payload a enviar:', payload);
      
      if (editing) {
        await updateVehiculo(editing.id, payload);
        setSuccessMessage("Vehículo actualizado correctamente");
      } else {
        await createVehiculo(payload);
        setSuccessMessage("Vehículo creado correctamente");
      }
      setShowSuccessNotification(true);
      setShowForm(false);
      setEditing(null);
      loadVehiculos();
    } catch (e) {
      console.error("Error:", e.message);
      alert("Error: " + e.message);
    }
  };

  return (
    <div className="p-6 space-y-6 relative">
      <SuccessNotification
        message={successMessage}
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        duration={3000}
      />
      <VehiculoList
        vehiculos={vehiculos}
        marcas={marcas}
        modelos={modelos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={()=>{ setEditing(null); setShowForm(true); }}
        onViewDetails={handleViewDetails}
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          {console.log('📤 Pasando datos al formulario:', { 
            editing, 
            clientes: clientes.length, 
            marcas: marcas.length, 
            modelos: modelos.length 
          })}
          <VehiculoForm
            onSubmit={handleFormSubmit}
            onCancel={()=>{ setShowForm(false); setEditing(null); }}
            initialData={editing}
            clientes={clientes}
            marcas={marcas}
            modelos={modelos}
            loading={loading}
          />
        </div>
      )}

      {showDetails && (
        <VehiculoDetails
          vehiculo={selectedVehiculo}
          onClose={() => {
            setShowDetails(false);
            setSelectedVehiculo(null);
          }}
        />
      )}
    </div>
  );
};

export default VehiculoPage;
