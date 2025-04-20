import axios from 'axios';

// URL base del API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Enviar notificación por correo sobre una reunión
export const sendReunionNotification = async (notificationData) => {
  try {
    const response = await axios.post(
      `${API_URL}/notificaciones/reunion`, 
      notificationData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error al enviar notificación de reunión:', error);
    throw error;
  }
};