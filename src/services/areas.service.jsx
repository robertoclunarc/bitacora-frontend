import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/areas`;

export const getAreas = async (token) => {
    try {
      const response = await axios.get(`${API_URL}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }) 
      return response.data;
    } catch (error) {
      console.error('Error al obtener areas:', error)
      throw error
    }
  }

export const getAreasPages = async (page, token) => {
    try {
        const response = await axios.get(`${API_URL}?${page}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        }) 
        return response.data;
    } catch (error) {
        console.error('Error al obtener areas:', error)
        throw error
    }
}

export const updateArea = async (idArea, areaData, token) => {
    try {
      const response = await axios.put(`${API_URL}/${idArea}`, areaData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data;
    } catch (error) {
      console.error('Error al actualizar area:', error)
      throw error
    }
}

export const createArea = async (areaData, token) => {  
    try { 
      const response = await axios.post(`${API_URL}`, areaData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return response.data;
    } catch (error) {
      console.error('Error creando area:', error)
      throw error
    }
  }