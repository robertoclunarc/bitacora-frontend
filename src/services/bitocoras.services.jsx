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
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeader());
    return response.data;
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
      `${API_URL}/${id}/estatus`, 
      { estatus }, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estatus de bitácora ${id}:`, error);
    throw error;
  }
};

// Obtener tipos de bitácoras (catálogo)
export const getTiposBitacora = async () => {
  try {
    const response = await axios.get(`${API_URL}/catalogos/tipos-bitacora`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de bitácora:', error);
    throw error;
  }
};

// Subir archivos adjuntos a una bitácora
export const uploadAdjuntosBitacora = async (bitacoraId, formData) => {
  try {
    const response = await axios.post(
      `${API_URL}/${bitacoraId}/adjuntos`, 
      formData, 
      {
        ...getAuthHeader(),
        headers: {
          ...getAuthHeader().headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error al subir adjuntos para bitácora ${bitacoraId}:`, error);
    throw error;
  }
};

// Eliminar un archivo adjunto
export const deleteAdjuntoBitacora = async (bitacoraId, adjuntoId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/bitacoras/${bitacoraId}/adjuntos/${adjuntoId}`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar adjunto ${adjuntoId} de bitácora ${bitacoraId}:`, error);
    throw error;
  }
};