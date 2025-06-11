import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/menus`;

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export const getMenus = async (token) => {  
  // Configurar headers con el token  
  try {    
    const response = await axios.get(`${API_URL}/tree`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data;
  } catch (error) {
    console.error('Error al obtener menús:', error)
    throw error
  }
}

export const getMenusAll = async () => {
  try {
    const response = await axios.get(`${API_URL}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener menús:', error);
    throw error;
  }
};

// Obtener menú por ID
export const getMenuById = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener menú ${id}:`, error);
    throw error;
  }
};