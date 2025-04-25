import axios from 'axios';

// URL base del API
const API_URL = `${process.env.REACT_APP_API_URL}/incidencias`;

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Obtener todas las incidencias con paginación y filtros
export const getIncidencias = async (page = 1, limit = 10, filters = {}) => {
  try {
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    // Añadir filtros si existen
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener incidencias:', error);
    throw error;
  }
};

// Obtener una incidencia por ID
export const getIncidenciaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener incidencia ${id}:`, error);
    throw error;
  }
};

// Crear una nueva incidencia
export const createIncidencia = async (incidenciaData) => {
  try {
    const response = await axios.post(`${API_URL}`, incidenciaData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al crear incidencia:', error);
    throw error;
  }
};

// Actualizar una incidencia existente
export const updateIncidencia = async (id, incidenciaData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, incidenciaData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar incidencia ${id}:`, error);
    throw error;
  }
};

// Actualizar el estatus de una incidencia
export const updateIncidenciaStatus = async (id, estatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/status`, 
      { estatus }, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estatus de incidencia ${id}:`, error);
    throw error;
  }
};

// Publicar o quitar una incidencia de cartelera
export const toggleIncidenciaCartelera = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/${id}/cartelera`, 
      {}, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado de cartelera para incidencia ${id}:`, error);
    throw error;
  }
};