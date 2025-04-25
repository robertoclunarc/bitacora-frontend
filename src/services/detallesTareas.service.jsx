// src/services/detallesTareas.service.js
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

// Obtener todos los detalles de una tarea
export const getDetallesByTareaId = async (tareaId) => {
  try {
    const response = await axios.get(
      `${API_URL}/${tareaId}/detalles`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalles de tarea ${tareaId}:`, error);
    throw error;
  }
};

// Obtener un detalle por ID
export const getDetalleById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/detalles/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error(`Error al obtener detalle ${id}:`, error);
    throw error;
  }
};

// Crear un nuevo detalle de tarea
export const createDetalle = async (tareaId, detalleData) => {
  try {
    const response = await axios.post(
      `${API_URL}/${tareaId}/detalles`, 
      detalleData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error al crear detalle de tarea:', error);
    throw error;
  }
};

// Actualizar un detalle existente
export const updateDetalle = async (id, detalleData) => {
  try {
    const response = await axios.put(
      `${API_URL}/detalles/${id}`, 
      detalleData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar detalle ${id}:`, error);
    throw error;
  }
};

// Actualizar el estatus de un detalle
export const updateDetalleStatus = async (id, estatus, fecha_fin = null) => {
  try {
    const response = await axios.patch(
      `${API_URL}/detalles/${id}/status`, 
      { estatus, fecha_fin }, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar estatus de detalle ${id}:`, error);
    throw error;
  }
};