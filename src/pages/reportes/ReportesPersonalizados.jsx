/**
 * Componente de Reportes Personalizados (Fase 2)
 * Permite crear reportes a medida seleccionando campos y filtros
 */

import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaFileExcel, FaSpinner, FaMagic } from 'react-icons/fa';
import { obtenerEntidades, generarReportePersonalizado, descargarReporte } from '../../api/reportesApi';
import SelectorEntidad from './components/SelectorEntidad';
import SelectorCampos from './components/SelectorCampos';
import FiltrosDinamicos from './components/FiltrosDinamicos';

const ReportesPersonalizados = () => {
  const [entidades, setEntidades] = useState({});
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);

  // Estado del formulario
  const [entidadSeleccionada, setEntidadSeleccionada] = useState('');
  const [nombreReporte, setNombreReporte] = useState('');
  const [camposSeleccionados, setCamposSeleccionados] = useState([]);
  const [filtros, setFiltros] = useState([]);
  const [formato, setFormato] = useState('PDF');
  const [paso, setPaso] = useState(1);

  useEffect(() => {
    cargarEntidades();
  }, []);

  const cargarEntidades = async () => {
    try {
      setLoading(true);
      const response = await obtenerEntidades();
      if (response.success) {
        setEntidades(response.entidades);
      }
    } catch (error) {
      console.error('Error al cargar entidades:', error);
      alert('Error al cargar configuración de reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarEntidad = (entidadId) => {
    setEntidadSeleccionada(entidadId);
    setCamposSeleccionados([]);
    setFiltros([]);
    setNombreReporte(`Reporte de ${entidades[entidadId]?.nombre || ''}`);
    setPaso(2);
  };

  const handleSeleccionarCampos = (campos) => {
    setCamposSeleccionados(campos);
  };

  const handleAplicarFiltros = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  const handleGenerarReporte = async () => {
    if (!entidadSeleccionada) {
      alert('Por favor selecciona una entidad');
      return;
    }

    if (camposSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un campo');
      return;
    }

    if (!nombreReporte.trim()) {
      alert('Por favor ingresa un nombre para el reporte');
      return;
    }

    try {
      setGenerando(true);

      // Convertir array de filtros a objeto
      const filtrosObj = {};
      filtros.forEach(filtro => {
        if (filtro.valor !== null && filtro.valor !== undefined && filtro.valor !== '') {
          filtrosObj[filtro.campo] = filtro.valor;
        }
      });

      const data = {
        nombre: nombreReporte,
        entidad: entidadSeleccionada,
        campos: camposSeleccionados,
        filtros: filtrosObj,
        ordenamiento: [],
        formato: formato,
      };

      const response = await generarReportePersonalizado(data);

      if (response.success) {
        alert(`✅ ${response.message}\n\nRegistros: ${response.reporte.registros_procesados}\nTiempo: ${response.reporte.tiempo_generacion}s`);
        
        // Descargar automáticamente
        const reporteId = response.reporte.id;
        await descargarReporte(reporteId);

        // Limpiar formulario
        handleLimpiar();
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
      const errorMsg = error.response?.data?.error || 'Error al generar reporte';
      const errors = error.response?.data?.errors;
      
      let mensaje = `❌ ${errorMsg}`;
      if (errors) {
        mensaje += '\n\nErrores:\n' + JSON.stringify(errors, null, 2);
      }
      
      alert(mensaje);
    } finally {
      setGenerando(false);
    }
  };

  const handleLimpiar = () => {
    setEntidadSeleccionada('');
    setNombreReporte('');
    setCamposSeleccionados([]);
    setFiltros([]);
    setPaso(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
        <span className="ml-3 text-gray-600">Cargando configuración...</span>
      </div>
    );
  }

  const configEntidad = entidadSeleccionada ? entidades[entidadSeleccionada] : null;

  return (
    <div className="space-y-6">
      {/* Descripción */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">
          ✨ Reportes a tu Medida
        </h3>
        <p className="text-sm text-purple-700">
          Crea reportes personalizados en 3 simples pasos: selecciona una entidad,
          elige los campos que deseas incluir y aplica filtros opcionales.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between">
        {[
          { num: 1, label: 'Entidad' },
          { num: 2, label: 'Campos' },
          { num: 3, label: 'Generar' },
        ].map((step, index) => (
          <React.Fragment key={step.num}>
            <div className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full font-bold text-white
                  ${paso >= step.num ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              >
                {step.num}
              </div>
              <span
                className={`
                  ml-2 font-medium
                  ${paso >= step.num ? 'text-blue-600' : 'text-gray-400'}
                `}
              >
                {step.label}
              </span>
            </div>
            {index < 2 && (
              <div
                className={`
                  flex-1 h-1 mx-4
                  ${paso > step.num ? 'bg-blue-600' : 'bg-gray-300'}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Paso 1: Seleccionar Entidad */}
      {paso === 1 && (
        <SelectorEntidad
          entidades={entidades}
          onSeleccionar={handleSeleccionarEntidad}
        />
      )}

      {/* Paso 2 y 3: Campos y Filtros */}
      {paso >= 2 && configEntidad && (
        <div className="space-y-6">
          {/* Header de Entidad Seleccionada */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {configEntidad.nombre}
              </h3>
              <p className="text-sm text-gray-600">
                {Object.keys(configEntidad.campos_disponibles).length} campos disponibles
              </p>
            </div>
            <button
              onClick={handleLimpiar}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Cambiar Entidad
            </button>
          </div>

          {/* Nombre del Reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Reporte *
            </label>
            <input
              type="text"
              value={nombreReporte}
              onChange={(e) => setNombreReporte(e.target.value)}
              placeholder="Ej: Órdenes Pendientes del Mes"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Selector de Campos */}
          <SelectorCampos
            campos={configEntidad.campos_disponibles}
            camposSeleccionados={camposSeleccionados}
            onSeleccionar={handleSeleccionarCampos}
          />

          {/* Filtros Dinámicos */}
          <FiltrosDinamicos
            filtrosDisponibles={configEntidad.filtros_disponibles}
            filtrosSeleccionados={filtros}
            onActualizarFiltros={handleAplicarFiltros}
          />

          {/* Formato y Generar */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato de Salida
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => setFormato('PDF')}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                    ${
                      formato === 'PDF'
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <FaFilePdf />
                  PDF
                </button>
                <button
                  onClick={() => setFormato('XLSX')}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                    ${
                      formato === 'XLSX'
                        ? 'bg-green-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <FaFileExcel />
                  Excel
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerarReporte}
              disabled={generando || camposSeleccionados.length === 0}
              className={`
                w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold text-white transition-all
                ${
                  generando || camposSeleccionados.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                }
              `}
            >
              {generando ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Generando Reporte...
                </>
              ) : (
                <>
                  <FaMagic />
                  Generar Reporte Personalizado
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesPersonalizados;
