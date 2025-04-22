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

// Obtener todos los adjuntos de una bitácora
export const getAdjuntosByBitacoraId = async (bitacoraId) => {
  try {
    const response = await axios.get(
      `${API_URL}/bitacoras/${bitacoraId}/adjuntos`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener adjuntos de la bitácora ${bitacoraId}:`, error);
    throw error;
  }
};

// Subir un nuevo adjunto
export const uploadAdjunto = async (bitacoraId, file, descripcion = '') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }
    
    const response = await axios.post(
      `${API_URL}/bitacoras/${bitacoraId}/adjuntos`,
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
    console.error(`Error al subir adjunto para bitácora ${bitacoraId}:`, error);
    throw error;
  }
};

// Eliminar un adjunto
export const deleteAdjunto = async (bitacoraId, adjuntoId) => {
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

// Descargar un adjunto
export const downloadAdjunto = async (bitacoraId, adjuntoId, filename) => {
  try {
    const response = await axios.get(
      `${API_URL}/bitacoras/${bitacoraId}/adjuntos/${adjuntoId}/download`,
      {
        ...getAuthHeader(),
        responseType: 'blob'
      }
    );
    
    // Crear un blob URL para la descarga
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    
    // Crear un enlace temporal para iniciar la descarga
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'adjunto';
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error(`Error al descargar adjunto ${adjuntoId} de bitácora ${bitacoraId}:`, error);
    throw error;
  }
};