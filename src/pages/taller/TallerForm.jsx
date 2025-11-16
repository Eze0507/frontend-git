import React, { useState, useEffect } from 'react';
import { FaStore, FaMapMarkerAlt, FaPhone, FaClock, FaEnvelope, FaImage, FaKey, FaSave, FaTimes, FaUpload } from 'react-icons/fa';

const TallerForm = ({ taller, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    nombre_taller: '',
    ubicacion: '',
    telefono: '',
    horarios: '',
    email_contacto: '',
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    if (taller) {
      setFormData({
        nombre_taller: taller.nombre_taller || '',
        ubicacion: taller.ubicacion || '',
        telefono: taller.telefono || '',
        horarios: taller.horarios || '',
        email_contacto: taller.email_contacto || '',
      });
      // Establecer la vista previa del logo actual
      setLogoPreview(taller.logo || '');
    }
  }, [taller]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB permitido');
        return;
      }
      
      setLogoFile(file);
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(taller?.logo || '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, logoFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nombre del Taller */}
      <div>
        <label htmlFor="nombre_taller" className="block text-sm font-medium text-gray-700 mb-2">
          <FaStore className="inline mr-2 text-blue-500" />
          Nombre del Taller
        </label>
        <input
          type="text"
          id="nombre_taller"
          name="nombre_taller"
          value={formData.nombre_taller}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
          placeholder="Nombre de tu taller"
          required
        />
      </div>

      {/* Ubicación */}
      <div>
        <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700 mb-2">
          <FaMapMarkerAlt className="inline mr-2 text-blue-500" />
          Ubicación
        </label>
        <input
          type="text"
          id="ubicacion"
          name="ubicacion"
          value={formData.ubicacion}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
          placeholder="Dirección del taller"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
          <FaPhone className="inline mr-2 text-blue-500" />
          Teléfono
        </label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
          placeholder="+591 12345678"
        />
      </div>

      {/* Email de Contacto */}
      <div>
        <label htmlFor="email_contacto" className="block text-sm font-medium text-gray-700 mb-2">
          <FaEnvelope className="inline mr-2 text-blue-500" />
          Email de Contacto
        </label>
        <input
          type="email"
          id="email_contacto"
          name="email_contacto"
          value={formData.email_contacto}
          onChange={handleChange}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
          placeholder="contacto@taller.com"
        />
      </div>

      {/* Horarios */}
      <div>
        <label htmlFor="horarios" className="block text-sm font-medium text-gray-700 mb-2">
          <FaClock className="inline mr-2 text-blue-500" />
          Horarios
        </label>
        <textarea
          id="horarios"
          name="horarios"
          value={formData.horarios}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400"
          placeholder="Ej: Lunes a Viernes 8:00-18:00, Sábado 9:00-14:00"
        />
      </div>

      {/* Logo - Subida de Archivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FaImage className="inline mr-2 text-blue-500" />
          Logo del Taller
        </label>
        
        {/* Vista previa del logo actual o nuevo */}
        {logoPreview && (
          <div className="mb-3 flex items-center gap-4">
            <img 
              src={logoPreview} 
              alt="Logo preview" 
              className="h-24 w-24 object-contain rounded-lg border-2 border-gray-300 bg-gray-50 p-2"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {logoFile && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                <FaTimes className="inline mr-1" />
                Eliminar nuevo logo
              </button>
            )}
          </div>
        )}
        
        {/* Input de archivo */}
        <div className="flex items-center gap-3">
          <label 
            htmlFor="logo-upload" 
            className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaUpload className="mr-2 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              {logoFile ? 'Cambiar imagen' : 'Subir logo'}
            </span>
          </label>
          <input
            type="file"
            id="logo-upload"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
          />
          {logoFile && (
            <span className="text-sm text-gray-600">
              {logoFile.name}
            </span>
          )}
        </div>
        
        <p className="mt-2 text-xs text-gray-500">
          Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-colors
            ${loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              Guardar Cambios
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaTimes className="inline mr-2" />
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default TallerForm;
