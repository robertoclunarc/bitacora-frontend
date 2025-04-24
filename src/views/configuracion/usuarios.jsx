import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CFormInput,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CFormSelect,
  CBadge,
  CPagination,
  CPaginationItem,
  CAlert,
  CCollapse
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser,
  cilPeople,
  cilPlus,
  cilSearch,
  cilFilter,
  cilPencil,
  cilEnvelopeOpen,
  cilLockLocked,
  cilBuilding,
  cilBriefcase,
  cilUserFollow
} from '@coreui/icons'
import { useCallback } from 'react'

import { createUser, getUsers, updateUser } from '../../services/usuarios.service'
import { getAreas } from '../../services/areas.service'

const Usuarios = () => {
  const navigate = useNavigate()
  
  // Estados para la lista de usuarios
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Estados para la paginación
  const [activePage, setActivePage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  
  // Estados para el filtrado
  const [filterVisible, setFilterVisible] = useState(false)
  const [filters, setFilters] = useState({
    login: '',
    nombres: '',
    estatus: '',
    nivel: '',
    fkarea: ''
  })
  
  // Estados para modal de usuario
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userForm, setUserForm] = useState({
    login: '',
    trabajador: '',
    nombres: '',
    email: '',
    estatus: 'ACTIVO',
    nivel: 3,
    fkarea: ''
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [password, setPassword] = useState('')
  const [showPasswordField, setShowPasswordField] = useState(true)
  
  // Estados para las áreas (para el select)
  const [areas, setAreas] = useState([])
  const [loadingAreas, setLoadingAreas] = useState(true)
  
  // Función para cargar los usuarios
  //const loadUsuarios = async (page = 1, filtersObj = filters) => {
  const loadUsuarios = useCallback(async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true)
      
      // Construir parámetros de consulta para la URL
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('limit', itemsPerPage)
      
      // Añadir filtros si existen
      Object.keys(filtersObj).forEach(key => {
        if (filtersObj[key]) {
          params.append(key, filtersObj[key])
        }
      })
      
      const token = localStorage.getItem('token')
      const response = await getUsers(params.toString(), token)
      
      const { usuarios, pagination } = response
      
      setUsuarios(usuarios || [])
      if (pagination) {
        setTotalItems(pagination.total || 0)
        setTotalPages(Math.ceil((pagination.total || 0) / itemsPerPage))
      }
      
      setError(null)
    } catch (err) {
      console.error('Error al cargar usuarios:', err)
      
      if (err.response && err.response.status === 401) {
        // Error de autenticación
        navigate('/dashboard')
      } else {
        setError('No se pudieron cargar los usuarios. Intente nuevamente.')
      }
      
      setUsuarios([])
    } finally {
      setLoading(false)
    }
}, [filters, itemsPerPage, navigate]);
  
  // Función para cargar las áreas
  const loadAreas = async () => {
    try {
      setLoadingAreas(true)
      
      const token = localStorage.getItem('token')
      const response = await getAreas(token)
      
      setAreas(response.areas || [])
    } catch (err) {
      console.error('Error al cargar áreas:', err)
    } finally {
      setLoadingAreas(false)
    }
  }
  
  // Cargar usuarios cuando se monta el componente
  useEffect(() => {
    // Verificar si el usuario está autenticado y es administrador
    const checkPermissions = () => {
      const token = localStorage.getItem('token')
      const userJson = localStorage.getItem('user')
      
      if (!token || !userJson) {
        navigate('/dashboard')
        return false
      }
      
      try {
        const userData = JSON.parse(userJson)
        if (userData.nivel > 1) { // Asumiendo que nivel 1 es admin
          navigate('/dashboard')
          return false
        }
        return true
      } catch (error) {
        navigate('/dashboard')
        return false
      }
    }
    
    if (checkPermissions()) {
      loadUsuarios(activePage)
      loadAreas()
    }
  }, [activePage, navigate, loadUsuarios])
  
  // Función para manejar el cambio de página
  const handlePageChange = (page) => {
    setActivePage(page)
    loadUsuarios(page)
  }
  
  // Función para aplicar filtros
  const applyFilters = () => {
    setActivePage(1) // Resetear a primera página
    loadUsuarios(1, filters)
  }
  
  // Función para resetear filtros
  const resetFilters = () => {
    const emptyFilters = {
      login: '',
      nombres: '',
      estatus: '',
      nivel: '',
      fkarea: ''
    }
    setFilters(emptyFilters)
    setActivePage(1)
    loadUsuarios(1, emptyFilters)
  }
  
  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Función para mostrar modal de nuevo usuario
  const handleNewUser = () => {
    setUserForm({
      login: '',
      trabajador: '',
      nombres: '',
      email: '',
      estatus: 'ACTIVO',
      nivel: 3,
      fkarea: ''
    })
    setPassword('')
    setShowPasswordField(true)
    setIsEditMode(false)
    setSelectedUser(null)
    setFormError(null)
    setShowUserModal(true)
  }
  
  // Función para mostrar modal de edición de usuario
  const handleEditUser = (user) => {
    setUserForm({
      login: user.login,
      trabajador: user.trabajador,
      nombres: user.nombres,
      email: user.email,
      estatus: user.estatus,
      nivel: user.nivel,
      fkarea: user.fkarea || ''
    })
    setPassword('')
    setShowPasswordField(false)
    setIsEditMode(true)
    setSelectedUser(user)
    setFormError(null)
    setShowUserModal(true)
  }
  
  // Función para guardar usuario (crear o actualizar)
  const handleSaveUser = async () => {
    // Validar formulario
    if (!userForm.login || !userForm.nombres || !userForm.email) {
      setFormError('Por favor complete todos los campos obligatorios.')
      return
    }
    
    if (!isEditMode && !password) {
      setFormError('La contraseña es obligatoria para nuevos usuarios.')
      return
    }
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userForm.email)) {
      setFormError('Por favor ingrese un correo electrónico válido.')
      return
    }
    
    // Validar nivel (entre 1 y 3)
    const nivelNum = parseInt(userForm.nivel)
    if (isNaN(nivelNum) || nivelNum < 1 || nivelNum > 3) {
      setFormError('El nivel debe ser un número entre 1 y 3.')
      return
    }
    
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      
      const userData = {
        ...userForm,
        nivel: parseInt(userForm.nivel),
        fkarea: userForm.fkarea ? parseInt(userForm.fkarea) : null
      }
      
      if (!isEditMode && password) {
        userData.password = password
      }
      
      if (isEditMode) {
        // Actualizar usuario existente
        await updateUser(selectedUser.login, userData, token)
      } else {
        // Crear nuevo usuario
        await createUser( userData, token)
      }
      
      // Recargar lista de usuarios
      loadUsuarios(activePage)
      
      // Cerrar modal
      setShowUserModal(false)
      setFormError(null)
    } catch (err) {
      console.error('Error al guardar usuario:', err)
      
      if (err.response && err.response.message) {
        setFormError(err.response.message)
      } else {
        setFormError('Error al guardar usuario. Intente nuevamente.')
      }
    } finally {
      setSaving(false)
    }
  }
  
  // Obtener badge color según el estatus del usuario
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVO':
        return 'success'
      case 'INACTIVO':
        return 'danger'
      default:
        return 'secondary'
    }
  }
  
  // Obtener badge color según el nivel del usuario
  const getNivelBadge = (nivel) => {
    switch (parseInt(nivel)) {
      case 3:
        return 'info'
      case 2:
        return 'warning'
      case 1:
        return 'danger'
      default:
        return 'secondary'
    }
  }
  
  // Obtener texto según el nivel del usuario
  const getNivelText = (nivel) => {
    switch (parseInt(nivel)) {
      case 3:
        return 'Estandar'
      case 2:
        return 'Supervisor'
      case 1:
        return 'Administrador'
      default:
        return 'Desconocido'
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">
                  <CIcon icon={cilPeople} className="me-2" />
                  Usuarios Registrados
                </h5>
              </div>
              <div>
                <CButton 
                  color="primary" 
                  className="me-2"
                  onClick={handleNewUser}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nuevo Usuario
                </CButton>
                <CButton 
                  color={filterVisible ? "dark" : "gray"}
                  variant="outline"
                  onClick={() => setFilterVisible(!filterVisible)}
                >
                  <CIcon icon={cilFilter} className="me-2" />
                  Filtros
                </CButton>
              </div>
            </div>
          </CCardHeader>
          
          <CCollapse visible={filterVisible}>
            <CCardBody className="border-bottom">
              <CForm className="row g-3">
                <CCol md={3}>
                  <CFormLabel>Usuario</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      name="login"
                      placeholder="Buscar por usuario"
                      value={filters.login}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Nombre</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilPeople} />
                    </CInputGroupText>
                    <CFormInput
                      name="nombres"
                      placeholder="Buscar por nombre"
                      value={filters.nombres}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={2}>
                  <CFormLabel>Estatus</CFormLabel>
                  <CFormSelect
                    name="estatus"
                    value={filters.estatus}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={2}>
                  <CFormLabel>Nivel</CFormLabel>
                  <CFormSelect
                    name="nivel"
                    value={filters.nivel}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="1">Administrador</option>
                    <option value="2">Supervisor</option>
                    <option value="3">Estandar</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={2}>
                  <CFormLabel>Área</CFormLabel>
                  <CFormSelect
                    name="fkarea"
                    value={filters.fkarea}
                    onChange={handleFilterChange}
                    disabled={loadingAreas}
                  >
                    <option value="">Todas</option>
                    {areas.map(area => (
                      <option key={area.idarea} value={area.idarea}>
                        {area.nombrearea}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                
                <CCol xs={12} className="d-flex justify-content-end">
                  <CButton 
                    color="secondary" 
                    variant="outline"
                    className="me-2"
                    onClick={resetFilters}
                  >
                    Limpiar
                  </CButton>
                  <CButton 
                    color="primary"
                    onClick={applyFilters}
                  >
                    <CIcon icon={cilSearch} className="me-2" />
                    Buscar
                  </CButton>
                </CCol>
              </CForm>
            </CCardBody>
          </CCollapse>
          
          <CCardBody>
            {error && (
              <CAlert color="danger" className="mb-4">
                {error}
              </CAlert>
            )}
            
            {loading ? (
              <div className="text-center my-5">
                <CSpinner color="primary" />
                <p className="mt-2">Cargando usuarios...</p>
              </div>
            ) : (
              <>
                <CTable hover responsive className="mb-4">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Usuario</CTableHeaderCell>
                      <CTableHeaderCell>Nombre</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Estatus</CTableHeaderCell>
                      <CTableHeaderCell>Nivel</CTableHeaderCell>
                      <CTableHeaderCell>Área</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {usuarios.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={7} className="text-center">
                          No se encontraron usuarios
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      usuarios.map(user => (
                        <CTableRow key={user.login}>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CIcon icon={cilUser} className="me-2 text-primary" />
                              <strong>{user.login}</strong>
                              <small className="ms-2 text-muted">({user.trabajador})</small>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>{user.nombres}</CTableDataCell>
                          <CTableDataCell>{user.email}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getStatusBadge(user.estatus)}>
                              {user.estatus}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getNivelBadge(user.nivel)}>
                              {getNivelText(user.nivel)}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            {areas.find(a => a.idarea === user.fkarea)?.nombrearea || '-'}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              color="primary"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(user)}
                            >
                              <CIcon icon={cilPencil} className="me-1" /> 
                              Editar
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center">
                    <CPagination align="center" aria-label="Paginación">
                      <CPaginationItem 
                        disabled={activePage === 1}
                        onClick={() => handlePageChange(activePage - 1)}
                      >
                        Anterior
                      </CPaginationItem>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <CPaginationItem
                          key={i + 1}
                          active={i + 1 === activePage}
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))}
                      
                      <CPaginationItem 
                        disabled={activePage === totalPages}
                        onClick={() => handlePageChange(activePage + 1)}
                      >
                        Siguiente
                      </CPaginationItem>
                    </CPagination>
                  </div>
                )}
                
                <div className="text-muted small text-center mt-3">
                  Mostrando {usuarios.length} de {totalItems} usuarios
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      {/* Modal para crear/editar usuario */}
      <CModal 
        visible={showUserModal} 
        onClose={() => setShowUserModal(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? (
              <>
                <CIcon icon={cilPencil} className="me-2" />
                Editar Usuario
              </>
            ) : (
              <>
                <CIcon icon={cilUserFollow} className="me-2" />
                Nuevo Usuario
              </>
            )}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {formError && (
            <CAlert color="danger" className="mb-3">
              {formError}
            </CAlert>
          )}
          
          <CForm className="row g-3">
            <CCol md={6}>
              <CFormLabel>Usuario (Login) *</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilUser} />
                </CInputGroupText>
                <CFormInput
                  name="login"
                  value={userForm.login}
                  onChange={(e) => setUserForm({...userForm, login: e.target.value})}
                  disabled={isEditMode} // No permitir cambiar el login si es edición
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Cedula</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilBriefcase} />
                </CInputGroupText>
                <CFormInput
                  name="trabajador"
                  value={userForm.trabajador}
                  onChange={(e) => setUserForm({...userForm, trabajador: e.target.value})}
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={12}>
              <CFormLabel>Nombre Completo *</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilPeople} />
                </CInputGroupText>
                <CFormInput
                  name="nombres"
                  value={userForm.nombres}
                  onChange={(e) => setUserForm({...userForm, nombres: e.target.value})}
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Correo Electrónico *</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilEnvelopeOpen} />
                </CInputGroupText>
                <CFormInput
                  type="email"
                  name="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Área</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilBuilding} />
                </CInputGroupText>
                <CFormSelect
                  name="fkarea"
                  value={userForm.fkarea}
                  onChange={(e) => setUserForm({...userForm, fkarea: e.target.value})}
                  disabled={loadingAreas}
                >
                  <option value="">Sin área</option>
                  {areas.map(area => (
                    <option key={area.idarea} value={area.idarea}>
                      {area.nombrearea}
                    </option>
                  ))}
                </CFormSelect>
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Nivel de Acceso *</CFormLabel>
              <CFormSelect
                name="nivel"
                value={userForm.nivel}
                onChange={(e) => setUserForm({...userForm, nivel: e.target.value})}
                required
              >
                <option value="1">Administrador (Nivel 1)</option>
                <option value="2">Supervisor (Nivel 2)</option>
                <option value="3">Estandar (Nivel 3)</option>
              </CFormSelect>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Estatus *</CFormLabel>
              <CFormSelect
                name="estatus"
                value={userForm.estatus}
                onChange={(e) => setUserForm({...userForm, estatus: e.target.value})}
                required
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </CFormSelect>
            </CCol>
            
            {/* Campo de contraseña (solo visible para nuevos usuarios o si se activa el cambio) */}
            {(!isEditMode || showPasswordField) && (
              <CCol md={12}>
                <div className="d-flex justify-content-between align-items-center">
                  <CFormLabel>Contraseña {!isEditMode && '*'}</CFormLabel>
                  {isEditMode && (
                    <CButton 
                      color="link" 
                      size="sm"
                      className="p-0"
                      onClick={() => setShowPasswordField(!showPasswordField)}
                    >
                      Cancelar
                    </CButton>
                  )}
                </div>
                <CInputGroup>
                  <CInputGroupText>
                    <CIcon icon={cilLockLocked} />
                  </CInputGroupText>
                  <CFormInput
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isEditMode}
                  />
                </CInputGroup>
                {isEditMode && (
                  <div className="form-text text-muted">
                    Dejar en blanco para mantener la contraseña actual.
                  </div>
                )}
              </CCol>
            )}
            
            {/* Opción para mostrar el campo de contraseña en modo edición */}
            {isEditMode && !showPasswordField && (
              <CCol md={12}>
                <CButton 
                  color="link" 
                  className="px-0 text-decoration-none"
                  onClick={() => setShowPasswordField(true)}
                >
                  <CIcon icon={cilLockLocked} className="me-2" />
                  Cambiar contraseña
                </CButton>
              </CCol>
            )}
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowUserModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveUser}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditMode ? 'Actualizar Usuario' : 'Crear Usuario'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Usuarios