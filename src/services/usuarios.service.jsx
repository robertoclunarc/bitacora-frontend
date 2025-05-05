import axios from 'axios'

const API_URL = `${process.env.REACT_APP_API_URL}/usuarios`;
const API_URL_AUTH = `${process.env.REACT_APP_API_URL}/auth`;

export const getUserAuthenticated = async (login, token) => {  
  try { 
    const response = await axios.get(`${API_URL}/${login}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })  
      
      return response.data;
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    throw error
  }
}

export const logIn = async (user, passw) => {  
  try { 
    const response = await axios.post(`${API_URL_AUTH}/login`, {
      login: user,
      password: passw
    })
    //console.log('Respuesta del logueo:', response.data)
    return response.data;
  } catch (error) {
    console.error('Error en logueo:', error)
    throw error
  }
}

export const changePassword = async (_oldPassword, _newPassword, token) => {
  try {
    const response = await axios.put(`${API_URL_AUTH}/change-password`, {
      currentPassword: _oldPassword,
      newPassword: _newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data;
  } catch (error) {
    console.error('Error al cambiar password:', error)
    throw error
  }
}

export const getUsers = async (page, token) => {
  try {
    const response = await axios.get(`${API_URL}?${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }) 
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    throw error
  }
}

export const updateUser = async (login, userData, token) => {
  try {
    const response = await axios.put(`${API_URL}/${login}`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data;
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    throw error
  }
}

export const createUser = async (userData, token) => {  
  try { 
    const response = await axios.post(`${API_URL}`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.data;
  } catch (error) {
    console.error('Error creando usuario:', error)
    throw error
  }
}
