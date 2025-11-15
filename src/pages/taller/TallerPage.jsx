import React, { useState, useEffect } from 'react';
import { FaStore, FaSpinner } from 'react-icons/fa';
import TallerDetalle from './TallerDetalle';
import TallerForm from './TallerForm';
import { obtenerPerfilTaller, actualizarPerfilTaller } from '@/api/tallerApi';
import SuccessNotification from '@/components/SuccessNotification';

const TallerPage = () => {
  const [taller, setTaller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    cargarTaller();
  }, []);

  const cargarTaller = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await obtenerPerfilTaller();
      console.log('✅ Datos del taller cargados:', data);
      setTaller(data);
    } catch (err) {
      console.error('❌ Error al cargar taller:', err);
      setError('Error al cargar la información del taller');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (formData, logoFile) => {
    try {
      setSaving(true);
      setError('');
      
      console.log('📝 Actualizando taller:', formData);
      if (logoFile) {
        console.log('📸 Subiendo logo:', logoFile.name);
      }
      
      const datosActualizados = await actualizarPerfilTaller(formData, logoFile);
      
      console.log('✅ Taller actualizado:', datosActualizados);
      
      setTaller(datosActualizados);
      setIsEditing(false);
      setShowSuccess(true);
      
      // Ocultar notificación después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('❌ Error al actualizar taller:', err);
      
      let errorMessage = 'Error al actualizar el taller';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información del taller...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FaStore className="text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Taller</h1>
              <p className="text-gray-600">Información y configuración de tu taller</p>
            </div>
          </div>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {isEditing ? (
            <TallerForm
              taller={taller}
              onSubmit={handleSubmit}
              onCancel={handleCancelEdit}
              loading={saving}
            />
          ) : (
            <TallerDetalle
              taller={taller}
              onEdit={handleEdit}
            />
          )}
        </div>
      </div>

      {/* Notificación de Éxito */}
      {showSuccess && (
        <SuccessNotification
          message="¡Información del taller actualizada exitosamente!"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default TallerPage;
