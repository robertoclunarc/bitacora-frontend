import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/reuniones`;

export const getReunionesActive = async (limit, offset) => {  
  const config = {
    headers: 
    {'Content-Type': 'application/json'}    
  }
  
  try {    
    const response = await axios.get(`${API_URL}/?limit=${limit}&offset=${offset}`, config);   
    return response.data;
  } catch (error) {
    console.error('Error al obtener menús:', error)
    throw error
  }
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Obtener todas las reuniones con paginación y filtros
export const getReuniones = async (page = 1, limit = 10, filters = {}) => {
  try {
    // Construir parámetros de consulta
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    
    // Añadir filtros si existen
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener reuniones:', error);
    throw error;
  }
};

// Obtener una reunión por ID
export const getReunionById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener reunión ${id}:`, error);
    throw error;
  }
};

// Crear una nueva reunión
export const createReunion = async (reunionData) => {
  try {
    const response = await axios.post(`${API_URL}`, reunionData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al crear reunión:', error);
    throw error;
  }
};

// Actualizar una reunión existente
export const updateReunion = async (id, reunionData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, reunionData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar reunión ${id}:`, error);
    throw error;
  }
};

// Eliminar una reunión
export const deleteReunion = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/reuniones/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar reunión ${id}:`, error);
    throw error;
  }
};

// Actualizar el estatus de una reunión
export const updateReunionStatus = async (id, estatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/estatus`, 
      { estatus }, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estatus de reunión ${id}:`, error);
    throw error;
  }
};