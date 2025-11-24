import React, { useState } from 'react';
import { FaDownload, FaUpload, FaExclamationTriangle, FaCheckCircle, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { createBackup, restoreBackup } from '../../api/backupApi';

const BackupPage = () => {
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [restoreSummary, setRestoreSummary] = useState(null);

  // Crear backup
  const handleCreateBackup = async () => {
    setLoadingBackup(true);
    setMessage({ type: '', text: '' });
    setRestoreSummary(null);

    try {
      const result = await createBackup();
      setMessage({
        type: 'success',
        text: `Backup creado y descargado exitosamente: ${result.filename}`
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al crear el backup'
      });
    } finally {
      setLoadingBackup(false);
    }
  };

  // Restaurar backup
  const handleRestoreBackup = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage({
        type: 'error',
        text: 'Por favor selecciona un archivo de backup'
      });
      return;
    }

    setLoadingRestore(true);
    setMessage({ type: '', text: '' });
    setRestoreSummary(null);

    try {
      const result = await restoreBackup(selectedFile);
      setMessage({
        type: 'success',
        text: result.message || 'Backup restaurado exitosamente'
      });
      setRestoreSummary(result.summary);
      setSelectedFile(null);
      
      // Resetear el input de archivo
      const fileInput = document.getElementById('backup-file');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Error al restaurar el backup'
      });
    } finally {
      setLoadingRestore(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea un archivo JSON
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        setMessage({
          type: 'error',
          text: 'Por favor selecciona un archivo JSON válido'
        });
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setMessage({ type: '', text: '' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Backup y Restauración del Sistema
        </h1>
        <p className="text-gray-600">
          Crea copias de seguridad de todos tus datos y restáuralos cuando sea necesario.
        </p>
      </div>

      {/* Mensajes */}
      {message.text && (
        <div
          className={`rounded-lg p-4 flex items-center space-x-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <FaCheckCircle className="text-green-600 text-xl" />
          ) : (
            <FaExclamationTriangle className="text-red-600 text-xl" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección: Crear Backup */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaDownload className="text-blue-600 text-2xl" />
            <h2 className="text-xl font-semibold text-gray-800">Crear Backup</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Descarga una copia de seguridad completa de todos los datos de tu taller en formato JSON.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">¿Qué se incluye en el backup?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Todos los datos de tu taller (clientes, vehículos, órdenes, etc.)</li>
                  <li>Información de empleados y cargos</li>
                  <li>Historial de pagos y facturas</li>
                  <li>Presupuestos y órdenes de trabajo</li>
                  <li>Configuración del taller</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateBackup}
            disabled={loadingBackup}
            className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
              loadingBackup
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loadingBackup ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Creando backup...</span>
              </>
            ) : (
              <>
                <FaDownload />
                <span>Crear y Descargar Backup</span>
              </>
            )}
          </button>
        </div>

        {/* Sección: Restaurar Backup */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaUpload className="text-green-600 text-2xl" />
            <h2 className="text-xl font-semibold text-gray-800">Restaurar Backup</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Restaura los datos desde un archivo de backup previamente descargado.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <FaExclamationTriangle className="text-yellow-600 mt-1 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Advertencia:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                  <li>Solo administradores pueden restaurar backups</li>
                  <li>La restauración puede tomar varios minutos</li>
                  <li>Se recomienda hacer un backup antes de restaurar</li>
                  <li>Los datos existentes serán reemplazados</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleRestoreBackup} className="space-y-4">
            <div>
              <label htmlFor="backup-file" className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar archivo de backup
              </label>
              <input
                id="backup-file"
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={loadingRestore}
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Archivo seleccionado: <span className="font-semibold">{selectedFile.name}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loadingRestore || !selectedFile}
              className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
                loadingRestore || !selectedFile
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {loadingRestore ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Restaurando...</span>
                </>
              ) : (
                <>
                  <FaUpload />
                  <span>Restaurar Backup</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Resumen de Restauración */}
      {restoreSummary && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Resumen de Restauración
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(restoreSummary)
              .filter(([key, value]) => typeof value === 'number' && value > 0 && key !== 'errors')
              .map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Información Adicional */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Información Importante
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">Frecuencia recomendada:</p>
              <p>Se recomienda crear backups regularmente (semanal o mensual) y antes de actualizaciones importantes.</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">Almacenamiento:</p>
              <p>Guarda los archivos de backup en un lugar seguro fuera del servidor (nube, disco externo, etc.).</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-800">Datos que NO se restauran:</p>
              <p>Usuarios, archivos/imágenes, IDs de Stripe y bitácoras no se restauran por seguridad.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;

