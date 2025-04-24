import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/bitacoras`;

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const getBitacorasActive = async (limit, offset) => {
  
  const config = {
    headers: 
    {'Content-Type': 'application/json'}    
  }
  
  try {    
    const response = await axios.get(`${API_URL}/?limit=${limit}&offset=${offset}`, config);    
    return response.data;
  } catch (error) {
    console.error('Error al obtener Bitacoras:', error)
    throw error
  }
}

// Obtener todas las bitácoras con paginación y filtros
export const getBitacoras = async (page = 1, limit = 10, filters = {}) => {
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
    
    const response = await axios.get(`${API_URL}/authenticated?${params.toString()}`, getAuthHeader());
    return response.data.bitacoras;
  } catch (error) {
    console.error('Error al obtener bitácoras:', error);
    throw error;
  }
};

// Obtener una bitácora por ID
export const getBitacoraById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener bitácora ${id}:`, error);
    throw error;
  }
};

// Crear una nueva bitácora
export const createBitacora = async (bitacoraData) => {
  try {
    
    const response = await axios.post(`${API_URL}`, bitacoraData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al crear bitácora:', error);
    throw error;
  }
};

// Actualizar una bitácora existente
export const updateBitacora = async (id, bitacoraData) => {
  
  try {
    const response = await axios.put(`${API_URL}/${id}`, bitacoraData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar bitácora ${id}:`, error);
    throw error;
  }
};

// Eliminar una bitácora
export const deleteBitacora = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar bitácora ${id}:`, error);
    throw error;
  }
};

// Actualizar el estatus de una bitácora
export const updateBitacoraStatus = async (id, estatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/status`, 
      { estatus }, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estatus de bitácora ${id}:`, error);
    throw error;
  }
};

// Publicar o quitar una bitácora de cartelera
export const toggleBitacoraCartelera = async (id) => {
  try {
    const response = await axios.post(
      `${API_URL}/${id}/cartelera`, 
      {}, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al cambiar estado de cartelera para bitácora ${id}:`, error);
    throw error;
  }
};