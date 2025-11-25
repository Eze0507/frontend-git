import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';

const MiPerfilPage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Datos del usuario desde localStorage
  const [userData, setUserData] = useState({
    username: localStorage.getItem('username') || '',
    email: localStorage.getItem('email') || '',
    nombre: localStorage.getItem('nombre') || '',
    apellido: localStorage.getItem('apellido') || '',
    telefono: localStorage.getItem('telefono') || '',
    direccion: localStorage.getItem('direccion') || '',
    role: localStorage.getItem('userRole') || 'cliente'
  });

  const [editedData, setEditedData] = useState({...userData});

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({...userData});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({...userData});
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Aquí puedes agregar la llamada al API para actualizar el perfil
      // Por ahora solo actualizamos el localStorage
      localStorage.setItem('nombre', editedData.nombre);
      localStorage.setItem('apellido', editedData.apellido);
      localStorage.setItem('telefono', editedData.telefono);
      localStorage.setItem('direccion', editedData.direccion);
      localStorage.setItem('email', editedData.email);
      
      setUserData({...editedData});
      setIsEditing(false);
      
      // Mostrar mensaje de éxito
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setEditedData({
      ...editedData,
      [field]: value
    });
  };

  const handleLogout = () => {
    // Limpiar localStorage completamente
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    localStorage.removeItem('email');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellido');
    localStorage.removeItem('telefono');
    localStorage.removeItem('direccion');
    
    // Redirigir a la página principal con recarga completa
    window.location.href = '/';
  };

  return (
    <div style={styles.container}>
      {/* Header con botón de regreso */}
      <div style={styles.header}>
        <button 
          style={styles.backButton}
          onClick={() => navigate('/cliente/inicio')}
        >
          <FaArrowLeft style={styles.backIcon} />
          Volver al Dashboard
        </button>
      </div>

      {/* Card principal del perfil */}
      <div style={styles.profileCard}>
        {/* Avatar y nombre */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarCircle}>
            <FaUser style={styles.avatarIcon} />
          </div>
          <div style={styles.nameSection}>
            <h1 style={styles.userName}>
              {userData.nombre} {userData.apellido}
            </h1>
            <p style={styles.userRole}>Cliente</p>
            <p style={styles.username}>@{userData.username}</p>
          </div>
          {!isEditing && (
            <button 
              style={styles.editButton}
              onClick={handleEdit}
            >
              <FaEdit style={styles.editIcon} />
              Editar Perfil
            </button>
          )}
        </div>

        <div style={styles.divider}></div>

        {/* Información del perfil */}
        <div style={styles.infoSection}>
          <h2 style={styles.sectionTitle}>Información Personal</h2>
          
          <div style={styles.infoGrid}>
            {/* Nombre */}
            <div style={styles.infoField}>
              <label style={styles.label}>
                <FaUser style={styles.labelIcon} />
                Nombre
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.nombre}
                  onChange={(e) => handleChange('nombre', e.target.value)}
                  style={styles.input}
                  placeholder="Ingresa tu nombre"
                />
              ) : (
                <p style={styles.value}>{userData.nombre || 'No especificado'}</p>
              )}
            </div>

            {/* Apellido */}
            <div style={styles.infoField}>
              <label style={styles.label}>
                <FaUser style={styles.labelIcon} />
                Apellido
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.apellido}
                  onChange={(e) => handleChange('apellido', e.target.value)}
                  style={styles.input}
                  placeholder="Ingresa tu apellido"
                />
              ) : (
                <p style={styles.value}>{userData.apellido || 'No especificado'}</p>
              )}
            </div>

            {/* Email */}
            <div style={styles.infoField}>
              <label style={styles.label}>
                <FaEnvelope style={styles.labelIcon} />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                />
              ) : (
                <p style={styles.value}>{userData.email || 'No especificado'}</p>
              )}
            </div>

            {/* Teléfono */}
            <div style={styles.infoField}>
              <label style={styles.label}>
                <FaPhone style={styles.labelIcon} />
                Teléfono
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedData.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  style={styles.input}
                  placeholder="Ingresa tu teléfono"
                />
              ) : (
                <p style={styles.value}>{userData.telefono || 'No especificado'}</p>
              )}
            </div>

            {/* Dirección - Ocupa dos columnas */}
            <div style={{...styles.infoField, gridColumn: '1 / -1'}}>
              <label style={styles.label}>
                <FaMapMarkerAlt style={styles.labelIcon} />
                Dirección
              </label>
              {isEditing ? (
                <textarea
                  value={editedData.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  style={styles.textarea}
                  placeholder="Ingresa tu dirección completa"
                  rows="3"
                />
              ) : (
                <p style={styles.value}>{userData.direccion || 'No especificado'}</p>
              )}
            </div>
          </div>

          {/* Botones de acción al editar */}
          {isEditing && (
            <div style={styles.actionButtons}>
              <button 
                style={styles.cancelButton}
                onClick={handleCancel}
                disabled={loading}
              >
                <FaTimes style={styles.buttonIcon} />
                Cancelar
              </button>
              <button 
                style={styles.saveButton}
                onClick={handleSave}
                disabled={loading}
              >
                <FaSave style={styles.buttonIcon} />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Estilos inline JSX
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    marginBottom: '2rem'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  backIcon: {
    fontSize: '0.9rem'
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '2.5rem',
    maxWidth: '900px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  avatarCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px rgba(250, 112, 154, 0.3)'
  },
  avatarIcon: {
    fontSize: '3.5rem',
    color: 'white'
  },
  nameSection: {
    flex: 1,
    minWidth: '200px'
  },
  userName: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  userRole: {
    fontSize: '1rem',
    color: '#667eea',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.25rem',
    margin: '0 0 0.25rem 0'
  },
  username: {
    fontSize: '0.95rem',
    color: '#999',
    margin: 0
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.75rem',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },
  editIcon: {
    fontSize: '0.9rem'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '2rem 0'
  },
  infoSection: {
    marginTop: '2rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '1.5rem',
    margin: '0 0 1.5rem 0'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem'
  },
  infoField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  labelIcon: {
    fontSize: '0.85rem',
    color: '#667eea'
  },
  value: {
    fontSize: '1.05rem',
    color: '#1a1a1a',
    fontWeight: '500',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    margin: 0
  },
  input: {
    fontSize: '1rem',
    padding: '0.875rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },
  textarea: {
    fontSize: '1rem',
    padding: '0.875rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
    justifyContent: 'flex-end'
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.75rem',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.75rem',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  },
  buttonIcon: {
    fontSize: '0.9rem'
  },
  logoutSection: {
    maxWidth: '900px',
    margin: '2rem auto 0',
    display: 'flex',
    justifyContent: 'center'
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 2.5rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
  },
  logoutIcon: {
    fontSize: '1.1rem'
  }
};

export default MiPerfilPage;
