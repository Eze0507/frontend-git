import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { activarSuscripcion } from '@/api/suscripcionApi';

const SuscripcionExitoPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [estado, setEstado] = useState('procesando'); // procesando, exito, error
  const [mensaje, setMensaje] = useState('Procesando tu suscripción...');
  
  useEffect(() => {
    const procesarPago = async () => {
      const sessionId = searchParams.get('session_id');
      const success = searchParams.get('success');
      
      if (success === 'true' && sessionId) {
        try {
          // Activar la suscripción en el backend
          const plan = localStorage.getItem('plan_seleccionado') || 'BASIC';
          await activarSuscripcion(plan);
          
          setEstado('exito');
          setMensaje('¡Suscripción activada exitosamente!');
          
          // Limpiar el plan del localStorage
          localStorage.removeItem('plan_seleccionado');
          
          // Redirigir al dashboard después de 3 segundos
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 3000);
          
        } catch (error) {
          console.error('Error activando suscripción:', error);
          setEstado('error');
          setMensaje('Hubo un error al activar tu suscripción. Por favor contacta a soporte.');
        }
      } else if (success === 'false') {
        setEstado('error');
        setMensaje('El pago fue cancelado. Puedes intentarlo nuevamente desde tu perfil.');
        
        setTimeout(() => {
          navigate('/admin/mi-taller');
        }, 3000);
      }
    };
    
    procesarPago();
  }, [searchParams, navigate]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {estado === 'procesando' && (
          <>
            <FaSpinner className="text-6xl text-blue-600 animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Procesando Pago
            </h1>
            <p className="text-gray-600">
              {mensaje}
            </p>
          </>
        )}
        
        {estado === 'exito' && (
          <>
            <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Pago Exitoso!
            </h1>
            <p className="text-gray-600 mb-6">
              {mensaje}
            </p>
            <p className="text-sm text-gray-500">
              Serás redirigido al dashboard en unos segundos...
            </p>
          </>
        )}
        
        {estado === 'error' && (
          <>
            <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error en el Pago
            </h1>
            <p className="text-gray-600 mb-6">
              {mensaje}
            </p>
            <button
              onClick={() => navigate('/admin/mi-taller')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ir a Mi Taller
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuscripcionExitoPage;
