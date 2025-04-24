import React, { useState, useEffect, useCallback } from 'react';
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
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CBadge,
  CPagination,
  CPaginationItem,
  CAlert,
  CCollapse,
  CFormTextarea,
  CTooltip,
  CFormSwitch
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilBullhorn,
  cilPlus,
  cilSearch,
  cilFilter,
  cilPencil,
  cilCalendar,
  //cilBriefcase,
  cilInfo,
  //cilWarning,
  cilBan,
  cilCheck,
  //cilX
} from '@coreui/icons';
import { format/*, isAfter, isBefore, parseISO*/ } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar servicios
import { 
  getCarteleras, 
  getCarteleraById, 
  createCartelera, 
  updateCartelera, 
  updateCarteleraStatus
} from '../../../services/cartelera.service';

const Carteleras = () => {
  // Estados para la lista de carteleras
  const [carteleras, setCarteleras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para la paginación
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estados para el filtrado
  const [filterVisible, setFilterVisible] = useState(true);
  const [filters, setFilters] = useState({
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estatus: '',
    tipo_info: '',
    fkarea: ''
  });
  
  // Estados para las áreas
  const [areas, setAreas] = useState([]);
  const [userData, setUserData] = useState(null);
  
  // Estado para el modal de cartelera
  const [showCarteleraModal, setShowCarteleraModal] = useState(false);
  const [carteleraForm, setCarteleraForm] = useState({
    titulo: '',
    descripcion: '',
    fkarea: '',
    fecha_inicio_publicacion: format(new Date(), 'yyyy-MM-dd'),
    fecha_fin_publicacion: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
    estatus: 'ACTIVO',
    publico: true,
    tipo_info: 'INFO'
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCarteleraId, setEditingCarteleraId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Función para cargar carteleras
  //const loadBitacoras = useCallback(async (page = 1, filtersObj = filters) => {
  const loadCarteleras = useCallback(async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true);
      const response = await getCarteleras(page, itemsPerPage, filtersObj);
      
      setCarteleras(response.carteleras || []);
      if (response.pagination) {
        setTotalItems(response.pagination.total || 0);
        setTotalPages(Math.ceil((response.pagination.total || 0) / itemsPerPage));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar carteleras:', err);
      setError('No se pudieron cargar las carteleras. Intente nuevamente.');
      setCarteleras([]);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);
  
  // Función para cargar áreas
  const loadAreas = async () => {
    try {
      // Cargar información del usuario
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
      }
      
      // Cargar áreas
      const areasResponse = await fetch(`${process.env.REACT_APP_API_URL}/areas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const areasData = await areasResponse.json();
      setAreas(areasData.areas || []);
    } catch (err) {
      console.error('Error al cargar áreas:', err);
    }
  };
  
  // Cargar carteleras y áreas al iniciar
  useEffect(() => {
    loadCarteleras(activePage);
    loadAreas();
  }, [activePage, loadCarteleras]);
  
  // Función para manejar cambio de página
  const handlePageChange = (page) => {
    setActivePage(page);
  };
  
  // Función para aplicar filtros
  const applyFilters = () => {
    setActivePage(1);
    loadCarteleras(1, filters);
  };
  
  // Función para resetear filtros
  const resetFilters = () => {
    const emptyFilters = {
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      estatus: '',
      tipo_info: '',
      fkarea: ''
    };
    setFilters(emptyFilters);
    setActivePage(1);
    loadCarteleras(1, emptyFilters);
  };
  
  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // FUNCIONES PARA GESTIÓN DE CARTELERAS
  
  // Mostrar modal para nueva cartelera
  const handleNewCartelera = () => {
    // Establecer valores por defecto
    const defaultAreaId = userData?.fkarea || '';
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 30); // Por defecto, 30 días de publicación
    
    setCarteleraForm({
      titulo: '',
      descripcion: '',
      fkarea: defaultAreaId,
      fecha_inicio_publicacion: format(new Date(), 'yyyy-MM-dd'),
      fecha_fin_publicacion: format(fechaFin, 'yyyy-MM-dd'),
      estatus: 'ACTIVO',
      publico: true,
      tipo_info: 'INFO'
    });
    
    setIsEditMode(false);
    setEditingCarteleraId(null);
    setFormError(null);
    setShowCarteleraModal(true);
  };
  
  // Mostrar modal para editar cartelera
  const handleEditCartelera = async (id) => {
    try {
      setLoading(true);
      const response = await getCarteleraById(id);
      const cartelera = response.cartelera;
      
      if (!cartelera) {
        throw new Error('No se pudo obtener la información de la cartelera');
      }
      
      // Formatear fechas para el formulario
      setCarteleraForm({
        titulo: cartelera.titulo || '',
        descripcion: cartelera.descripcion || '',
        fkarea: cartelera.fkarea || '',
        fecha_inicio_publicacion: cartelera.fecha_inicio_publicacion ? format(new Date(cartelera.fecha_inicio_publicacion), 'yyyy-MM-dd') : '',
        fecha_fin_publicacion: cartelera.fecha_fin_publicacion ? format(new Date(cartelera.fecha_fin_publicacion), 'yyyy-MM-dd') : '',
        estatus: cartelera.estatus || 'ACTIVO',
        publico: cartelera.publico === 1,
        tipo_info: cartelera.tipo_info || 'INFO'
      });
      
      setIsEditMode(true);
      setEditingCarteleraId(id);
      setFormError(null);
      setShowCarteleraModal(true);
    } catch (err) {
      console.error(`Error al cargar cartelera ${id}:`, err);
      setError('No se pudo cargar la información de la cartelera');
    } finally {
      setLoading(false);
    }
  };
  
  // Guardar cartelera (crear o actualizar)
  const handleSaveCartelera = async () => {
    // Validar formulario
    if (!carteleraForm.descripcion || !carteleraForm.fecha_inicio_publicacion || !carteleraForm.fecha_fin_publicacion || !carteleraForm.fkarea) {
      setFormError('Por favor complete todos los campos obligatorios (descripción, fechas de publicación y área)');
      return;
    }
    
    // Validar fechas
    const fechaInicio = new Date(carteleraForm.fecha_inicio_publicacion);
    const fechaFin = new Date(carteleraForm.fecha_fin_publicacion);
    
    if (fechaInicio > fechaFin) {
      setFormError('La fecha de inicio no puede ser posterior a la fecha de fin');
      return;
    }
    
    try {
      setSaving(true);
      
      const carteleraData = {
        ...carteleraForm,
        fkarea: parseInt(carteleraForm.fkarea),
        publico: carteleraForm.publico ? 1 : 0
      };
      
      // Crear o actualizar cartelera
      if (isEditMode) {
        // Actualizar cartelera existente
        await updateCartelera(editingCarteleraId, carteleraData);
      } else {
        // Crear nueva cartelera
        await createCartelera(carteleraData);
      }
      
      // Recargar lista de carteleras
      loadCarteleras(activePage);
      
      // Cerrar modal
      setShowCarteleraModal(false);
      setFormError(null);
    } catch (err) {
      console.error('Error al guardar cartelera:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Error al guardar la cartelera. Intente nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Actualizar estatus de cartelera
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateCarteleraStatus(id, newStatus);
      
      // Actualizar estado local
      setCarteleras(carteleras.map(cartelera => {
        if (cartelera.idcartelera === id) {
          return { ...cartelera, estatus: newStatus };
        }
        return cartelera;
      }));
    } catch (err) {
      console.error(`Error al actualizar estatus de cartelera ${id}:`, err);
      setError('No se pudo actualizar el estatus de la cartelera');
    }
  };
  
  // Función para obtener texto de estatus
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVO':
        return <CBadge color="success">Activo</CBadge>;
      case 'INACTIVO':
        return <CBadge color="danger">Inactivo</CBadge>;
      case 'VENCIDO':
        return <CBadge color="secondary">Vencido</CBadge>;
      default:
        return <CBadge color="secondary">{status}</CBadge>;
    }
  };
  
  // Función para obtener badge de tipo de información
  const getTipoInfoBadge = (tipo) => {
    switch (tipo) {
      case 'INFO':
        return <CBadge color="info">Informativo</CBadge>;
      case 'WARNING':
        return <CBadge color="warning">Advertencia</CBadge>;
      case 'DANGER':
        return <CBadge color="danger">Urgente</CBadge>;
      default:
        return <CBadge color="secondary">{tipo}</CBadge>;
    }
  };
  
  // Función para obtener el color de fondo según el tipo
  const getRowClassName = (tipo) => {
    switch (tipo) {
      case 'INFO':
        return '';
      case 'WARNING':
        return 'table-warning';
      case 'DANGER':
        return 'table-danger';
      default:
        return '';
    }
  };
  
  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch (e) {
      return dateString;
    }
  };
  
  // Función para verificar si la cartelera está vigente
  /*
  const isCarteleraVigente = (fechaInicio, fechaFin) => {
    if (!fechaInicio || !fechaFin) return false;
    
    const today = new Date();
    const inicio = parseISO(fechaInicio);
    const fin = parseISO(fechaFin);
    
    return !isBefore(today, inicio) && !isAfter(today, fin);
  };
  */
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">
                  <CIcon icon={cilBullhorn} className="me-2" />
                  Gestión de Carteleras
                </h4>
              </div>
              <div>
                <CButton 
                  color="primary" 
                  className="me-2"
                  onClick={handleNewCartelera}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nueva Cartelera
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
                <CCol md={4}>
                  <CFormLabel>Descripción</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilInfo} />
                    </CInputGroupText>
                    <CFormInput
                      name="descripcion"
                      placeholder="Buscar por descripción"
                      value={filters.descripcion}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Fecha Inicio</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilCalendar} />
                    </CInputGroupText>
                    <CFormInput
                      type="date"
                      name="fecha_inicio"
                      value={filters.fecha_inicio}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Fecha Fin</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilCalendar} />
                    </CInputGroupText>
                    <CFormInput
                      type="date"
                      name="fecha_fin"
                      value={filters.fecha_fin}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Estatus</CFormLabel>
                  <CFormSelect
                    name="estatus"
                    value={filters.estatus}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="VENCIDO">Vencido</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Tipo de Información</CFormLabel>
                  <CFormSelect
                    name="tipo_info"
                    value={filters.tipo_info}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="INFO">Informativo</option>
                    <option value="WARNING">Advertencia</option>
                    <option value="DANGER">Urgente</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Área</CFormLabel>
                  <CFormSelect
                    name="fkarea"
                    value={filters.fkarea}
                    onChange={handleFilterChange}
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
                <p className="mt-2">Cargando carteleras...</p>
              </div>
            ) : (
              <>
                <CTable hover responsive className="mb-4">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell style={{ minWidth: '280px' }}>Descripción</CTableHeaderCell>
                      <CTableHeaderCell>Tipo</CTableHeaderCell>
                      <CTableHeaderCell>Área</CTableHeaderCell>
                      <CTableHeaderCell>Inicio</CTableHeaderCell>
                      <CTableHeaderCell>Fin</CTableHeaderCell>
                      <CTableHeaderCell>Estatus</CTableHeaderCell>
                      <CTableHeaderCell>Registrado por</CTableHeaderCell>                      
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {carteleras.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={8} className="text-center">
                          No se encontraron carteleras
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      carteleras.map(cartelera => (
                        <CTableRow key={cartelera.idcartelera} className={getRowClassName(cartelera.tipo_info)}>
                          <CTableDataCell>
                            <div>                              
                              <div className="text-muted mt-1" style={{ maxHeight: '50px', overflow: 'hidden' }}>
                                {cartelera.descripcion.substring(0, 100)}
                                {cartelera.descripcion.length > 100 ? '...' : ''}
                              </div>
                              {!cartelera.publico && (
                                <CBadge color="dark" shape="rounded-pill" className="mt-1">
                                  Privado
                                </CBadge>
                              )}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>{getTipoInfoBadge(cartelera.tipo_info)}</CTableDataCell>
                          <CTableDataCell>{cartelera.nombre_area || '-'}</CTableDataCell>
                          <CTableDataCell>{formatDate(cartelera.fecha_inicio_publicacion)}</CTableDataCell>
                          <CTableDataCell>{formatDate(cartelera.fecha_fin_publicacion)}</CTableDataCell>
                          <CTableDataCell>{getStatusBadge(cartelera.estatus)}</CTableDataCell>
                          <CTableDataCell>{cartelera.nombre_usuario || cartelera.login_registrado}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CTooltip content="Editar cartelera">
                              <CButton
                                color="primary"
                                size="sm"
                                variant="outline"
                                className="me-1"
                                onClick={() => handleEditCartelera(cartelera.idcartelera)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                            </CTooltip>
                            
                            {cartelera.estatus === 'ACTIVO' && (
                              <CTooltip content="Desactivar">
                                <CButton
                                  color="danger"
                                  size="sm"
                                  variant="outline"
                                  className="me-1"
                                  onClick={() => handleUpdateStatus(cartelera.idcartelera, 'INACTIVO')}
                                >
                                  <CIcon icon={cilBan} />
                                </CButton>
                              </CTooltip>
                            )}
                            
                            {cartelera.estatus === 'INACTIVO' && (
                              <CTooltip content="Activar">
                                <CButton
                                  color="success"
                                  size="sm"
                                  variant="outline"
                                  className="me-1"
                                  onClick={() => handleUpdateStatus(cartelera.idcartelera, 'ACTIVO')}
                                >
                                  <CIcon icon={cilCheck} />
                                </CButton>
                              </CTooltip>
                            )}
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
                  Mostrando {carteleras.length} de {totalItems} carteleras
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      {/* Modal para crear/editar cartelera */}
      <CModal 
        visible={showCarteleraModal} 
        onClose={() => setShowCarteleraModal(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? (
              <>
                <CIcon icon={cilPencil} className="me-2" />
                Editar Cartelera
              </>
            ) : (
              <>
                <CIcon icon={cilBullhorn} className="me-2" />
                Nueva Cartelera
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
            <CCol md={12}>
              <CFormLabel>Título</CFormLabel>
              <CFormInput
                name="titulo"
                value={carteleraForm.titulo}
                onChange={(e) => setCarteleraForm({...carteleraForm, titulo: e.target.value})}
                placeholder="Título de la cartelera (opcional)"
              />
            </CCol>
            
            <CCol md={12}>
              <CFormLabel>Descripción *</CFormLabel>
              <CFormTextarea
                name="descripcion"
                value={carteleraForm.descripcion}
                onChange={(e) => setCarteleraForm({...carteleraForm, descripcion: e.target.value})}
                rows={4}
                placeholder="Información detallada de la cartelera..."
                required
              />
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Área *</CFormLabel>
              <CFormSelect
                name="fkarea"
                value={carteleraForm.fkarea}
                onChange={(e) => setCarteleraForm({...carteleraForm, fkarea: e.target.value})}
                required
              >
                <option value="">Seleccione un área</option>
                {areas.map(area => (
                  <option key={area.idarea} value={area.idarea}>
                    {area.nombrearea}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Tipo de Información *</CFormLabel>
              <CFormSelect
                name="tipo_info"
                value={carteleraForm.tipo_info}
                onChange={(e) => setCarteleraForm({...carteleraForm, tipo_info: e.target.value})}
                required
              >
                <option value="INFO">Informativo</option>
                <option value="WARNING">Advertencia</option>
                <option value="DANGER">Urgente</option>
              </CFormSelect>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Fecha Inicio Publicación *</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
                <CFormInput
                  type="date"
                  name="fecha_inicio_publicacion"
                  value={carteleraForm.fecha_inicio_publicacion}
                  onChange={(e) => setCarteleraForm({...carteleraForm, fecha_inicio_publicacion: e.target.value})}
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Fecha Fin Publicación *</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
                <CFormInput
                  type="date"
                  name="fecha_fin_publicacion"
                  value={carteleraForm.fecha_fin_publicacion}
                  onChange={(e) => setCarteleraForm({...carteleraForm, fecha_fin_publicacion: e.target.value})}
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Estatus *</CFormLabel>
              <CFormSelect
                name="estatus"
                value={carteleraForm.estatus}
                onChange={(e) => setCarteleraForm({...carteleraForm, estatus: e.target.value})}
                required
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                {isEditMode && <option value="VENCIDO">Vencido</option>}
              </CFormSelect>
            </CCol>
            
            <CCol md={6} className="d-flex align-items-center mt-md-5">
              <CFormSwitch
                label="Visible para todos (Público)"
                id="publico-switch"
                checked={carteleraForm.publico}
                onChange={(e) => setCarteleraForm({...carteleraForm, publico: e.target.checked})}
              />
              <div className="form-text text-muted ms-3">
                {carteleraForm.publico 
                  ? "Todos los usuarios podrán ver esta cartelera" 
                  : "Solo usuarios de la misma área podrán ver esta cartelera"}
              </div>
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowCarteleraModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveCartelera}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditMode ? 'Actualizar Cartelera' : 'Crear Cartelera'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Carteleras;