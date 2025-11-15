import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TallerRegisterForm from './TallerRegisterForm';
import { registrarTaller } from '@/api/tallerApi';
import SuccessNotification from '@/components/SuccessNotification';

const TallerRegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreTaller, setNombreTaller] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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
      
      // Esperar 2 segundos y redirigir al login
      setTimeout(() => {
        navigate('/login');
      }, 2000);

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
      
      {showSuccess && (
        <SuccessNotification
          message="¡Taller registrado exitosamente! Redirigiendo al login..."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </>
  );
};

export default TallerRegisterPage;
