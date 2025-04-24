import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/carteleras`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const getCarteleraActive = async (limit, offset) => {
  
  const config = {
    headers: 
    {'Content-Type': 'application/json'}
  }
  
  try {    
    const response = await axios.get(`${API_URL}/active/${limit}/${offset}`, config);    
    return response.data;
  } catch (error) {
    console.error('Error al obtener menús:', error)
    throw error
  }
}

export const getCarteleras = async (page = 1, limit = 10, filters = {}) => {
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
    return response.data.carteleras;
  } catch (error) {
    console.error('Error al obtener carteleras:', error);
    throw error;
  }
};

// Obtener una cartelera por ID
export const getCarteleraById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener cartelera ${id}:`, error);
    throw error;
  }
};

// Crear una nueva cartelera
export const createCartelera = async (carteleraData) => {
  try {
    const response = await axios.post(`${API_URL}`, carteleraData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al crear cartelera:', error);
    throw error;
  }
};

// Actualizar una cartelera existente
export const updateCartelera = async (id, carteleraData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, carteleraData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar cartelera ${id}:`, error);
    throw error;
  }
};

// Actualizar el estatus de una cartelera
export const updateCarteleraStatus = async (id, estatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/status`, 
      { estatus }, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estatus de cartelera ${id}:`, error);
    throw error;
  }
};