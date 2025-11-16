import React from 'react';
import { FaStore, FaMapMarkerAlt, FaPhone, FaClock, FaEnvelope, FaImage, FaKey, FaUser, FaCalendar, FaCheckCircle, FaTimesCircle, FaEdit } from 'react-icons/fa';

const TallerDetalle = ({ taller, onEdit }) => {
  if (!taller) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <FaStore className="mx-auto text-6xl" />
        </div>
        <p className="text-gray-600">No hay información del taller disponible</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header con Logo */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          {taller.logo ? (
            <img 
              src={taller.logo} 
              alt={`Logo de ${taller.nombre_taller}`}
              className="h-24 w-24 object-contain rounded-lg border-2 border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-24 w-24 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaStore className="text-4xl text-blue-600" />
            </div>
          )}
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{taller.nombre_taller}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                taller.activo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {taller.activo ? (
                  <>
                    <FaCheckCircle className="mr-1.5" />
                    Activo
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="mr-1.5" />
                    Inactivo
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaEdit />
          Editar
        </button>
      </div>

      {/* Información del Taller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ubicación */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <FaMapMarkerAlt className="text-blue-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Ubicación</h3>
          </div>
          <p className="text-gray-700 ml-8">
            {taller.ubicacion || 'No especificada'}
          </p>
        </div>

        {/* Teléfono */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <FaPhone className="text-blue-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Teléfono</h3>
          </div>
          <p className="text-gray-700 ml-8">
            {taller.telefono || 'No especificado'}
          </p>
        </div>

        {/* Email */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <FaEnvelope className="text-blue-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Email de Contacto</h3>
          </div>
          <p className="text-gray-700 ml-8">
            {taller.email_contacto || 'No especificado'}
          </p>
        </div>

        {/* Propietario */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <FaUser className="text-blue-600 text-xl" />
            <h3 className="font-semibold text-gray-900">Propietario</h3>
          </div>
          <p className="text-gray-700 ml-8">
            {taller.propietario_username || 'No asignado'}
          </p>
        </div>
      </div>

      {/* Horarios */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <FaClock className="text-blue-600 text-xl" />
          <h3 className="font-semibold text-gray-900">Horarios de Atención</h3>
        </div>
        <p className="text-gray-700 ml-8 whitespace-pre-line">
          {taller.horarios || 'No especificados'}
        </p>
      </div>

      {/* Código de Invitación */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <FaKey className="text-blue-600 text-xl" />
          <h3 className="font-semibold text-gray-900">Código de Invitación</h3>
        </div>
        <div className="ml-8">
          <code className="text-2xl font-mono font-bold text-blue-700 bg-white px-4 py-2 rounded-md border-2 border-blue-300">
            {taller.codigo_invitacion || 'N/A'}
          </code>
          <p className="text-sm text-gray-600 mt-2">
            Comparte este código con los clientes para que puedan registrarse en tu taller
          </p>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaCalendar className="text-gray-400" />
          <span>Registrado el {formatDate(taller.fecha_creacion)}</span>
        </div>
      </div>
    </div>
  );
};

export default TallerDetalle;
