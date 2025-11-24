import React, { useState, useEffect } from 'react';
import NominaList from './NominaList.jsx';
import NominaForm from './NominaForm.jsx';
import Toast from '../../components/Toast.jsx';
import { 
  fetchAllNominas, 
  createNomina, 
  updateNomina, 
  deleteNomina,
  cambiarEstadoNomina,
  recalcularNomina 
} from '../../api/nominaApi.jsx';
import { useNavigate } from 'react-router-dom';

const NominaPage = () => {
  const [nominas, setNominas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingNomina, setEditingNomina] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadNominas = async () => {
    setLoading(true);
    try {
      const data = await fetchAllNominas();
      setNominas(data);
    } catch (error) {
      console.error(error.message);
      showToast('Error al cargar las nóminas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNominas();
  }, []);

  const handleEdit = (nomina) => {
    setEditingNomina(nomina);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta nómina?")) return;
    try {
      await deleteNomina(id);
      showToast('Nómina eliminada correctamente', 'success');
      loadNominas();
    } catch (error) {
      console.error(error.message);
      showToast('Error al eliminar la nómina', 'error');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingNomina) {
        await updateNomina(editingNomina.id, formData);
        showToast('Nómina actualizada correctamente', 'success');
      } else {
        await createNomina(formData);
        showToast('Nómina creada correctamente', 'success');
      }
      setShowForm(false);
      setEditingNomina(null);
      loadNominas();
    } catch (error) {
      console.error('Error:', error.message);
      showToast('Error: ' + error.message, 'error');
    }
  };

  const handleCambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoNomina(id, estado);
      showToast(`Estado cambiado a ${estado} correctamente`, 'success');
      loadNominas();
    } catch (error) {
      console.error(error.message);
      showToast('Error al cambiar el estado', 'error');
    }
  };

  const handleRecalcular = async (id) => {
    if (!window.confirm("¿Recalcular todos los detalles de esta nómina?")) return;
    try {
      await recalcularNomina(id);
      showToast('Nómina recalculada correctamente', 'success');
      loadNominas();
    } catch (error) {
      console.error(error.message);
      showToast('Error al recalcular', 'error');
    }
  };

  const handleVerDetalle = (id) => {
    navigate(`/admin/detallesnomina/${id}`);
  };

  return (
    <div className="relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <NominaList
        nominas={nominas}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={() => setShowForm(true)}
        onCambiarEstado={handleCambiarEstado}
        onRecalcular={handleRecalcular}
        onVerDetalle={handleVerDetalle}
      />
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <NominaForm
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setEditingNomina(null); }}
            initialData={editingNomina}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default NominaPage;
