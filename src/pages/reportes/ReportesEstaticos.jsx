/**
 * Componente de Reportes Estáticos (Fase 1)
 * Permite generar reportes predefinidos
 */

import React, { useState, useEffect } from 'react';
import { FaFilePdf, FaFileExcel, FaDownload, FaSpinner } from 'react-icons/fa';
import { obtenerReportesDisponibles, generarReporteEstatico, descargarReporte } from '../../api/reportesApi';

const ReportesEstaticos = () => {
  const [reportesDisponibles, setReportesDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState('');
  const [formato, setFormato] = useState('PDF');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  useEffect(() => {
    cargarReportesDisponibles();
  }, []);

  const cargarReportesDisponibles = async () => {
    try {
      setLoading(true);
      const response = await obtenerReportesDisponibles();
      if (response.success) {
        setReportesDisponibles(response.reportes);
        if (response.reportes.length > 0) {
          setReporteSeleccionado(response.reportes[0].id);
        }
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      alert('Error al cargar reportes disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarReporte = async () => {
    if (!reporteSeleccionado) {
      alert('Por favor selecciona un reporte');
      return;
    }

    try {
      setGenerando(true);

      const data = {
        tipo_reporte: reporteSeleccionado,
        formato: formato,
      };

      // Agregar fechas si están definidas
      if (fechaInicio) data.fecha_inicio = fechaInicio;
      if (fechaFin) data.fecha_fin = fechaFin;

      const response = await generarReporteEstatico(data);

      if (response.success) {
        alert(`✅ ${response.message}`);
        
        // Descargar automáticamente
        const reporteId = response.reporte.id;
        await descargarReporte(reporteId);
      }
    } catch (error) {
      console.error('Error al generar reporte:', error);
      const errorMsg = error.response?.data?.error || 'Error al generar reporte';
      alert(`❌ ${errorMsg}`);
    } finally {
      setGenerando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-600 text-3xl" />
        <span className="ml-3 text-gray-600">Cargando reportes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Descripción */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          📋 Reportes Predefinidos
        </h3>
        <p className="text-sm text-blue-700">
          Genera reportes estándar con un solo clic. Selecciona el tipo de reporte,
          formato y opcionalmente un rango de fechas.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        {/* Selector de Reporte */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Reporte
          </label>
          <select
            value={reporteSeleccionado}
            onChange={(e) => setReporteSeleccionado(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {reportesDisponibles.map((reporte) => (
              <option key={reporte.id} value={reporte.id}>
                {reporte.nombre}
              </option>
            ))}
          </select>
          {reporteSeleccionado && (
            <p className="mt-2 text-sm text-gray-600">
              {reportesDisponibles.find((r) => r.id === reporteSeleccionado)?.descripcion}
            </p>
          )}
        </div>

        {/* Selector de Formato */}
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

        {/* Filtros de Fecha (Opcional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio (Opcional)
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin (Opcional)
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Botón Generar */}
        <div className="pt-4">
          <button
            onClick={handleGenerarReporte}
            disabled={generando || !reporteSeleccionado}
            className={`
              w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all
              ${
                generando || !reporteSeleccionado
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
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
                <FaDownload />
                Generar Reporte
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lista de Reportes Disponibles */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Reportes Disponibles ({reportesDisponibles.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reportesDisponibles.map((reporte) => (
            <div
              key={reporte.id}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${
                  reporteSeleccionado === reporte.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow'
                }
              `}
              onClick={() => setReporteSeleccionado(reporte.id)}
            >
              <h4 className="font-semibold text-gray-800 mb-1">
                {reporte.nombre}
              </h4>
              <p className="text-sm text-gray-600">
                {reporte.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportesEstaticos;
