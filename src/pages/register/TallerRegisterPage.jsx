import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import TallerRegisterForm from './TallerRegisterForm';
import PagoSuscripcionForm from './PagoSuscripcionForm';
import { registrarTaller } from '@/api/tallerApi';
import { activarSuscripcion } from '@/api/suscripcionApi';
import SuccessNotification from '@/components/SuccessNotification';

// Inicializar Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const TallerRegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreTaller, setNombreTaller] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [registroCompletado, setRegistroCompletado] = useState(false);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);
  
  // Obtener información del plan seleccionado
  const planSeleccionado = location.state?.plan || 'FREE';
  const priceId = location.state?.priceId;
  const precio = location.state?.precio;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }

    if (!nombreTaller.trim()) {
      setError('El nombre del taller es requerido');
      return;
    }

    if (username.includes(' ')) {
      setError('El nombre de usuario no puede contener espacios');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      
      const tallerData = {
        username: username.trim(),
        password: password,
        nombre_taller: nombreTaller.trim(),
      };

      // Solo agregar email si fue proporcionado
      if (email.trim()) {
        tallerData.email = email.trim();
      }

      console.log('📝 Registrando taller:', tallerData);

      const response = await registrarTaller(tallerData);
      
      console.log('✅ Taller registrado exitosamente:', response);
      
      // Mostrar notificación de éxito
      setShowSuccess(true);
      setRegistroCompletado(true);
      
      // Si es un plan de pago, hacer login y mostrar formulario de pago
      if (planSeleccionado !== 'FREE' && priceId) {
        console.log('💳 Plan de pago detectado, preparando formulario de pago...');
        
        // Hacer login automáticamente para obtener el token
        try {
          const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}auth/token/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username.trim(),
              password: password
            })
          });
          
          if (loginResponse.ok) {
            const tokens = await loginResponse.json();
            localStorage.setItem('access', tokens.access);
            localStorage.setItem('refresh', tokens.refresh);
            
            // Guardar datos del usuario
            if (tokens.user_data) {
              localStorage.setItem('username', tokens.user_data.username);
              localStorage.setItem('userRole', tokens.user_data.tenant?.es_propietario ? 'admin' : 'empleado');
              
              // Guardar información del taller
              if (tokens.user_data.tenant) {
                localStorage.setItem('nombre_taller', tokens.user_data.tenant.nombre_taller || nombreTaller);
                if (tokens.user_data.tenant.logo) {
                  localStorage.setItem('logo_taller', tokens.user_data.tenant.logo);
                }
              }
            }
            
            // Mostrar formulario de pago embebido
            setTimeout(() => {
              setMostrarPago(true);
            }, 1500);
          } else {
            throw new Error('Error en login automático');
          }
        } catch (loginError) {
          console.error('Error en login automático:', loginError);
          setError('Taller registrado, pero hubo un error al preparar el pago. Por favor inicia sesión y ve a la sección de suscripciones.');
          setTimeout(() => {
            navigate('/login');
          }, 4000);
        }
      } else {
        // Plan gratuito - ir al login después de 2 segundos
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

    } catch (err) {
      console.error('❌ Error en el registro:', err);
      
      let errorMessage = 'Error al registrar el taller';
      
      if (err.message) {
        try {
          // Intentar parsear si es un JSON
          const errorObj = JSON.parse(err.message);
          
          if (errorObj.username) {
            errorMessage = `Usuario: ${errorObj.username.join(', ')}`;
          } else if (errorObj.nombre_taller) {
            errorMessage = `Taller: ${errorObj.nombre_taller.join(', ')}`;
          } else if (errorObj.email) {
            errorMessage = `Email: ${errorObj.email.join(', ')}`;
          } else {
            errorMessage = err.message;
          }
        } catch {
          // Si no es JSON, usar el mensaje tal cual
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePagoExitoso = async (subscriptionId, paymentIntentId) => {
    try {
      console.log('💳 Pago confirmado, activando suscripción...', { 
        planSeleccionado, 
        subscriptionId,
        paymentIntentId 
      });
      
      // Activar la suscripción en el backend con el payment_intent_id
      const response = await activarSuscripcion(planSeleccionado, paymentIntentId);
      
      console.log('✅ Suscripción activada:', response);
      
      // Asegurar que el rol esté guardado como admin (propietario)
      localStorage.setItem('userRole', 'admin');
      
      // Verificar que se guardó correctamente
      const rolGuardado = localStorage.getItem('userRole');
      const tokenGuardado = localStorage.getItem('access');
      console.log('📝 Estado del localStorage:', {
        rol: rolGuardado,
        tieneToken: !!tokenGuardado,
        username: localStorage.getItem('username'),
        nombreTaller: localStorage.getItem('nombre_taller')
      });
      
      // Marcar que el pago fue completado
      setPagoCompletado(true);
      setMostrarPago(false);
      setShowSuccess(true);
      
      // Redirigir con window.location para forzar recarga completa
      console.log('🔄 Redirigiendo a /admin/dashboard con window.location...');
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 500);
    } catch (error) {
      console.error('❌ Error activando suscripción:', error);
      setError('Pago procesado correctamente, pero hubo un error al activar la suscripción. Por favor contacta a soporte.');
    }
  };

  const handleCancelarPago = () => {
    setMostrarPago(false);
    navigate('/login');
  };

  // Si el pago está completado, mostrar pantalla de éxito
  if (pagoCompletado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
            <p className="text-gray-600 mb-4">Tu suscripción ha sido activada correctamente</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-4">Redirigiendo al panel administrativo...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si se está mostrando el formulario de pago
  if (mostrarPago) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Elements stripe={stripePromise}>
            <PagoSuscripcionForm
              plan={planSeleccionado}
              precio={precio}
              priceId={priceId}
              onSuccess={handlePagoExitoso}
              onCancel={handleCancelarPago}
            />
          </Elements>
        </div>
      </div>
    );
  }

  return (
    <>
      <TallerRegisterForm
        username={username}
        email={email}
        password={password}
        nombreTaller={nombreTaller}
        setUsername={setUsername}
        setEmail={setEmail}
        setPassword={setPassword}
        setNombreTaller={setNombreTaller}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
      
      {showSuccess && !mostrarPago && (
        <SuccessNotification
          message={
            registroCompletado && planSeleccionado !== 'FREE'
              ? "¡Pago procesado exitosamente! Redirigiendo al panel administrativo..." 
              : planSeleccionado !== 'FREE' 
                ? "¡Taller registrado exitosamente! Preparando formulario de pago..." 
                : "¡Taller registrado exitosamente! Redirigiendo al login..."
          }
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  );
};

export default TallerRegisterPage;
