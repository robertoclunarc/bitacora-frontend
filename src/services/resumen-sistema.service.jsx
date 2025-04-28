import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/resumen-sistema`;

export const getTotalUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios/total`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener total de usuarios:', error);
      throw error;
    }
  };
  
  // Obtener estadísticas de actividad de usuarios
  export const getActividadUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios/actividad`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener actividad de usuarios:', error);
      throw error;
    }
  };

  
export const getReunionesPendientes = async () => {
    try {
      const response = await axios.get(`${API_URL}/reuniones/pendientes`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reuniones pendientes:', error);
      throw error;
    }
  };