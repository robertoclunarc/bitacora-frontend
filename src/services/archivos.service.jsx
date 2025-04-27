import axios from 'axios';

// URL base del API
const API_URL = `${process.env.REACT_APP_API_URL}/archivos`;

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Obtener todos los archivos de una bitácora
export const getArchivosByBitacoraId = async (bitacoraId) => {
  try {
    const response = await axios.get(
      `${API_URL}/${bitacoraId}`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener archivos de la bitácora ${bitacoraId}:`, error);
    throw error;
  }
};

// Subir un archivo a una bitácora
export const uploadArchivo = async (bitacoraId, file, descripcion = '') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }
    
    const response = await axios.post(
      `${API_URL}/${bitacoraId}`,
      formData,
      {
        ...getAuthHeader(),
        headers: {
          ...getAuthHeader().headers,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          // Se puede usar para actualizar la barra de progreso
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Progreso de carga: ${percentCompleted}%`);
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error al subir archivo para bitácora ${bitacoraId}:`, error);
    throw error;
  }
};

// Descargar un archivo
export const downloadArchivo = async (bitacoraId, archivoId, filename) => {
  try {
    const response = await axios.get(
      `${API_URL}/${bitacoraId}/${archivoId}`,
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
    a.download = filename || 'archivo';
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error(`Error al descargar archivo ${archivoId} de bitácora ${bitacoraId}:`, error);
    throw error;
  }
};

// Eliminar un archivo
export const deleteArchivo = async (bitacoraId, archivoId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${bitacoraId}/${archivoId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar archivo ${archivoId} de bitácora ${bitacoraId}:`, error);
    throw error;
  }
};

export const getImagenesPublicas = async (limit = 10) => {
  try {
    const response = await axios.get(`${API_URL}/imagenes-publicas?limit=${limit}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener imágenes públicas:', error);
    throw error;
  }
};