// src/services/tareas.service.js
import axios from 'axios';

// URL base del API
const API_URL = `${process.env.REACT_APP_API_URL}/tareas`;

// Función para obtener el token de autenticación
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

// Obtener todas las tareas con paginación y filtros
export const getTareas = async (page = 1, limit = 10, filters = {}) => {
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
    return response.data;
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    throw error;
  }
};

// Obtener una tarea por ID
export const getTareaById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener tarea ${id}:`, error);
    throw error;
  }
};

// Crear una nueva tarea
export const createTarea = async (tareaData) => {
  try {
    const response = await axios.post(`${API_URL}`, tareaData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error al crear tarea:', error);
    throw error;
  }
};

// Actualizar una tarea existente
export const updateTarea = async (id, tareaData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, tareaData, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar tarea ${id}:`, error);
    throw error;
  }
};

// Actualizar el estatus de una tarea
export const updateTareaStatus = async (id, estatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/status`, 
      { estatus }, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estatus de tarea ${id}:`, error);
    throw error;
  }
};