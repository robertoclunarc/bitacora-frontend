import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/senales-force`;

export const getSenales = async (token) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }) 
      return response.data;
    } catch (error) {
      console.error('Error al obtener señales:', error)
      throw error
    }
  }

export const getSenalesPages = async (page, token) => {
    try {
        const response = await axios.get(`${API_URL}?${page}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        }) 
        return response.data;
    } catch (error) {
        console.error('Error al obtener señales:', error)
        throw error
    }
}

export const updateSenal = async (idsenal, senalData, token) => {
    try {
      const response = await axios.put(`${API_URL}/${idsenal}`, senalData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data;
    } catch (error) {
      console.error('Error al actualizar señal:', error)
      throw error
    }
}

export const createSenal = async (senalData, token) => {
    try { 
      const response = await axios.post(`${API_URL}`, senalData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data;
    } catch (error) {
      console.error('Error creando señal:', error)
      throw error
    }
  }