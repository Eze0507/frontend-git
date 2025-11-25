import React, { useState, useEffect, useRef } from 'react';
import { FaClock, FaInfoCircle } from 'react-icons/fa';

const AutoBackupScheduler = ({ onTriggerBackup }) => {
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('01:00');
  const [nextBackupTime, setNextBackupTime] = useState(null);
  const [message, setMessage] = useState('');
  const intervalRef = useRef(null);

  // Cargar configuración del localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('autoBackupConfig');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setAutoBackupEnabled(config.enabled);
      setScheduledTime(config.time);
    }
  }, []);

  // Calcular próximo backup
  useEffect(() => {
    if (autoBackupEnabled && scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const now = new Date();
      const next = new Date();
      next.setHours(hours, minutes, 0, 0);
      
      // Si la hora ya pasó hoy, programar para mañana
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      
      setNextBackupTime(next);
    } else {
      setNextBackupTime(null);
    }
  }, [autoBackupEnabled, scheduledTime]);

  // Ejecutar backup automático
  useEffect(() => {
    if (autoBackupEnabled && scheduledTime) {
      // Limpiar intervalo anterior si existe
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Verificar cada minuto si es hora de hacer backup
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        
        if (now.getHours() === hours && now.getMinutes() === minutes) {
          console.log('⏰ Ejecutando backup automático programado');
          if (onTriggerBackup) {
            onTriggerBackup();
          }
        }
      }, 60000); // Verificar cada minuto

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoBackupEnabled, scheduledTime, onTriggerBackup]);

  // Guardar configuración y activar/desactivar
  const handleToggleAutoBackup = () => {
    const newEnabled = !autoBackupEnabled;
    setAutoBackupEnabled(newEnabled);
    
    const config = {
      enabled: newEnabled,
      time: scheduledTime
    };
    
    localStorage.setItem('autoBackupConfig', JSON.stringify(config));
    
    if (newEnabled) {
      setMessage(`✅ Backup automático activado para las ${scheduledTime}`);
    } else {
      setMessage('⚠️ Backup automático desactivado');
    }

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMessage(''), 3000);
  };

  // Actualizar hora programada
  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setScheduledTime(newTime);
    
    if (autoBackupEnabled) {
      const config = {
        enabled: true,
        time: newTime
      };
      localStorage.setItem('autoBackupConfig', JSON.stringify(config));
      
      setMessage(`✅ Hora de backup actualizada a las ${newTime}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-4">
        <FaClock className="text-purple-600 text-2xl" />
        <h2 className="text-xl font-semibold text-gray-800">Backup Automático</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Programa un backup automático que se ejecutará diariamente a la hora especificada.
      </p>

      {/* Mensaje de feedback */}
      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          {message}
        </div>
      )}

      <div className="space-y-4">
        {/* Toggle de activación */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Activar backup automático
            </label>
            <p className="text-xs text-gray-500 mt-1">
              El backup se ejecutará automáticamente cada día
            </p>
          </div>
          <button
            onClick={handleToggleAutoBackup}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoBackupEnabled ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Selector de hora */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora programada
          </label>
          <input
            type="time"
            value={scheduledTime}
            onChange={handleTimeChange}
            disabled={!autoBackupEnabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              !autoBackupEnabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        </div>

        {/* Próximo backup */}
        {autoBackupEnabled && nextBackupTime && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">📅 Próximo backup programado:</span>
              <br />
              {nextBackupTime.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        )}

        {/* Información importante */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <FaInfoCircle className="text-yellow-600 mt-1 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Importante:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-700">
                <li>Mantén esta pestaña abierta para que funcione</li>
                <li>El backup se descargará automáticamente</li>
                <li>Se ejecutará todos los días a la hora programada</li>
                <li>La configuración se guarda en tu navegador</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoBackupScheduler;
