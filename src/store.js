import { createStore } from 'redux'
import navigation from './_nav'
import CIcon from '@coreui/icons-react';
const { CNavItem } = require('@coreui/react')

const initialState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
  isAuthenticated: false,
  userData: null,
  navItems: [] // Ítems de navegación vacíos por defecto
}

const changeState = (state = initialState, { type, ...rest }) => {
  switch (type) {
    case 'set':
      return { ...state, ...rest }
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        isAuthenticated: true, 
        userData: rest.userData,
        navItems: rest.navItems || getNavItems(true, rest.userData) // Obtener ítems según el rol/nivel
      }
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        userData: null,
        navItems: getNavItems(false, null) // Reiniciar a ítems públicos
      }
    default:
      return state
  }
}

// Función para obtener ítems de navegación según el estado de autenticación
const getNavItems = (isAuthenticated, userData) => {
  // Importar los iconos necesarios
  const {
    cilSpeedometer,
    
  } = require('@coreui/icons')

  // Si no está autenticado, solo devolver ítems públicos
  console.log('isAuthenticated', isAuthenticated)
  console.log('userData', userData)
  console.log('navigation', navigation)
  
  if (!isAuthenticated || !userData || navigation.length === 0) {
    const publicItems = [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/dashboard',
        icon:  <CIcon icon={cilSpeedometer} customClassName="nav-icon" /> ,
        badge: {
          color: 'info',
          text: 'NEW',
        },
      }
    ]  
    return publicItems
  }
  
  // Ítems para usuarios autenticados
  const authenticatedItems = [    
    ...navigation
  ]
  
  return authenticatedItems
}

const store = createStore(changeState)
export default store