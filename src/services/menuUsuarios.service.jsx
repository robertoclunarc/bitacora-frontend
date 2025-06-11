import axios from 'axios';

// URL base del API
const API_URL = `${process.env.REACT_APP_API_URL}/menus-usuarios`;

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Obtener permisos de menús de un usuario
export const getMenuUsuariosByLogin = async (login) => {
  try {
    const response = await axios.get(`${API_URL}/usuario/${login}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener permisos de menús del usuario ${login}:`, error);
    throw error;
  }
};

// Obtener detalles de menús de un usuario
export const getUserMenusWithDetails = async (login) => {
  try {
    const response = await axios.get(`${API_URL}/${login}/details`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalles de menús del usuario ${login}:`, error);
    throw error;
  }
};

// Asignación masiva de menús a un usuario
export const bulkAssignMenusToUser = async (login, menuPermissions) => {
  try {
    const response = await axios.post(
      `${API_URL}/${login}/bulk-assign`,
      {
        menuPermissions // Enviar array de objetos con permisos específicos
      },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al asignar menús al usuario ${login}:`, error);
    throw error;
  }
};

// Crear permiso de menú individual
export const createMenuUsuario = async (menuUsuario) => {
  try {
    const response = await axios.post(`${API_URL}`, menuUsuario, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al crear permiso de menú:', error);
    throw error;
  }
};

// Actualizar permiso de menú
export const updateMenuUsuario = async (idmenu, login, menuUsuario) => {
  try {
    const response = await axios.put(`${API_URL}/${idmenu}/${login}`, menuUsuario, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar permiso de menú ${idmenu}-${login}:`, error);
    throw error;
  }
};

// Eliminar permiso de menú
export const deleteMenuUsuario = async (idmenu, login) => {
  try {
    const response = await axios.delete(`${API_URL}/${idmenu}/${login}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar permiso de menú ${idmenu}-${login}:`, error);
    throw error;
  }
};