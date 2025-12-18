// src/components/presupuestos/GeneradorPresupuestoIA.jsx
import React, { useState, useEffect } from 'react';
import { FaMagic, FaTimes, FaSpinner, FaPlus, FaCheckCircle, FaExclamationTriangle, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { generarPresupuestoConIA } from '../../api/presupuestosApi';
import useSpeechRecognitionHook from '../../hooks/useSpeechRecognition';

const GeneradorPresupuestoIA = ({ isOpen, onClose, onItemsGenerated, items }) => {
  const [sintomas, setSintomas] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  // Hook de reconocimiento de voz
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    clearTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognitionHook();

  // Actualizar el campo de síntomas con la transcripción
  useEffect(() => {
    if (transcript) {
      setSintomas(transcript);
    }
  }, [transcript]);

  // Función para alternar micrófono
  const toggleMicrophone = () => {
    if (listening) {
      stopListening();
    } else {
      clearTranscript();
      setSintomas('');
      startListening();
    }
  };

  const handleGenerar = async () => {
    if (!sintomas.trim()) {
      setError('Por favor, describe los síntomas del vehículo');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResultado(null);

      const data = await generarPresupuestoConIA(sintomas);
      setResultado(data);
    } catch (err) {
      setError(err.message || 'Error al generar el presupuesto');
      console.error('Error en generador IA:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarItems = () => {
    if (resultado && resultado.items_encontrados) {
      // Filtrar solo items que existen en el inventario (tienen id)
      const itemsValidos = resultado.items_encontrados.filter(item => item.id);
      
      if (itemsValidos.length === 0) {
        setError('No se encontraron items válidos en el inventario para agregar');
        return;
      }

      onItemsGenerated(itemsValidos, resultado.mano_obra_estimada);
      handleCerrar();
    }
  };

  const handleCerrar = () => {
    setSintomas('');
    setResultado(null);
    setError('');
    if (listening) {
      stopListening();
    }
    clearTranscript();
    onClose();
  };

  const formatCurrency = (amount) => {
    return `Bs. ${parseFloat(amount || 0).toLocaleString('es-BO', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaMagic className="text-2xl" />
            <h2 className="text-xl font-bold">Generar Pre-Presupuesto con IA</h2>
          </div>
          <button
            onClick={handleCerrar}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Input de síntomas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe los síntomas del vehículo
            </label>
            <div className="relative">
              <textarea
                value={sintomas}
                onChange={(e) => setSintomas(e.target.value)}
                placeholder='Ejemplo: "El cliente reporta ruido metálico al frenar y el pedal se siente esponjoso"'
                className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={loading || resultado}
              />
              {/* Botón de micrófono */}
              {browserSupportsSpeechRecognition && !resultado && (
                <button
                  type="button"
                  onClick={toggleMicrophone}
                  disabled={loading}
                  className={`absolute right-3 top-3 p-2 rounded-full transition-all duration-200 ${
                    listening 
                      ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={listening ? 'Detener grabación' : 'Iniciar grabación de voz'}
                >
                  {listening ? (
                    <FaMicrophoneSlash className="text-lg" />
                  ) : (
                    <FaMicrophone className="text-lg" />
                  )}
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                💡 Sé específico: describe ruidos, comportamientos anormales, olores, etc.
              </p>
              {listening && (
                <p className="text-xs text-red-600 font-semibold animate-pulse">
                  🎤 Escuchando...
                </p>
              )}
            </div>
          </div>

          {/* Botón generar */}
          {!resultado && (
            <button
              onClick={handleGenerar}
              disabled={loading || !sintomas.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Analizando con IA...</span>
                </>
              ) : (
                <>
                  <FaMagic />
                  <span>Generar Pre-Presupuesto</span>
                </>
              )}
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
              <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Resultados */}
          {resultado && (
            <div className="mt-6 space-y-6">
              {/* Análisis */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Análisis de la IA</h3>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Síntomas analizados:</strong> {resultado.sintomas_analizados}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Palabras clave detectadas:</strong> {resultado.palabras_clave_detectadas?.join(', ')}
                </p>
              </div>

              {/* Mano de obra */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">⏱️ Estimación de Mano de Obra</h3>
                <p className="text-2xl font-bold text-green-700">
                  {resultado.mano_obra_estimada} horas
                </p>
              </div>

              {/* Items encontrados */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🔧 Repuestos e Insumos Sugeridos</h3>
                
                {resultado.items_encontrados && resultado.items_encontrados.length > 0 ? (
                  <div className="space-y-2">
                    {resultado.items_encontrados.map((item, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${
                          item.id 
                            ? 'bg-white border-green-200 hover:border-green-400 transition-colors' 
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {item.id ? (
                                <FaCheckCircle className="text-green-500" />
                              ) : (
                                <FaExclamationTriangle className="text-yellow-500" />
                              )}
                              <h4 className="font-semibold text-gray-900">{item.nombre}</h4>
                            </div>
                            
                            {item.codigo && (
                              <p className="text-sm text-gray-600">Código: {item.codigo}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              {item.id && (
                                <>
                                  <span className="text-gray-700">
                                    <strong>Stock:</strong> {item.stock || 0}
                                  </span>
                                  <span className="text-gray-700">
                                    <strong>Precio:</strong> {formatCurrency(item.precio)}
                                  </span>
                                  <span className="text-gray-600">
                                    <strong>Tipo:</strong> {item.tipo}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            {item.origen_ia && (
                              <p className="text-xs text-blue-600 mt-2">
                                💡 Sugerido por: {item.origen_ia}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaExclamationTriangle className="mx-auto text-3xl mb-2" />
                    <p>No se encontraron items en el inventario</p>
                  </div>
                )}
              </div>

              {/* Nota informativa */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ℹ️ <strong>Nota:</strong> Esta es una sugerencia automática basada en IA. 
                  Los items con ✓ están disponibles en tu inventario y se agregarán al presupuesto. 
                  Los items con ⚠️ no se encontraron en tu inventario.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {resultado && (
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
            <button
              onClick={handleCerrar}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleAgregarItems}
              disabled={!resultado.items_encontrados?.some(item => item.id)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              <FaPlus />
              <span>Agregar al Presupuesto</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneradorPresupuestoIA;
