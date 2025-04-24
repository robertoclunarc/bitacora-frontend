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
  //cilUser,
  cilPeople,
  cilPlus,
  cilSearch,
  cilFilter,
  cilPencil,
  //cilEnvelopeOpen,
  //cilLockLocked,
  cilBuilding,
  //cilBriefcase,
  //cilUserFollow
} from '@coreui/icons'

import { createArea, getAreasPages, updateArea } from '../../services/areas.service'
import { useCallback } from 'react'

const Areas = () => {
  const navigate = useNavigate()
  
  // Estados para la lista de usuarios
  const [areas, setAreas] = useState([])
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
    idarea: '',
    nombrearea: '',
    estatusarea: '',
    responsable: '',
  })
  
  // Estados para modal de area
  const [showAreaModal, setShowAreaModal] = useState(false)
  const [selectedArea, setSelectedArea] = useState(null)
  const [areaForm, setAreaForm] = useState({
    idarea: '',
    nombrearea: '',
    estatusarea: 'ACTIVO',
    responsable: '',
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  
  
  // Función para cargar las areas
  const loadAreas = useCallback(async (page = 1, filtersObj = filters) => {
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
      const response = await getAreasPages(params.toString(), token)
      
      const { areas, pagination } = response
      
      setAreas(areas || [])
      if (pagination) {
        setTotalItems(pagination.total || 0)
        setTotalPages(Math.ceil((pagination.total || 0) / itemsPerPage))
      }
      
      setError(null)
    } catch (err) {
      console.error('Error al cargar areas:', err)
      
      if (err.response && err.response.status === 401) {
        // Error de autenticación
        navigate('/dashboard')
      } else {
        setError('No se pudieron cargar los usuarios. Intente nuevamente.')
      }
      
      setAreas([])
    } finally {
      setLoading(false)
    }
}, [filters, itemsPerPage, navigate]);
  
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
      loadAreas(activePage)
    }
  }, [activePage, navigate, loadAreas])
  
  // Función para manejar el cambio de página
  const handlePageChange = (page) => {
    setActivePage(page)
    loadAreas(page)
  }
  
  // Función para aplicar filtros
  const applyFilters = () => {
    setActivePage(1) // Resetear a primera página
    loadAreas(1, filters)
  }
  
  // Función para resetear filtros
  const resetFilters = () => {
    const emptyFilters = {
        idarea: '',
        nombrearea: '',
        estatusarea: '',
        responsable: '',
    }
    setFilters(emptyFilters)
    setActivePage(1)
    loadAreas(1, emptyFilters)
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
  const handleNewArea = () => {
    setAreaForm({
        idarea: '',
        nombrearea: '',
        estatusarea: 'ACTIVO',
        responsable: '',
    })
    
    
    setIsEditMode(false)
    setSelectedArea(null)
    setFormError(null)
    setShowAreaModal(true)
  }
  
  // Función para mostrar modal de edición de usuario
  const handleEditUser = (area) => {
    setAreaForm({
        idarea: area.idarea,
        nombrearea: area.nombrearea,
        estatusarea: area.estatusarea,
        responsable: area.responsable,
        
    })
    
    setIsEditMode(true)
    setSelectedArea(area)
    setFormError(null)
    setShowAreaModal(true)
  }
  
  // Función para guardar usuario (crear o actualizar)
  const handleSaveArea = async () => {
    // Validar formulario
    if (!areaForm.estatusarea || !areaForm.nombrearea || !areaForm.responsable) {
      setFormError('Por favor complete todos los campos obligatorios.')
      return
    }
    
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      
      const areaData = {
        ...areaForm
      }
      
      
      if (isEditMode) {
        // Actualizar Areas existente
        await updateArea(selectedArea.idarea, areaData, token)
      } else {
        // Crear nueva area
        await createArea( areaData, token)
      }
      
      // Recargar lista de areas
      loadAreas(activePage)
      
      // Cerrar modal
      setShowAreaModal(false)
      setFormError(null)
    } catch (err) {
      console.error('Error al guardar area:', err)
      
      if (err.response && err.response.message) {
        setFormError(err.response.message)
      } else {
        setFormError('Error al guardar area. Intente nuevamente.')
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

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">
                  <CIcon icon={cilPeople} className="me-2" />
                  Areas Registradas
                </h5>
              </div>
              <div>
                <CButton 
                  color="primary" 
                  className="me-2"
                  onClick={handleNewArea}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nuevo Area
                </CButton>
                <CButton 
                  color={filterVisible ? "dark" : "grey"}
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
                  <CFormLabel>ID Area</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilBuilding} />
                    </CInputGroupText>
                    <CFormInput
                      name="idarea"
                      placeholder="Buscar por ID"
                      value={filters.idarea}
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
                      name="nombrearea"
                      placeholder="Buscar por nombre"
                      value={filters.nombrearea}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={2}>
                  <CFormLabel>Estatus</CFormLabel>
                  <CFormSelect
                    name="estatusarea"
                    value={filters.estatusarea}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={2}>
                  <CFormLabel>Responsable</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilPeople} />
                    </CInputGroupText>
                    <CFormInput
                      name="responsable"
                      placeholder="Buscar por responsable"
                      value={filters.responsable}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
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
                <p className="mt-2">Cargando Areas...</p>
              </div>
            ) : (
              <>
                <CTable hover responsive className="mb-4">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>ID Area</CTableHeaderCell>
                      <CTableHeaderCell>Nombre</CTableHeaderCell>
                      <CTableHeaderCell>Responsable</CTableHeaderCell>
                      <CTableHeaderCell>Estatus</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {areas.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={7} className="text-center">
                          No se encontraron areas
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      areas.map(area => (
                        <CTableRow key={area.idarea}>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              <CIcon icon={cilBuilding} className="me-2 text-primary" />
                              <strong>{area.idarea}</strong>
                              
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>{area.nombrearea}</CTableDataCell>
                          <CTableDataCell>{area.responsable}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getStatusBadge(area.estatusarea)}>
                              {area.estatusarea}
                            </CBadge>
                          </CTableDataCell>                          
                          
                          <CTableDataCell className="text-center">
                            <CButton
                              color="primary"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditUser(area)}
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
                  Mostrando {areas.length} de {totalItems} Areas
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      {/* Modal para crear/editar usuario */}
      <CModal 
        visible={showAreaModal} 
        onClose={() => setShowAreaModal(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? (
              <>
                <CIcon icon={cilPencil} className="me-2" />
                Editar Area
              </>
            ) : (
              <>
                <CIcon icon={cilBuilding} className="me-2" />
                Nueva Area
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
              <CFormLabel>ID Area </CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilBuilding} />
                </CInputGroupText>
                <CFormInput
                  name="idarea"
                  value={areaForm.idarea}
                  onChange={(e) => setAreaForm({...areaForm, idarea: e.target.value})}
                  disabled={!isEditMode} // No permitir cambiar el ID
                  
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Nombre</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilBuilding} />
                </CInputGroupText>
                <CFormInput
                  name="nombrearea"
                  value={areaForm.nombrearea}
                  onChange={(e) => setAreaForm({...areaForm, nombrearea: e.target.value})}
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={12}>
              <CFormLabel>Responsable *</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilPeople} />
                </CInputGroupText>
                <CFormInput
                  name="responsable"
                  value={areaForm.responsable}
                  onChange={(e) => setAreaForm({...areaForm, responsable: e.target.value})}                  
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Estatus *</CFormLabel>
              <CFormSelect
                name="estatus"
                value={areaForm.estatusarea}
                onChange={(e) => setAreaForm({...areaForm, estatusarea: e.target.value})}
                required
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </CFormSelect>
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowAreaModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveArea}
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

export default Areas