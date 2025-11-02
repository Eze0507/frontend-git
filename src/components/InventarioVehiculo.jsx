import React, { useState, useEffect } from 'react';
import { 
  fetchInventarioVehiculo, 
  createInventarioVehiculo, 
  updateInventarioVehiculo,
  transformInventarioFromAPI,
  transformInventarioToAPI 
} from '../api/ordenesApi.jsx';

const InventarioVehiculo = ({ ordenId, onLoad, refreshTrigger, readOnly = false }) => {
  const [inventario, setInventario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Estructura de los items del inventario con sus labels
  const inventarioItems = [
    { key: 'extintor', label: 'Extintor' },
    { key: 'botiquin', label: 'Botiquín' },
    { key: 'antena', label: 'Antena' },
    { key: 'llantaRepuesto', label: 'Llanta de Repuesto' },
    { key: 'documentos', label: 'Documentos' },
    { key: 'encendedor', label: 'Encendedor' },
    { key: 'pisos', label: 'Pisos/Alfombras' },
    { key: 'luces', label: 'Luces' },
    { key: 'llaves', label: 'Llaves' },
    { key: 'gata', label: 'Gata' },
    { key: 'herramientas', label: 'Herramientas' },
    { key: 'tapasRuedas', label: 'Tapas de Ruedas' },
    { key: 'triangulos', label: 'Triángulos' }
  ];

  // Cargar inventario al montar el componente
  useEffect(() => {
    loadInventario();
  }, [ordenId]);

  // Efecto para recargar cuando refreshTrigger cambie
  useEffect(() => {
    if (refreshTrigger) {
      console.log('🔄 Trigger de recarga activado');
      loadInventario();
    }
  }, [refreshTrigger]);

  // Efecto para notificar al componente padre cuando se carga
  useEffect(() => {
    if (onLoad && !loading) {
      onLoad(loadInventario);
    }
  }, [onLoad, loading]);

  const loadInventario = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando inventario para orden:', ordenId);
      const data = await fetchInventarioVehiculo(ordenId);
      console.log('📦 Datos recibidos del backend:', data);
      
      if (data) {
        const transformedData = transformInventarioFromAPI(data);
        console.log('🔄 Datos transformados:', transformedData);
        setInventario(transformedData);
      } else {
        console.log('📝 No existe inventario - esto no debería pasar ya que se crea automáticamente');
        // Si no hay inventario, crear uno con valores por defecto pero sin ID
        // El backend debería haber creado uno automáticamente
        const defaultInventario = {
          id: null, // Sin ID para indicar que necesita ser creado
        };
        inventarioItems.forEach(item => {
          defaultInventario[item.key] = false;
        });
        console.log('🔧 Inventario por defecto creado:', defaultInventario);
        setInventario(defaultInventario);
      }
    } catch (error) {
      console.error('❌ Error cargando inventario:', error);
      // Crear inventario por defecto en caso de error
      const defaultInventario = {
        id: null,
      };
      inventarioItems.forEach(item => {
        defaultInventario[item.key] = false;
      });
      setInventario(defaultInventario);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = async (key, value) => {
    // Si está en modo readOnly, no hacer nada
    if (readOnly) {
      return;
    }
    
    try {
      console.log(`🔄 Cambiando ${key} a ${value}`);
      const updatedInventario = {
        ...inventario,
        [key]: value
      };
      
      console.log('📝 Estado actualizado del inventario:', updatedInventario);
      setInventario(updatedInventario);
      setHasChanges(true);
      
      // Guardar inmediatamente
      await saveInventario(updatedInventario);
      
    } catch (error) {
      console.error('❌ Error actualizando item del inventario:', error);
    }
  };

  const saveInventario = async (inventarioToSave = inventario) => {
    try {
      setSaving(true);
      console.log('💾 Guardando inventario:', inventarioToSave);
      
      // Verificar que tenemos un inventario válido
      if (!inventarioToSave) {
        console.error('❌ No hay inventario para guardar');
        return;
      }
      
      const dataToSend = transformInventarioToAPI(inventarioToSave);
      console.log('📤 Datos a enviar al backend:', dataToSend);
      
      if (inventarioToSave.id) {
        // Actualizar inventario existente (el caso más común)
        console.log('🔄 Actualizando inventario existente con ID:', inventarioToSave.id);
        const updatedData = await updateInventarioVehiculo(ordenId, inventarioToSave.id, dataToSend);
        console.log('✅ Inventario actualizado:', updatedData);
        const transformedData = transformInventarioFromAPI(updatedData);
        setInventario(transformedData);
      } else {
        console.log('❌ Inventario sin ID, esto no debería pasar ya que se crea automáticamente');
        // Recargar el inventario para obtener el ID
        await loadInventario();
      }
      
      setHasChanges(false);
    } catch (error) {
      console.error('❌ Error guardando inventario:', error);
      // Revertir cambios en caso de error
      loadInventario();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Inventario del Vehículo</h3>
        {saving && (
          <div className="flex items-center text-blue-600 text-sm ml-3">
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Guardando...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {inventarioItems.map((item) => (
          <div
            key={item.key}
            className={`relative p-2 rounded border transition-all duration-200 ${
              inventario?.[item.key]
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-white'
            } ${!readOnly ? 'cursor-pointer hover:border-gray-400' : 'cursor-not-allowed opacity-75'}`}
            onClick={!readOnly ? () => handleItemChange(item.key, !inventario?.[item.key]) : undefined}
          >
            <div className="flex items-center justify-between">
              <span className={`text-sm ${
                inventario?.[item.key] ? 'text-green-800 font-medium' : 'text-gray-700'
              }`}>
                {item.label}
              </span>
              
              {/* Checkbox simple */}
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                inventario?.[item.key]
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 bg-white'
              }`}>
                {inventario?.[item.key] && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!readOnly && hasChanges && !saving && (
        <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-yellow-800">Los cambios se guardan automáticamente</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventarioVehiculo;