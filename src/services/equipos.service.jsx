import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/equipos`;

export const getEquipos = async (token) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }) 
      return response.data;
    } catch (error) {
      console.error('Error al obtener equipos:', error)
      throw error
    }
  }

export const getEquiposPages = async (page, token) => {
    try {
        const response = await axios.get(`${API_URL}?${page}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        }) 
        return response.data;
    } catch (error) {
        console.error('Error al obtener equipos:', error)
        throw error
    }
}

export const updateEquipo = async (idequipo, equipoData, token) => {
    try {
      const response = await axios.put(`${API_URL}/${idequipo}`, equipoData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data;
    } catch (error) {
      console.error('Error al actualizar equipo:', error)
      throw error
    }
}

export const createEquipo = async (equipoData, token) => {  
    try { 
      const response = await axios.post(`${API_URL}`, equipoData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data;
    } catch (error) {
      console.error('Error creando equipo:', error)
      throw error
    }
  }