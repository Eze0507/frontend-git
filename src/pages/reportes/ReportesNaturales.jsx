import { useState, useEffect } from 'react';
import { FaMagic, FaLightbulb, FaSpinner, FaFileDownload, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { generarReporteNatural } from '../../api/reportesApi';
import useSpeechRecognitionHook from '../../hooks/useSpeechRecognition';

// Ejemplos de consultas en lenguaje natural
const EJEMPLOS = {
  ordenes: [
    "Órdenes completadas este mes en excel",
    "Órdenes pendientes con total mayor a 1000",
    "Órdenes finalizadas en octubre en pdf",
    "Órdenes pagadas este mes",
  ],
  clientes: [
    "Clientes registrados en octubre",
    "Clientes tipo empresa",
    "Clientes activos en formato excel",
  ],
  vehiculos: [
    "Vehículos marca Toyota",
    "SUV año 2020 o superior en excel",
    "Vehículos color blanco",
  ],
  items: [
    "Items con stock bajo en excel",
    "Repuestos de venta disponibles",
    "Items con precio mayor a 100",
  ],
};

export default function ReportesNaturales() {
  const [consulta, setConsulta] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [ejemplos] = useState(EJEMPLOS);
  const [mostrarEjemplos, setMostrarEjemplos] = useState(true);
  const [error, setError] = useState('');
  const [ultimaInterpretacion, setUltimaInterpretacion] = useState(null);

  // Hook de reconocimiento de voz
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    clearTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognitionHook();

  // Actualizar consulta cuando cambia el transcript
  useEffect(() => {
    if (transcript) {
      setConsulta(transcript);
    }
  }, [transcript]);

  const handleEjemploClick = (ejemplo) => {
    setConsulta(ejemplo);
    setMostrarEjemplos(false);
  };

  const handleToggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      clearTranscript();
      startListening();
    }
  };

  const handleClearVoiceInput = () => {
    clearTranscript();
    setConsulta('');
    if (listening) {
      stopListening();
    }
  };

  const handleGenerarReporte = async (e) => {
    e.preventDefault();
    
    if (!consulta.trim()) {
      setError('Por favor ingresa una consulta');
      return;
    }

    setLoading(true);
    setError('');
    setUltimaInterpretacion(null);

    try {
      const resultado = await generarReporteNatural({
        consulta: consulta.trim(),
        nombre: nombre.trim() || undefined
      });

      if (resultado.interpretacion) {
        setUltimaInterpretacion(resultado.interpretacion);
      }

      // Descargar el archivo automáticamente
      if (resultado.reporte && resultado.reporte.id) {
        const { descargarReporte } = await import('../../api/reportesApi');
        await descargarReporte(resultado.reporte.id);
      }

      // Limpiar formulario
      setConsulta('');
      setNombre('');
      
      alert(`✅ Reporte generado exitosamente!\n\nSe encontraron ${resultado.interpretacion?.registros_encontrados || 0} registros.\n\nEl archivo se descargará automáticamente.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar el reporte');
      
      // Mostrar sugerencias si están disponibles
      if (err.response?.data?.sugerencias) {
        console.log('Sugerencias de consultas:', err.response.data.sugerencias);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-3">
          <FaMagic className="text-purple-600 text-2xl" />
          <h2 className="text-2xl font-bold text-gray-800">Reportes en Lenguaje Natural</h2>
        </div>
        <p className="text-gray-600">
          Genera reportes escribiendo consultas en español natural. El sistema interpretará tu solicitud 
          y generará el reporte automáticamente.
        </p>
      </div>

      {/* Formulario principal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleGenerarReporte} className="space-y-4">
          {/* Textarea para la consulta */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Escribe o dicta tu consulta
              </label>
              {browserSupportsSpeechRecognition && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleToggleListening}
                    disabled={loading}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      listening
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {listening ? (
                      <>
                        <FaMicrophoneSlash />
                        <span>Detener</span>
                      </>
                    ) : (
                      <>
                        <FaMicrophone />
                        <span>Hablar</span>
                      </>
                    )}
                  </button>
                  {consulta && (
                    <button
                      type="button"
                      onClick={handleClearVoiceInput}
                      disabled={loading}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <textarea
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Ejemplo: Órdenes completadas este mes con total mayor a 1000 Bs"
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  listening
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {listening && (
                <div className="absolute top-2 right-2 flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                  <FaMicrophone />
                  <span>Escuchando...</span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {browserSupportsSpeechRecognition ? (
                <>
                  💬 Puedes escribir o usar el micrófono para dictar tu consulta. 
                  Ejemplo: "clientes registrados en octubre", "items con stock bajo en excel", 
                  "órdenes pendientes del cliente Juan en pdf".
                </>
              ) : (
                <>
                  Puedes usar frases como: "clientes registrados en octubre", "items con stock bajo", 
                  "órdenes pendientes del cliente Juan". También puedes especificar el formato: "en excel" o "en pdf".
                </>
              )}
            </p>
          </div>

          {/* Nombre del reporte (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del reporte (opcional)
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Se generará automáticamente si no lo especificas"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Botón generar */}
          <button
            type="submit"
            disabled={loading || !consulta.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Generando reporte...</span>
              </>
            ) : (
              <>
                <FaMagic />
                <span>Generar Reporte</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Última interpretación */}
      {ultimaInterpretacion && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center">
            <FaFileDownload className="mr-2" />
            Reporte generado exitosamente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Entidad:</span>
              <p className="text-gray-600">{ultimaInterpretacion.entidad}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Registros encontrados:</span>
              <p className="text-gray-600">{ultimaInterpretacion.registros_encontrados}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Campos incluidos:</span>
              <p className="text-gray-600">{ultimaInterpretacion.campos_incluidos?.length || 0}</p>
            </div>
          </div>
          {Object.keys(ultimaInterpretacion.filtros_aplicados || {}).length > 0 && (
            <div className="mt-3">
              <span className="font-medium text-gray-700">Filtros aplicados:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(ultimaInterpretacion.filtros_aplicados).map(([key, value]) => (
                  <span key={key} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sección de ejemplos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <button
          onClick={() => setMostrarEjemplos(!mostrarEjemplos)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <FaLightbulb className="text-yellow-500" />
            <h3 className="font-semibold text-gray-800">Ejemplos de consultas</h3>
          </div>
          <span className="text-gray-400">
            {mostrarEjemplos ? '▼' : '▶'}
          </span>
        </button>

        {mostrarEjemplos && (
          <div className="mt-4 space-y-4">
            {Object.entries(ejemplos).map(([entidad, listaEjemplos]) => (
              <div key={entidad}>
                <h4 className="font-medium text-gray-700 mb-2 capitalize">
                  {entidad}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {listaEjemplos.map((ejemplo, index) => (
                    <button
                      key={index}
                      onClick={() => handleEjemploClick(ejemplo)}
                      className="text-left px-4 py-2 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg text-sm text-gray-700 hover:text-purple-700 transition-colors"
                    >
                      {ejemplo}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="space-y-2">
          <p className="text-sm text-blue-800">
            <strong>💡 Consejo:</strong> Sé específico en tus consultas. Puedes mencionar estados, fechas, 
            rangos numéricos, nombres y el formato deseado (ej: "en excel" o "en pdf"). Por defecto genera PDF.
          </p>
          {browserSupportsSpeechRecognition && (
            <p className="text-sm text-blue-800">
              <strong>🎤 Reconocimiento de voz:</strong> Usa el botón "Hablar" para dictar tu consulta. 
              Habla claramente y menciona todos los detalles que necesites en tu reporte.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
