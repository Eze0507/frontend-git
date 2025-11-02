import React, { useState, useEffect } from 'react';
import { fetchImagenes, uploadImagen, updateImagen, deleteImagen } from '../api/ordenesApi.jsx';

const ImagenesOrden = ({ ordenId, readOnly = false }) => {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [newImage, setNewImage] = useState({
    imagen_file: null,
    descripcion: ''
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  // Error boundary para el componente
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error en Imágenes</h3>
          <p className="text-red-600">{error.message}</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    try {
      loadImagenes();
    } catch (err) {
      console.error('❌ Error en useEffect inicial:', err);
      setError(err);
    }
  }, [ordenId]);

  const loadImagenes = async () => {
    try {
      setLoading(true);
      const data = await fetchImagenes(ordenId);
      
      // Validar que data sea un array
      if (!Array.isArray(data)) {
        setImagenes([]);
      } else {
        setImagenes(data);
      }
      setError(null); // Limpiar error si la carga es exitosa
    } catch (error) {
      console.error('Error cargando imágenes:', error);
      setImagenes([]);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        alert('Tipo de archivo no soportado. Por favor selecciona JPG, PNG, GIF o WebP');
        e.target.value = ''; // Limpiar el input
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB permitido');
        e.target.value = ''; // Limpiar el input
        return;
      }

      // Validar que no esté corrupto
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          setPreviewUrl(e.target.result);
        } catch (error) {
          alert('Error al leer el archivo. El archivo puede estar corrupto');
          return;
        }
      };
      
      reader.onerror = () => {
        alert('Error al leer el archivo. Por favor intenta con otro archivo');
      };
      
      setNewImage(prev => ({ ...prev, imagen_file: file }));
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!editingImage && !newImage.imagen_file) {
      alert('Por favor selecciona una imagen');
      return;
    }

    try {
      setUploading(true);
      setError(null); // Limpiar errores previos
      
      if (editingImage) {
        await updateImagen(ordenId, editingImage.id, newImage);
      } else {
        await uploadImagen(ordenId, newImage);
      }
      
      // Resetear formulario
      setNewImage({ imagen_file: null, descripcion: '' });
      setPreviewUrl(null);
      setShowUploadModal(false);
      setEditingImage(null);
      
      // Recargar imágenes
      await loadImagenes();
      
      // Mostrar mensaje de éxito
      alert(editingImage ? 'Imagen actualizada correctamente' : 'Imagen subida correctamente');
      
    } catch (error) {
      console.error('Error procesando imagen:', error);
      
      // Mostrar error más específico al usuario
      let errorMessage = 'Error procesando la imagen';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
      setError(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imagenId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      await deleteImagen(ordenId, imagenId);
      loadImagenes(); // Recargar la lista
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      alert('Error eliminando imagen: ' + (error.response?.data?.message || error.message));
    }
  };

  const openImageModal = (imagen) => {
    try {
      if (imagen && typeof imagen === 'object' && imagen.id) {
        setSelectedImage(imagen);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Error abriendo modal de imagen:', err);
      setError(err);
    }
  };

  const openEditModal = (imagen) => {
    try {
      console.log('✏️ Abriendo modal de edición:', imagen);
      if (imagen && typeof imagen === 'object' && imagen.id) {
        setEditingImage(imagen);
        setNewImage({
          imagen_file: null,
          descripcion: typeof imagen.descripcion === 'string' ? imagen.descripcion : ''
        });
        setPreviewUrl(null);
        setShowUploadModal(true);
      } else {
        console.warn('⚠️ Imagen inválida para editar:', imagen);
      }
    } catch (err) {
      console.error('❌ Error abriendo modal de edición:', err);
      setError(err);
    }
  };

  const openUploadModal = () => {
    setEditingImage(null);
    setNewImage({ imagen_file: null, descripcion: '' });
    setPreviewUrl(null);
    setShowUploadModal(true);
  };

  const closeModals = () => {
    setShowModal(false);
    setShowUploadModal(false);
    setSelectedImage(null);
    setEditingImage(null);
    setNewImage({ imagen_file: null, descripcion: '' });
    setPreviewUrl(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Fotos</h3>
          <p className="text-xs text-gray-500 mt-1">{Array.isArray(imagenes) ? imagenes.length : 0} fotos</p>
        </div>
        {!readOnly && (
          <button
            onClick={openUploadModal}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            + Subir
          </button>
        )}
      </div>

      {/* Grid de imágenes */}
      {!Array.isArray(imagenes) || imagenes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-xl font-medium text-gray-900 mb-3">No hay imágenes</h4>
          <p className="text-gray-500 text-base max-w-md mx-auto mb-6">
            {readOnly 
              ? "No hay imágenes registradas para esta orden de trabajo."
              : "Sube imágenes relacionadas con esta orden de trabajo para documentar el proceso y mantener un registro visual."
            }
          </p>
          {!readOnly && (
            <button
              onClick={openUploadModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 inline-flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Subir Primera Imagen</span>
            </button>
          )}
        </div>
      ) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {imagenes.map((imagen) => {
            // Protección contra datos malformados
            if (!imagen || typeof imagen !== 'object' || !imagen.id) {
              return null;
            }

            return (
              <div key={imagen.id} className="relative bg-white rounded-md overflow-hidden">
                <div 
                  className="w-full h-36 bg-gray-100 cursor-pointer overflow-hidden"
                  onClick={() => openImageModal(imagen)}
                >
                  <img
                    src={imagen.imagen_url || ''}
                    alt={typeof imagen.descripcion === 'string' ? imagen.descripcion : 'Imagen de orden'}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = ''; }}
                  />
                </div>

                <div className="p-3">
                  <div className="text-sm text-gray-800 truncate">{imagen.descripcion || 'Sin descripción'}</div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                    <span className="text-xs">#{imagen.id}</span>
                    {!readOnly && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(imagen.id); }}
                        className="text-red-500 text-sm p-1"
                        title="Eliminar"
                      >
                        ✖
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de visualización de imagen */}
      {showModal && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="relative bg-white rounded-md shadow-lg max-w-2xl w-full overflow-hidden">
            <button onClick={closeModals} className="absolute top-3 right-3 text-gray-600">✖</button>
            <div className="p-6 flex items-start gap-6">
              <img src={selectedImage.imagen_url || ''} alt={selectedImage.descripcion || 'Imagen'} className="max-h-96 object-contain rounded-md" />
              <div className="flex-1">
                <div className="text-sm text-gray-800 mb-2">{selectedImage.descripcion || 'Sin descripción'}</div>
                <div className="text-xs text-gray-500">Imagen #{selectedImage.id}</div>
                {selectedImage.fecha_subida && (
                  <div className="text-xs text-gray-400">{new Date(selectedImage.fecha_subida).toLocaleDateString()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de subida/edición de imagen */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-md max-w-md w-full shadow-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-base font-medium">{editingImage ? 'Editar' : 'Subir'}</h3>
              <button onClick={closeModals} className="text-gray-500">✖</button>
            </div>

            <div className="p-4 space-y-4">
              {/* Selector de archivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {editingImage ? 'Cambiar imagen (opcional)' : 'Seleccionar imagen *'}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileSelect} 
                      className="hidden" 
                      id="file-input"
                    />
                    <label 
                      htmlFor="file-input" 
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Seleccionar imagen
                    </label>
                    <p className="text-xs text-gray-400 mt-2">PNG/JPG/GIF hasta 5MB</p>
                    {newImage.imagen_file && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {newImage.imagen_file.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="mt-2">
                    <img src={previewUrl} alt="Preview" className="w-full h-24 object-cover rounded-md" />
                  </div>
                )}

                {/* Imagen actual en edición */}
                {editingImage && !previewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Imagen actual:</p>
                    <img
                      src={editingImage.imagen_url}
                      alt="Imagen actual"
                      className="w-full h-32 object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input value={newImage.descripcion} onChange={(e) => setNewImage(prev => ({ ...prev, descripcion: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-md px-3 py-2" placeholder="Breve descripción" />
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.768 0L3.146 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-red-800 mb-1">Error al procesar imagen</h4>
                      <p className="text-sm text-red-700 mb-2">{error.message}</p>
                      {error.message.includes('ImgBB') && (
                        <div className="text-xs text-red-600">
                          <p className="font-medium mb-1">Posibles soluciones:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Verificar la API key de ImgBB en el backend</li>
                            <li>Comprobar que el archivo no esté corrupto</li>
                            <li>Intentar con una imagen más pequeña</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={closeModals} disabled={uploading} className="px-3 py-1 text-sm border rounded-md">Cancelar</button>
              <button onClick={handleUpload} disabled={uploading || (!editingImage && !newImage.imagen_file)} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md">{uploading ? '...' : (editingImage ? 'Actualizar' : 'Subir')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagenesOrden;