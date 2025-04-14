import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderDivider,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CFormFeedback,
  CSpinner,
  CAlert
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilAccountLogout, cilUser, cilLockLocked, cilUser as cilUserIcon } from '@coreui/icons'
import usuarioDesconocido from '../assets/images/desconocido.png'

import { logIn } from '../services/usuarios.service'

// URL de imágenes
const IMAGES_URL = process.env.REACT_APP_URL_IMAGEN || 'http://servidor-imagenes.com/'

const AppHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation() // Obtener la ubicación actual
  const sidebarShow = useSelector((state) => state.sidebarShow)
  
  // Estados para autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userData, setUserData] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [pageTitle, setPageTitle] = useState('Dashboard') // Estado para el título de la página
  
  // Estados para el formulario de login
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validated, setValidated] = useState(false)

  // Obtener el título de la página actual basado en la ruta
  useEffect(() => {
    // Mapeo simple de rutas a títulos
    const routeTitles = {
      '/dashboard': 'Dashboard',
      '/perfil': 'Perfil Usuario',
      '/bitacoras': 'Bitácoras',
      '/reuniones': 'Reuniones',
      '/carteleras': 'Carteleras',
      // Añadir más mapeos según sea necesario
    }
    
    // Actualizar el título según la ruta actual
    const path = location.pathname
    setPageTitle(routeTitles[path] || 'Dashboard') // Usar Dashboard como valor por defecto
  }, [location])

  // Verificar si el usuario ya está autenticado al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      try {
        const userData = JSON.parse(user)
        // Actualizar estado local
        setUserData(userData)
        setIsAuthenticated(true)
        // Actualizar el store global
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          userData: userData 
        })
      } catch (error) {
        console.error('Error parsing user data:', error)
        handleLogout() // Limpiar datos inválidos
      }
    }
    else {
      // Si no hay datos de autenticación, asegurar que el menú muestre solo ítems públicos
      dispatch({ type: 'LOGOUT' })
    }
  }, [dispatch])

  // Manejar cierre de sesión
  const handleLogout = () => {
    // Eliminar los datos de autenticación del almacenamiento local
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Actualizar el estado local
    setIsAuthenticated(false)
    setUserData(null)
    // Actualizar el store global - esto actualizará los ítems del sidebar
    dispatch({ type: 'LOGOUT' })
    // Opcional: redireccionar al dashboard
    navigate('/dashboard')
  }
  
  // Manejar clic en "Abrir Sesión"
  const handleLoginClick = () => {
    setShowLoginModal(true)
    setLoginError('')
    setUsername('')
    setPassword('')
    setValidated(false)
  }
  
  // Función para obtener la URL de la imagen del usuario
  const getUserImageUrl = () => {
    if (isAuthenticated && userData && userData.trabajador) {
      return `${IMAGES_URL}/${userData.trabajador}`
    }
    return usuarioDesconocido
  }
  
  // Manejar envío del formulario de login
  const handleLoginSubmit = async (event) => {
    const form = event.currentTarget
    event.preventDefault()
    
    // Validar formulario
    if (form.checkValidity() === false) {
      event.stopPropagation()
      setValidated(true)
      return
    }
    
    setValidated(true)
    setLoading(true)
    setLoginError('')
    
    try {
      const response = await logIn(username, password)
      
      if (response && response.token) {
        // Guardar token y datos de usuario
        const userData = response.user
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Actualizar estado
        setIsAuthenticated(true)
        setUserData(userData)

        // Actualizar store global con datos de usuario y ítems de menú
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          userData: userData
          // navItems se calculará automáticamente en el reducer
        })
        
        // Cerrar modal
        setShowLoginModal(false)
      } else {
        setLoginError('Respuesta inválida del servidor')
      }
    } catch (error) {
      console.error('Error login:', error)
      if (error.response && error.response.data && error.response.data.message) {
        setLoginError(error.response.data.message)
      } else {
        setLoginError('Error al iniciar sesión. Intente nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid>
        <CHeaderToggler
          className="ps-1"
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderBrand className="mx-auto d-md-none" to="/">
          <h3>BITÁCORA</h3>
        </CHeaderBrand>
        <CHeaderNav className="d-none d-md-flex me-auto">
          <CNavItem>
            <CNavLink to="/dashboard" component={NavLink}>
              Dashboard
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/bitacoras" component={NavLink}>
              Bitácoras
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink to="/reuniones" component={NavLink}>
              Reuniones
            </CNavLink>
          </CNavItem>
        </CHeaderNav>        
        <CHeaderNav className="ms-3">
          {/* Mostrar el nombre del usuario cuando está autenticado */}
          {isAuthenticated && userData && (
            <div className="d-none d-md-flex align-items-center me-2 text-dark">
              <span className="fw-semibold">{userData.nombres}</span>
            </div>
          )}
          <CDropdown variant="nav-item">
            <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
              <div className="avatar avatar-md">
                <img
                  className="avatar-img"
                  src={getUserImageUrl()}
                  alt={isAuthenticated ? userData?.nombres || 'Usuario' : 'Usuario no autenticado'}
                  title={isAuthenticated ? userData?.nombres || 'Usuario' : 'Usuario no autenticado'}
                  onError={(e) => {
                    // Si hay error al cargar la imagen, usar la imagen por defecto
                    e.target.src = usuarioDesconocido
                  }}
                />
              </div>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
              {isAuthenticated ? (
                // Opciones para usuario autenticado
                <>
                  <CDropdownItem onClick={() => navigate('/perfil')}>
                    <CIcon icon={cilUser} className="me-2" />
                    Perfil
                  </CDropdownItem>
                  <CDropdownItem onClick={handleLogout}>
                    <CIcon icon={cilAccountLogout} className="me-2" />
                    Cerrar Sesión
                  </CDropdownItem>
                </>
              ) : (
                // Opción para usuario no autenticado
                <CDropdownItem onClick={handleLoginClick}>
                  <CIcon icon={cilUser} className="me-2" />
                  Abrir Sesión
                </CDropdownItem>
              )}
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>
      </CContainer>
      <CHeaderDivider />
      <CContainer fluid>
        <div className="breadcrumb-wrapper">
          {/* Título dinámico basado en la ruta actual */}
          <h4 className="text-primary mb-0">{pageTitle}</h4>
        </div>
      </CContainer>
      
      {/* Modal de Inicio de Sesión */}
      <CModal 
        visible={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        backdrop="static"
        alignment="center"
      >
        <CModalHeader>
          <CModalTitle>Iniciar Sesión</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loginError && (
            <CAlert color="danger" className="mb-3">
              {loginError}
            </CAlert>
          )}
          
          <CForm 
            className="needs-validation"
            noValidate
            validated={validated}
            onSubmit={handleLoginSubmit}
          >
            <div className="mb-3">
              <CFormLabel htmlFor="username">Nombre de Usuario</CFormLabel>
              <CInputGroup className="has-validation">
                <CInputGroupText>
                  <CIcon icon={cilUserIcon} />
                </CInputGroupText>
                <CFormInput
                  type="text"
                  id="username"
                  placeholder="Usuario"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <CFormFeedback invalid>Por favor ingrese su nombre de usuario.</CFormFeedback>
              </CInputGroup>
            </div>
            
            <div className="mb-4">
              <CFormLabel htmlFor="password">Contraseña</CFormLabel>
              <CInputGroup className="has-validation">
                <CInputGroupText>
                  <CIcon icon={cilLockLocked} />
                </CInputGroupText>
                <CFormInput
                  type="password"
                  id="password"
                  placeholder="Contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <CFormFeedback invalid>Por favor ingrese su contraseña.</CFormFeedback>
              </CInputGroup>
            </div>
            
            <div className="d-grid gap-2">
              <CButton color="primary" type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <CSpinner size="sm" className="me-2" />
                    Iniciando sesión...
                  </>
                ) : 'Iniciar Sesión'}
              </CButton>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowLoginModal(false)}>
            Cancelar
          </CButton>
        </CModalFooter>
      </CModal>
    </CHeader>
  )
}

export default AppHeader