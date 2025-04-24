import axios from 'axios';

// URL base del API
const API_URL = `${process.env.REACT_APP_API_URL}/tiposbitacoras`;

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Obtener todos los tipos de bitácora
export const getTiposBitacora = async () => {
  try {
    const response = await axios.get(`${API_URL}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de bitácora:', error);
    throw error;
  }
};