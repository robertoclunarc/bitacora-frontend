import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CSpinner,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CFormFeedback,
  CCollapse
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilUser, 
  cilLockLocked, 
  cilBriefcase, 
  cilBuilding, 
  cilEnvelopeOpen, 
  cilSave, 
  cilReload,
  cilCheck,
  cilX
} from '@coreui/icons'

import { changePassword, getUserAuthenticated } from '../../services/usuarios.service'

const PerfilUsuario = () => {
  const navigate = useNavigate()
  
  // Estados para los datos del perfil
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Estados para el cambio de contraseña
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [validated, setValidated] = useState(false)
  
  // Cargar los datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (!token || !storedUser) {
        navigate('/dashboard')
        return
      }
      
      try {
        setLoading(true)
        const user = JSON.parse(storedUser)
        
        // Obtener datos actualizados del usuario
        const response = await getUserAuthenticated(user.login, token)
        
        if (response && response.usuario) {
          setUserData(response.usuario)
        } else {
          throw new Error('No se pudieron obtener los datos del usuario')
        }
      } catch (err) {
        console.error('Error al cargar datos del usuario:', err)
        setError('No se pudieron cargar los datos del usuario. Por favor, inicie sesión nuevamente.')
        // Si hay un error de autenticación, limpiar los datos y redirigir
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          navigate('/dashboard')
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [navigate])
  
  // Manejar cambio de contraseña
  const handlePasswordChange = async (event) => {
    const form = event.currentTarget
    event.preventDefault()
    
    // Validar formulario
    if (form.checkValidity() === false) {
      event.stopPropagation()
      setValidated(true)
      return
    }
    
    setValidated(true)
    
    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    
    setLoadingPassword(true)
    setPasswordError('')
    setPasswordSuccess('')
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await changePassword(currentPassword, newPassword, token)
      
      if (response && response.success) {
        setPasswordSuccess(response.message)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setValidated(false)
      } else {
        setPasswordError('Error al cambiar la contraseña')
      }
    } catch (err) {
      console.error('Error al cambiar contraseña:', err)
      if (err.response && err.response && err.response.message) {
        setPasswordError(err.response.message)
      } else {
        setPasswordError('Error al cambiar la contraseña. Intente nuevamente.')
      }
    } finally {
      setLoadingPassword(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <h5>
              <CIcon icon={cilUser} className="me-2" />
              Datos del Usuario
            </h5>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <div className="text-center my-4">
                <CSpinner color="primary" />
                <p className="mt-2">Cargando datos de usuario...</p>
              </div>
            ) : error ? (
              <CAlert color="danger">
                {error}
              </CAlert>
            ) : userData ? (
              <>
                <CRow>
                  <CCol md={6}>
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h5>Información Personal</h5>
                      </CCardHeader>
                      <CCardBody>
                        <CForm>
                          <div className="mb-3">
                            <CFormLabel htmlFor="nombre">Nombre Completo</CFormLabel>
                            <CInputGroup>
                              <CInputGroupText>
                                <CIcon icon={cilUser} />
                              </CInputGroupText>
                              <CFormInput
                                type="text"
                                id="nombre"
                                value={userData.nombres || ''}
                                readOnly
                              />
                            </CInputGroup>
                          </div>
                          
                          <div className="mb-3">
                            <CFormLabel htmlFor="login">Usuario</CFormLabel>
                            <CInputGroup>
                              <CInputGroupText>
                                <CIcon icon={cilUser} />
                              </CInputGroupText>
                              <CFormInput
                                type="text"
                                id="login"
                                value={userData.login || ''}
                                readOnly
                              />
                            </CInputGroup>
                          </div>
                          
                          <div className="mb-3">
                            <CFormLabel htmlFor="email">Correo Electrónico</CFormLabel>
                            <CInputGroup>
                              <CInputGroupText>
                                <CIcon icon={cilEnvelopeOpen} />
                              </CInputGroupText>
                              <CFormInput
                                type="email"
                                id="email"
                                value={userData.email || ''}
                                readOnly
                              />
                            </CInputGroup>
                          </div>
                        </CForm>
                      </CCardBody>
                    </CCard>
                  </CCol>
                  
                  <CCol md={6}>
                    <CCard className="mb-4">
                      <CCardHeader>
                        <h5>Información Laboral</h5>
                      </CCardHeader>
                      <CCardBody>
                        <CForm>
                          <div className="mb-3">
                            <CFormLabel htmlFor="trabajador">Cedula</CFormLabel>
                            <CInputGroup>
                              <CInputGroupText>
                                <CIcon icon={cilBriefcase} />
                              </CInputGroupText>
                              <CFormInput
                                type="text"
                                id="trabajador"
                                value={userData.trabajador || ''}
                                readOnly
                              />
                            </CInputGroup>
                          </div>
                          
                          <div className="mb-3">
                            <CFormLabel htmlFor="area">Área</CFormLabel>
                            <CInputGroup>
                              <CInputGroupText>
                                <CIcon icon={cilBuilding} />
                              </CInputGroupText>
                              <CFormInput
                                type="text"
                                id="area"
                                value={userData.fkarea || ''}
                                readOnly
                              />
                            </CInputGroup>
                          </div>
                          
                          <div className="mb-3">
                            <CFormLabel htmlFor="nivel">Nivel de Acceso</CFormLabel>
                            <CInputGroup>
                              <CInputGroupText>
                                <CIcon icon={cilLockLocked} />
                              </CInputGroupText>
                              <CFormInput
                                type="text"
                                id="nivel"
                                value={userData.nivel || ''}
                                readOnly
                              />
                            </CInputGroup>
                          </div>
                        </CForm>
                      </CCardBody>
                    </CCard>
                  </CCol>
                </CRow>
                
                <CCard className="mb-4">
                  <CCardHeader className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Cambiar Contraseña</h5>
                    <CButton 
                      color={showPasswordChange ? "secondary" : "primary"}
                      variant="outline"
                      onClick={() => setShowPasswordChange(!showPasswordChange)}
                    >
                      {showPasswordChange ? "Cancelar" : "Cambiar Contraseña"}
                    </CButton>
                  </CCardHeader>
                  
                  <CCollapse visible={showPasswordChange}>
                    <CCardBody>
                      {passwordError && (
                        <CAlert color="danger" className="d-flex align-items-center">
                          <CIcon icon={cilX} className="flex-shrink-0 me-2" />
                          <div>{passwordError}</div>
                        </CAlert>
                      )}
                      
                      {passwordSuccess && (
                        <CAlert color="success" className="d-flex align-items-center">
                          <CIcon icon={cilCheck} className="flex-shrink-0 me-2" />
                          <div>{passwordSuccess}</div>
                        </CAlert>
                      )}
                      
                      <CForm 
                        className="needs-validation"
                        noValidate
                        validated={validated}
                        onSubmit={handlePasswordChange}
                      >
                        <div className="mb-3">
                          <CFormLabel htmlFor="currentPassword">Contraseña Actual</CFormLabel>
                          <CInputGroup className="has-validation">
                            <CInputGroupText>
                              <CIcon icon={cilLockLocked} />
                            </CInputGroupText>
                            <CFormInput
                              type="password"
                              id="currentPassword"
                              required
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              disabled={loadingPassword}
                            />
                            <CFormFeedback invalid>Por favor ingrese su contraseña actual.</CFormFeedback>
                          </CInputGroup>
                        </div>
                        
                        <div className="mb-3">
                          <CFormLabel htmlFor="newPassword">Nueva Contraseña</CFormLabel>
                          <CInputGroup className="has-validation">
                            <CInputGroupText>
                              <CIcon icon={cilLockLocked} />
                            </CInputGroupText>
                            <CFormInput
                              type="password"
                              id="newPassword"
                              required
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              disabled={loadingPassword}
                              minLength="6"
                            />
                            <CFormFeedback invalid>Por favor ingrese una nueva contraseña (mínimo 6 caracteres).</CFormFeedback>
                          </CInputGroup>
                        </div>
                        
                        <div className="mb-4">
                          <CFormLabel htmlFor="confirmPassword">Confirmar Nueva Contraseña</CFormLabel>
                          <CInputGroup className="has-validation">
                            <CInputGroupText>
                              <CIcon icon={cilLockLocked} />
                            </CInputGroupText>
                            <CFormInput
                              type="password"
                              id="confirmPassword"
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              disabled={loadingPassword}
                            />
                            <CFormFeedback invalid>Por favor confirme su nueva contraseña.</CFormFeedback>
                          </CInputGroup>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <CButton color="primary" type="submit" disabled={loadingPassword}>
                            {loadingPassword ? (
                              <>
                                <CSpinner size="sm" className="me-2" />
                                Actualizando...
                              </>
                            ) : (
                              <>
                                <CIcon icon={cilSave} className="me-2" />
                                Guardar Cambios
                              </>
                            )}
                          </CButton>
                          <CButton 
                            type="button" 
                            color="secondary" 
                            variant="outline"
                            onClick={() => {
                              setCurrentPassword('')
                              setNewPassword('')
                              setConfirmPassword('')
                              setValidated(false)
                              setPasswordError('')
                              setPasswordSuccess('')
                            }}
                            disabled={loadingPassword}
                          >
                            <CIcon icon={cilReload} className="me-2" />
                            Restablecer
                          </CButton>
                        </div>
                      </CForm>
                    </CCardBody>
                  </CCollapse>
                </CCard>
              </>
            ) : (
              <CAlert color="warning">
                No se encontraron datos de usuario. Por favor, inicie sesión nuevamente.
              </CAlert>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default PerfilUsuario