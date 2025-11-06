/**
 * Página Principal de Reportes
 * Contiene tabs para Reportes Estáticos, Personalizados y Lenguaje Natural
 */

import React, { useState } from 'react';
import { FaFileAlt, FaChartBar, FaClock, FaMagic } from 'react-icons/fa';
import ReportesEstaticos from './ReportesEstaticos';
import ReportesPersonalizados from './ReportesPersonalizados';
import ReportesNaturales from './ReportesNaturales';

const ReportesPage = () => {
  const [activeTab, setActiveTab] = useState('estaticos');

  const tabs = [
    { id: 'estaticos', label: 'Reportes Estáticos', icon: <FaFileAlt /> },
    { id: 'personalizados', label: 'Reportes Personalizados', icon: <FaChartBar /> },
    { id: 'natural', label: 'Lenguaje Natural', icon: <FaMagic /> },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📊 Módulo de Reportes
        </h1>
        <p className="text-gray-600">
          Genera reportes en PDF o Excel según tus necesidades
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200
                ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'estaticos' && <ReportesEstaticos />}
          {activeTab === 'personalizados' && <ReportesPersonalizados />}
          {activeTab === 'natural' && <ReportesNaturales />}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaFileAlt className="text-blue-600 text-2xl" />
            <div>
              <h3 className="font-semibold text-blue-900">Reportes Estáticos</h3>
              <p className="text-sm text-blue-700">
                5 reportes predefinidos listos para usar
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaChartBar className="text-green-600 text-2xl" />
            <div>
              <h3 className="font-semibold text-green-900">Personalizados</h3>
              <p className="text-sm text-green-700">
                Crea reportes a tu medida con filtros
              </p>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaMagic className="text-pink-600 text-2xl" />
            <div>
              <h3 className="font-semibold text-pink-900">Lenguaje Natural</h3>
              <p className="text-sm text-pink-700">
                Genera reportes escribiendo en español
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FaClock className="text-purple-600 text-2xl" />
            <div>
              <h3 className="font-semibold text-purple-900">Historial</h3>
              <p className="text-sm text-purple-700">
                Accede a reportes generados anteriormente
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesPage;
