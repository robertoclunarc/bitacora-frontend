import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/reuniones`;

export const getReunionesActive = async (limit, offset) => {
  // Obtener el token del localStorage (asumiendo que usas JWT)
  /*
  const token = localStorage.getItem('token')
  
  if (!token) {
    throw new Error('No hay token de autenticación')
  }
  */
  // Configurar headers con el token
  const config = {
    headers: 
    {'Content-Type': 'application/json'}
    /*
    {
      'Authorization': `Bearer ${token}`
    }*/
  }
  
  try {    
    const response = await axios.get(`${API_URL}/?limit=${limit}&offset=${offset}`, config);   
    return response.data;
  } catch (error) {
    console.error('Error al obtener menús:', error)
    throw error
  }
}

// Si necesitas un método para pruebas/desarrollo que devuelva datos estáticos
export const getMockMenus = () => {
  return {
    menuTree: [
      // Aquí tu JSON completo para pruebas
    ]
  }
}