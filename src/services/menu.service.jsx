import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/menus`;

export const getMenus = async () => {
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
    console.log("API_URL", API_URL);
    const response = await axios.get("http://localhost:3800/api-bitacora/menus/tree/matlux", config)
    
    //const response = await axios.get(`${API_URL}/tree/matlux`, config)
    
    return response.data
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