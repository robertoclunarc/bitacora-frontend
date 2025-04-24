import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/force`;

export const getForces = async (token) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }) 
      return response.data;
    } catch (error) {
      console.error('Error al obtener Forces:', error)
      throw error
    }
  }

export const getForcesPages = async (page, token) => {
    try {
        const response = await axios.get(`${API_URL}?${page}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        })
        
        return response.data;
    } catch (error) {
        console.error('Error al obtener Forces:', error)
        throw error
    }
}

export const updateForce = async (idForce, ForceData, token) => {
    try {
      const response = await axios.put(`${API_URL}/${idForce}`, ForceData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data;
    } catch (error) {
      console.error('Error al actualizar Force:', error)
      throw error
    }
}

export const createForce = async (ForceData, token) => {
    
    try { 
      const response = await axios.post(`${API_URL}`, ForceData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data;
    } catch (error) {
      console.error('Error creando Force:', error)
      throw error
    }
  }