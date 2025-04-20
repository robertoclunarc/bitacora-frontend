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

// Obtener todas las minutas de una reunión
export const getMinutasByReunion = async (reunionId) => {
  try {
    const response = await axios.get(`${API_URL}/minutas/reunion/${reunionId}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener minutas de la reunión ${reunionId}:`, error);
    throw error;
  }
};

// Obtener una minuta por ID
export const getMinutaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/minutas/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener minuta ${id}:`, error);
    throw error;
  }
};

// Crear una nueva minuta
export const createMinuta = async (minutaData) => {
  try {
    const response = await axios.post(`${API_URL}/minutas`, minutaData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al crear minuta:', error);
    throw error;
  }
};

// Actualizar una minuta existente
export const updateMinuta = async (id, minutaData) => {
  try {
    const response = await axios.put(`${API_URL}/minutas/${id}`, minutaData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar minuta ${id}:`, error);
    throw error;
  }
};

// Eliminar una minuta
export const deleteMinuta = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/minutas/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar minuta ${id}:`, error);
    throw error;
  }
};