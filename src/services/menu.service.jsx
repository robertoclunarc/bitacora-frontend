import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/menus`;

export const getMenus = async (token) => {
  console.log("Token desde el servicio:", token)
  // Configurar headers con el token  
  try {    
    const response = await axios.get(`${API_URL}/tree`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
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