import { configureStore } from '@reduxjs/toolkit'
//import navigation from './_nav'

const initialState = {
  sidebarShow: true,
  sidebarUnfoldable: false,
  isAuthenticated: false,
  userData: null,
  navItems: JSON.parse(localStorage.getItem('navItems')) || [
    {
      component: 'CNavItem',
      name: 'Dashboard',
      to: '/dashboard',
      icon: 'cilSpeedometer',
      badge: {
        color: 'info',
        text: 'NEW',
      },
    }
  ],
  loadingMenu: false
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
        /*navItems: rest.navItems || getNavItems(true, rest.userData) */// Obtener ítems según el rol/nivel
      }
    case 'LOGOUT':
      localStorage.removeItem('navItems')
      return { 
        ...state, 
        isAuthenticated: false, 
        userData: null,
        navItems: initialState.navItems // Reiniciar a ítems públicos
      }
    case 'SET_NAV_ITEMS':
      return {
        ...state,
        navItems: rest.navItems
    };
    default:
      return state
  }
}

// Función para obtener ítems de navegación según el estado de autenticación
/*const getNavItems = (isAuthenticated, userData) => {
  
  console.log('isAuthenticated', isAuthenticated)
  console.log('userData', userData)  
  console.log('navigation', navigation)
  if (!isAuthenticated || !userData || navigation.length === 0) {
    console.log('No hay navegación para el usuario')
    const publicItems = [
      {
        component: 'CNavItem',
        name: 'Dashboard',
        to: '/dashboard',
        icon:  'cilSpeedometer',
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
}*/

const store = configureStore({
  reducer: changeState,
})
export default store
