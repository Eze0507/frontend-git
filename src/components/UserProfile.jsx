import React, { useState, useEffect } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaKey, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { fetchUserProfile, updateUserProfile, changePassword } from '../api/userProfileApi.jsx';

const UserProfile = ({ onClose }) => {
  const [currentView, setCurrentView] = useState('view'); // 'view', 'edit', 'password'
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userType, setUserType] = useState(null); // 'empleado' o 'cliente'
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    direccion: '',
    telefono: '',
    username: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setErrors({});
    try {
      const token = localStorage.getItem('access');
      console.log('🔑 Token disponible:', !!token);
      
      // Usar la vista unificada del backend primero
      console.log('👤 Intentando obtener perfil usando vista unificada...');
      let response = await fetch('http://127.0.0.1:8000/api/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📊 Respuesta vista unificada status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Perfil obtenido desde vista unificada:', result);
        
        const { type, data } = result;
        setUserType(type);
        setUserProfile(data);
        setFormData({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          username: data.usuario_info?.username || data.username || '',
          email: data.usuario_info?.email || data.email || '',
          ...(type === 'empleado' ? { ci: data.ci || '', sueldo: data.sueldo || '' } : { 
            nit: data.nit || '', 
            tipo_cliente: data.tipo_cliente || 'NATURAL' 
          })
        });
        return; // Salir exitosamente
      }
      
      // Si la vista unificada falla, usar el método anterior como fallback
      console.log('ℹ️ Vista unificada falló, intentando método individual...');
      
      // Intentar obtener perfil de empleado primero
      console.log('👤 Intentando obtener perfil de empleado...');
      response = await fetch('http://127.0.0.1:8000/api/empleado/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      let data;
      let type = 'empleado';
      
      console.log('📊 Respuesta empleado status:', response.status);
      
      if (response.ok) {
        data = await response.json();
        console.log('✅ Perfil de empleado encontrado:', data);
      } else if (response.status === 404) {
        console.log('ℹ️ No es empleado, intentando cliente...');
        // Si no es empleado, intentar cliente
        response = await fetch('http://127.0.0.1:8000/api/cliente/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📊 Respuesta cliente status:', response.status);
        
        if (response.ok) {
          data = await response.json();
          type = 'cliente';
          console.log('✅ Perfil de cliente encontrado:', data);
        } else {
          const errorData = await response.json();
          console.error('❌ Error al obtener perfil de cliente:', errorData);
          throw new Error(errorData.detail || 'No se encontró perfil de usuario');
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Error al obtener perfil de empleado:', errorData);
        throw new Error(errorData.detail || 'Error al obtener el perfil');
      }

      setUserType(type);
      setUserProfile(data);
      setFormData({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        username: data.usuario_info?.username || data.username || '',
        email: data.usuario_info?.email || data.email || '',
        ...(type === 'empleado' ? { ci: data.ci || '', sueldo: data.sueldo || '' } : { 
          nit: data.nit || '', 
          tipo_cliente: data.tipo_cliente || 'NATURAL' 
        })
      });
    } catch (error) {
      console.error('❌ Error general al cargar perfil:', error);
      setErrors({ general: error.message || 'Error al cargar el perfil del usuario' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    // Limpiar errores al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const token = localStorage.getItem('access');
      const endpoint = userType === 'empleado' ? '/empleado/profile/' : '/cliente/profile/';
      
      const response = await fetch(`http://127.0.0.1:8000/api${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setUserProfile(updatedData);
        setCurrentView('view');
        setSuccessMessage('Perfil actualizado exitosamente');
        
        // Actualizar el nombre en localStorage si cambió
        if (formData.username) {
          localStorage.setItem('username', formData.username);
        }
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        
        // Manejar errores específicos del backend
        if (errorData.error) {
          setErrors({ general: errorData.error });
        } else if (errorData.detail) {
          setErrors({ general: errorData.detail });
        } else {
          // Manejar errores de validación de campos
          if (errorData.nombre) setErrors(prev => ({ ...prev, nombre: Array.isArray(errorData.nombre) ? errorData.nombre[0] : errorData.nombre }));
          if (errorData.apellido) setErrors(prev => ({ ...prev, apellido: Array.isArray(errorData.apellido) ? errorData.apellido[0] : errorData.apellido }));
          if (errorData.telefono) setErrors(prev => ({ ...prev, telefono: Array.isArray(errorData.telefono) ? errorData.telefono[0] : errorData.telefono }));
          if (errorData.email) setErrors(prev => ({ ...prev, email: Array.isArray(errorData.email) ? errorData.email[0] : errorData.email }));
          if (errorData.nit) setErrors(prev => ({ ...prev, nit: Array.isArray(errorData.nit) ? errorData.nit[0] : errorData.nit }));
          if (errorData.ci) setErrors(prev => ({ ...prev, ci: Array.isArray(errorData.ci) ? errorData.ci[0] : errorData.ci }));
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Error al actualizar el perfil. Verifique su conexión.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setErrors({});
    setSuccessMessage('');

    // Validar que las contraseñas coincidan
    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrors({ confirm_password: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    // Validar longitud mínima
    if (passwordData.new_password.length < 8) {
      setErrors({ new_password: 'La contraseña debe tener al menos 8 caracteres' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('access');
      
      const response = await fetch('http://127.0.0.1:8000/api/change-password/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        }),
      });

      if (response.ok) {
        setCurrentView('view');
        setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
        setSuccessMessage('Contraseña cambiada exitosamente');
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        if (errorData.old_password) {
          setErrors({ old_password: errorData.old_password[0] });
        }
        if (errorData.new_password) {
          setErrors({ new_password: errorData.new_password[0] });
        }
        if (errorData.detail) {
          setErrors({ general: errorData.detail });
        }
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors({ general: 'Error al cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  const renderViewMode = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <p className="px-3 py-2 bg-gray-50 rounded-md border">{userProfile?.nombre || 'No especificado'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <p className="px-3 py-2 bg-gray-50 rounded-md border">{userProfile?.apellido || 'No especificado'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <p className="px-3 py-2 bg-gray-50 rounded-md border">
            {userProfile?.usuario_info?.username || userProfile?.username || 'No especificado'}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <p className="px-3 py-2 bg-gray-50 rounded-md border">
            {userProfile?.usuario_info?.email || userProfile?.email || 'No especificado'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userType === 'empleado' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CI</label>
            <p className="px-3 py-2 bg-gray-50 rounded-md border">{userProfile?.ci || 'No especificado'}</p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIT</label>
            <p className="px-3 py-2 bg-gray-50 rounded-md border">{userProfile?.nit || 'No especificado'}</p>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <p className="px-3 py-2 bg-gray-50 rounded-md border">{userProfile?.telefono || 'No especificado'}</p>
        </div>
      </div>

      {userType === 'cliente' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
          <p className="px-3 py-2 bg-gray-50 rounded-md border">
            {userProfile?.tipo_cliente === 'EMPRESA' ? 'Empresa' : 'Natural'}
          </p>
        </div>
      )}

      {userType === 'empleado' && userProfile?.sueldo && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sueldo</label>
          <p className="px-3 py-2 bg-gray-50 rounded-md border">{userProfile.sueldo}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <p className="px-3 py-2 bg-gray-50 rounded-md border">{userProfile?.direccion || 'No especificado'}</p>
      </div>
    </div>
  );

  const renderEditMode = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.nombre ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.apellido ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userType === 'empleado' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CI *</label>
            <input
              type="text"
              name="ci"
              value={formData.ci}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.ci ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.ci && <p className="text-red-500 text-sm mt-1">{errors.ci}</p>}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIT *</label>
            <input
              type="text"
              name="nit"
              value={formData.nit}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.nit ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.nit && <p className="text-red-500 text-sm mt-1">{errors.nit}</p>}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.telefono ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
        </div>
      </div>

      {userType === 'cliente' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
          <select
            name="tipo_cliente"
            value={formData.tipo_cliente}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="NATURAL">Natural</option>
            <option value="EMPRESA">Empresa</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.username ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
        <textarea
          name="direccion"
          value={formData.direccion}
          onChange={handleInputChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );

  const renderPasswordMode = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual *</label>
        <div className="relative">
          <input
            type={showPasswords.old ? "text" : "password"}
            name="old_password"
            value={passwordData.old_password}
            onChange={handlePasswordChange}
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.old_password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ingresa tu contraseña actual"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('old')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.old_password && <p className="text-red-500 text-sm mt-1">{errors.old_password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña *</label>
        <div className="relative">
          <input
            type={showPasswords.new ? "text" : "password"}
            name="new_password"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.new_password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Ingresa tu nueva contraseña"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.new_password && <p className="text-red-500 text-sm mt-1">{errors.new_password}</p>}
        <p className="text-xs text-gray-500 mt-1">La contraseña debe tener al menos 8 caracteres</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña *</label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            name="confirm_password"
            value={passwordData.confirm_password}
            onChange={handlePasswordChange}
            className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.confirm_password ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Confirma tu nueva contraseña"
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaUser className="mr-2 text-indigo-600" />
            {currentView === 'view' && 'Mi Perfil'}
            {currentView === 'edit' && 'Editar Perfil'}
            {currentView === 'password' && 'Cambiar Contraseña'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          {/* Messages */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {successMessage}
            </div>
          )}

          {/* Content */}
          {currentView === 'view' && renderViewMode()}
          {currentView === 'edit' && renderEditMode()}
          {currentView === 'password' && renderPasswordMode()}

          {/* Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div>
              {currentView === 'view' && (
                <button
                  onClick={() => setCurrentView('password')}
                  className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors duration-200 flex items-center mr-3"
                >
                  <FaKey className="mr-2" />
                  Cambiar Contraseña
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {currentView !== 'view' && (
                <button
                  onClick={() => {
                    setCurrentView('view');
                    setErrors({});
                    setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaTimes className="mr-2" />
                  Cancelar
                </button>
              )}
              
              {currentView === 'view' && (
                <button
                  onClick={() => setCurrentView('edit')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Editar Perfil
                </button>
              )}
              
              {currentView === 'edit' && (
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center disabled:opacity-50"
                >
                  <FaSave className="mr-2" />
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              )}
              
              {currentView === 'password' && (
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center disabled:opacity-50"
                >
                  <FaLock className="mr-2" />
                  {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
