import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaStore, FaRocket, FaBuilding } from 'react-icons/fa';

const PlanesPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const planes = [
    {
      id: 'FREE',
      nombre: 'Gratuito',
      precio: 0,
      periodo: '14 días de prueba',
      descripcion: 'Perfecto para probar el sistema',
      icon: <FaStore className="text-4xl text-blue-600" />,
      caracteristicas: [
        '14 días de prueba gratuita',
        'Gestión de clientes básica',
        'Órdenes de trabajo ilimitadas',
        'Inventario básico',
        'Soporte por email'
      ],
      destacado: false,
      priceId: null
    },
    {
      id: 'BASIC',
      nombre: 'Plan Básico',
      precio: 300,
      periodo: 'mensual',
      descripcion: 'Ideal para talleres pequeños. Hasta 2 empleados y 50 órdenes al mes.',
      icon: <FaStore className="text-4xl text-green-600" />,
      caracteristicas: [
        'Hasta 2 empleados',
        'Hasta 50 órdenes al mes',
        'Gestión de clientes',
        'Inventario básico',
        'Reportes básicos',
        'Soporte por email'
      ],
      destacado: false,
      priceId: import.meta.env.VITE_PRICE_ID_BASIC
    },
    {
      id: 'PRO',
      nombre: 'Plan Profesional',
      precio: 600,
      periodo: 'mensual',
      descripcion: 'Para talleres en crecimiento. Hasta 5 empleados, órdenes ilimitadas y acceso al Chatbot IA.',
      icon: <FaRocket className="text-4xl text-purple-600" />,
      caracteristicas: [
        'Hasta 5 empleados',
        'Órdenes ilimitadas',
        'Acceso al Chatbot IA',
        'Reportes avanzados',
        'Gestión completa de inventario',
        'Backup automático',
        'Soporte prioritario'
      ],
      destacado: true,
      priceId: import.meta.env.VITE_PRICE_ID_PRO
    },
    {
      id: 'ENTERPRISE',
      nombre: 'Plan Enterprise',
      precio: 1000,
      periodo: 'mensual',
      descripcion: 'Gestión total. Empleados ilimitados, soporte prioritario, múltiples sucursales y reportes avanzados.',
      icon: <FaBuilding className="text-4xl text-orange-600" />,
      caracteristicas: [
        'Empleados ilimitados',
        'Órdenes ilimitadas',
        'Múltiples sucursales',
        'Soporte prioritario 24/7',
        'Reportes personalizados',
        'API de integración',
        'Gerente de cuenta dedicado',
        'Capacitación personalizada'
      ],
      destacado: false,
      priceId: import.meta.env.VITE_PRICE_ID_ENTERPRISE
    }
  ];

  const handleSelectPlan = (plan) => {
    if (plan.id === 'FREE') {
      // Plan gratuito - ir directo al registro
      navigate('/register-taller', { state: { plan: plan.id } });
    } else {
      // Planes de pago - ir a registro con información del plan
      navigate('/register-taller', { 
        state: { 
          plan: plan.id,
          priceId: plan.priceId,
          precio: plan.precio
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Selecciona tu Plan</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Elige el plan perfecto para tu taller
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comienza con 14 días gratis o selecciona el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        {/* Grid de planes */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.destacado ? 'ring-4 ring-purple-500 relative' : ''
              }`}
            >
              {plan.destacado && (
                <div className="bg-purple-500 text-white text-center py-2 text-sm font-bold">
                  MÁS POPULAR
                </div>
              )}
              
              <div className="p-6">
                {/* Icono y nombre */}
                <div className="flex flex-col items-center mb-6">
                  {plan.icon}
                  <h3 className="text-2xl font-bold text-gray-900 mt-4">{plan.nombre}</h3>
                  <p className="text-sm text-gray-600 mt-2">{plan.descripcion}</p>
                </div>

                {/* Precio */}
                <div className="text-center mb-6">
                  {plan.precio === 0 ? (
                    <div>
                      <span className="text-4xl font-bold text-gray-900">Gratis</span>
                      <p className="text-sm text-gray-600 mt-1">{plan.periodo}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold text-gray-900">Bs {plan.precio}</span>
                      <span className="text-gray-600">/{plan.periodo}</span>
                    </div>
                  )}
                </div>

                {/* Características */}
                <ul className="space-y-3 mb-8">
                  {plan.caracteristicas.map((caracteristica, index) => (
                    <li key={index} className="flex items-start">
                      <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{caracteristica}</span>
                    </li>
                  ))}
                </ul>

                {/* Botón */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    plan.destacado
                      ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                      : plan.id === 'FREE'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-800 text-white hover:bg-gray-900'
                  }`}
                >
                  {plan.id === 'FREE' ? 'Comenzar Gratis' : 'Seleccionar Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Tienes dudas sobre qué plan elegir?
          </h3>
          <p className="text-gray-700 mb-6">
            Comienza con nuestro plan gratuito de 14 días y explora todas las funcionalidades. 
            Puedes cambiar de plan en cualquier momento.
          </p>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Sin tarjeta de crédito para el plan gratuito
            </div>
            <div className="flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Cancela cuando quieras
            </div>
            <div className="flex items-center">
              <FaCheck className="text-green-500 mr-2" />
              Soporte incluido en todos los planes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanesPage;
