// src/services/oldBitacoras.service.js
import axios from 'axios';

// URL base del API
const API_URL = `${process.env.REACT_APP_API_URL}/old-bitacoras`;

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Obtener bitácoras históricas con paginación y filtros
export const getOldBitacoras = async (page = 1, limit = 10, filters = {}) => {
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
    
    // Realizar la solicitud
    const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener históricos de bitácoras:', error);
    throw error;
  }
};

// Obtener un histórico de bitácora por folio
export const getOldBitacoraByFecha = async (fecha, hora) => {
  try {
    const response = await axios.get(`${API_URL}/${fecha}/${hora}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener histórico de bitácora ${fecha} ${hora}:`, error);
    throw error;
  }
};

// Obtener catálogos para filtros
export const getOldBitacorasCatalogos = async () => {
  try {
    const response = await axios.get(`${API_URL}/catalogos`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al obtener catálogos de históricos de bitácoras:', error);
    throw error;
  }
};