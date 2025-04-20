import axios from 'axios';

// URL base del API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
// URL para la API externa de integrantes
const EXTERNAL_API_URL = process.env.REACT_APP_EXTERNAL_API_URL || 'http://localhost:3250/sist_tthh/api/trabajadores';

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Obtener todos los integrantes de una reunión
export const getIntegrantesByReunion = async (reunionId) => {
  try {
    const response = await axios.get(
      `${API_URL}/integrantes-reunion/reunion/${reunionId}`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener integrantes de la reunión ${reunionId}:`, error);
    throw error;
  }
};

// Crear un nuevo integrante
export const createIntegrante = async (integranteData) => {
  try {
    const response = await axios.post(
      `${API_URL}/integrantes-reunion`, 
      integranteData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error al crear integrante:', error);
    throw error;
  }
};

// Actualizar un integrante existente
export const updateIntegrante = async (id, integranteData) => {
  try {
    const response = await axios.put(
      `${API_URL}/integrantes-reunion/${id}`, 
      integranteData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar integrante ${id}:`, error);
    throw error;
  }
};

// Eliminar un integrante
export const deleteIntegrante = async (id) => {
  try {
    const response = await axios.delete(
      `${API_URL}/integrantes-reunion/${id}`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar integrante ${id}:`, error);
    throw error;
  }
};

// Buscar integrantes en la API externa
export const searchIntegrantes = async (searchTerm = '') => {
  try {
    const response = await axios.get(
      `${EXTERNAL_API_URL}/search/${searchTerm}`
    );
    return response.data;
  } catch (error) {
    console.error('Error al buscar integrantes en la API externa:', error);
    throw error;
  }
};