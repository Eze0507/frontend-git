import { useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

/**
 * Hook personalizado para reconocimiento de voz
 * Maneja la transcripción de voz a texto para generar consultas de reportes
 */
export default function useSpeechRecognitionHook() {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  // Iniciar escucha continua
  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz. Intenta con Chrome o Edge.');
      return;
    }

    if (!isMicrophoneAvailable) {
      alert('No se detectó un micrófono. Por favor, verifica los permisos y que tu micrófono esté conectado.');
      return;
    }

    SpeechRecognition.startListening({
      continuous: true,
      language: 'es-ES' // Español
    });
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  // Detener escucha
  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  // Limpiar transcripción
  const clearTranscript = useCallback(() => {
    resetTranscript();
  }, [resetTranscript]);

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    clearTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  };
}
