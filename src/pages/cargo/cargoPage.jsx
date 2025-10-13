import React, { useState, useEffect } from 'react';
import CargoList from './cargoList.jsx';
import CargoForm from './cargoForm.jsx';
import Button from '../../components/button.jsx';
// Importa las funciones de la API de cargos (debes crearlas en src/api/cargoApi.jsx)
import { fetchAllCargos, createCargo, updateCargo, deleteCargo } from '../../api/cargoApi.jsx';

const CargoPage = () => {
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCargo, setEditingCargo] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadCargos = async () => {
    setLoading(true);
    try {
      const data = await fetchAllCargos();
      setCargos(data);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCargos();
  }, []);

  const handleEdit = (cargo) => {
    setEditingCargo(cargo);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este cargo?")) return;
    try {
      await deleteCargo(id);
      loadCargos();
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Asegura que el sueldo se envíe como número
      const data = { ...formData, sueldo: Number(formData.sueldo) };
      if (editingCargo) {
        await updateCargo(editingCargo.id, data);
        alert('Cargo actualizado correctamente');
      } else {
        await createCargo(data);
        alert('Cargo creado correctamente');
      }
      setShowForm(false);
      setEditingCargo(null);
      loadCargos();
    } catch (error) {
      console.error('Error:', error.message);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="relative">
      {/* Tabla de cargos */}
      <CargoList
        cargos={cargos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
      />
      {/* Modal de Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <CargoForm
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingCargo(null); }}
            initialData={editingCargo}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default CargoPage;
