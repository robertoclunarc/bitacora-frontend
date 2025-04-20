import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/sistemas-force`;

export const getSistemas = async (token) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }) 
      return response.data;
    } catch (error) {
      console.error('Error al obtener sistemas:', error)
      throw error
    }
  }

export const getSistemasPages = async (page, token) => {
    try {
        const response = await axios.get(`${API_URL}?${page}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        }) 
        return response.data;
    } catch (error) {
        console.error('Error al obtener sistemas:', error)
        throw error
    }
}

export const updateSistema = async (idsistema, sistemaData, token) => {
    try {
      const response = await axios.put(`${API_URL}/${idsistema}`, sistemaData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data;
    } catch (error) {
      console.error('Error al actualizar sistema:', error)
      throw error
    }
}

export const createSistema = async (sistemaData, token) => {
    try { 
      const response = await axios.post(`${API_URL}`, sistemaData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data;
    } catch (error) {
      console.error('Error creando sistema:', error)
      throw error
    }
  }