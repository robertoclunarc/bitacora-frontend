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
  cilAlarm,
  cilPlus,
  cilSearch,
  cilFilter,
  cilPencil,
  cilCalendar,
  //cilBriefcase,
  cilInfo,
 // cilWarning,
  cilBan,
  cilCheck,
  cilX,
  cilClock,
  cilPeople,
 // cilNotes,
  cilCopy,
  cilWarning
} from '@coreui/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar servicios
import { 
  getIncidencias, 
  getIncidenciaById, 
  createIncidencia, 
  updateIncidencia, 
  updateIncidenciaStatus,
  toggleIncidenciaCartelera
} from '../../../services/incidencias.service';
import { getEquipos } from '../../../services/equipos.service';
import { getAreas } from '../../../services/areas.service';

const Incidencias = () => {
  // Estados para la lista de incidencias
  const [incidencias, setIncidencias] = useState([]);
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
    tipoincidencia: '',
    estatus: '',
    fkarea: '',
    critico: ''
  });
  
  // Estados para los catálogos
  const [areas, setAreas] = useState([]);
  const [tiposIncidencia/*, setTiposIncidencia*/] = useState([
    'TÉCNICA', 'SEGURIDAD', 'PERSONAL', 'EQUIPAMIENTO', 'SISTEMAS',
    'INFRAESTRUCTURA', 'MANTENIMIENTO', 'OTRA'
  ]);
  const [equipos, setEquipos] = useState([]);
  const [userData, setUserData] = useState(null);
  
  // Estado para el modal de incidencia
  const [showIncidenciaModal, setShowIncidenciaModal] = useState(false);
  const [incidenciaForm, setIncidenciaForm] = useState({
    descripcion: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: format(new Date(), 'HH:mm'),
    observacion: '',
    que_se_hizo: '',
    tipoincidencia: '',
    critico: false,
    fkarea: '',
    involucrados: '',
    estatus: 'ACTIVO',
    fkequipo: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIncidenciaId, setEditingIncidenciaId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Estado para publicación en cartelera
  const [updatingCartelera, setUpdatingCartelera] = useState(false);
  
  // Función para cargar incidencias
  const loadIncidencias = useCallback(async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true);
      const response = await getIncidencias(page, itemsPerPage, filtersObj);
      
      setIncidencias(response.incidencias || []);
      if (response.pagination) {
        setTotalItems(response.pagination.total || 0);
        setTotalPages(Math.ceil((response.pagination.total || 0) / itemsPerPage));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar incidencias:', err);
      setError('No se pudieron cargar las incidencias. Intente nuevamente.');
      setIncidencias([]);
    } finally {
      setLoading(false);
    }
}, [filters, itemsPerPage]);
  
  // Función para cargar catálogos
  const loadCatalogos = async () => {
    try {
      // Cargar información del usuario
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
      }
      
      // Cargar áreas
      const areasResponse = await getAreas(localStorage.getItem('token'));
      setAreas(areasResponse.areas || []);
      //Cargar equipos
      const equiposResponse = await getEquipos(localStorage.getItem('token'));      
      setEquipos(equiposResponse.equipos || []);
      
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    }
  };
  
  // Cargar incidencias y catálogos al iniciar
  useEffect(() => {
    loadIncidencias(activePage);
    loadCatalogos();
  }, [activePage, loadIncidencias]);
  
  // Función para manejar cambio de página
  const handlePageChange = (page) => {
    setActivePage(page);
  };
  
  // Función para aplicar filtros
  const applyFilters = () => {
    setActivePage(1);
    loadIncidencias(1, filters);
  };
  
  // Función para resetear filtros
  const resetFilters = () => {
    const emptyFilters = {
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      tipoincidencia: '',
      estatus: '',
      fkarea: '',
      critico: '',
      fkequipo: ''
    };
    setFilters(emptyFilters);
    setActivePage(1);
    loadIncidencias(1, emptyFilters);
  };
  
  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // FUNCIONES PARA GESTIÓN DE INCIDENCIAS
  
  // Mostrar modal para nueva incidencia
  const handleNewIncidencia = () => {
    // Establecer valores por defecto
    const defaultAreaId = userData?.fkarea || '';
    
    setIncidenciaForm({
      descripcion: '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      hora: format(new Date(), 'HH:mm'),
      observacion: '',
      que_se_hizo: '',
      tipoincidencia: tiposIncidencia[0],
      critico: false,
      fkarea: defaultAreaId,
      involucrados: '',
      estatus: 'ACTIVO',
      fkequipo: ''
    });
    
    setIsEditMode(false);
    setEditingIncidenciaId(null);
    setFormError(null);
    setShowIncidenciaModal(true);
  };
  
  // Mostrar modal para editar incidencia
  const handleEditIncidencia = async (id) => {
    try {
      setLoading(true);
      const response = await getIncidenciaById(id);
      const incidencia = response.incidencia;
      
      if (!incidencia) {
        throw new Error('No se pudo obtener la información de la incidencia');
      }
      
      // Formatear para el formulario
      setIncidenciaForm({
        descripcion: incidencia.descripcion || '',
        fecha: incidencia.fecha ? format(new Date(incidencia.fecha), 'yyyy-MM-dd') : '',
        hora: incidencia.hora || '',
        observacion: incidencia.observacion || '',
        que_se_hizo: incidencia.que_se_hizo || '',
        tipoincidencia: incidencia.tipoincidencia || '',
        critico: incidencia.critico ? true : false,
        fkarea: incidencia.fkarea || '',
        involucrados: incidencia.involucrados || '',
        estatus: incidencia.estatus || 'ACTIVO',
        fkequipo: incidencia.fkequipo || ''
      });
      
      setIsEditMode(true);
      setEditingIncidenciaId(id);
      setFormError(null);
      setShowIncidenciaModal(true);
    } catch (err) {
      console.error(`Error al cargar incidencia ${id}:`, err);
      setError('No se pudo cargar la información de la incidencia');
    } finally {
      setLoading(false);
    }
  };
  
  // Guardar incidencia (crear o actualizar)
  const handleSaveIncidencia = async () => {
    // Validar formulario
    if (!incidenciaForm.descripcion || !incidenciaForm.fecha || !incidenciaForm.hora || !incidenciaForm.tipoincidencia || !incidenciaForm.fkarea) {
      setFormError('Por favor complete todos los campos obligatorios (descripción, fecha, hora, tipo y área)');
      return;
    }
    
    try {
      setSaving(true);
      
      const incidenciaData = {
        ...incidenciaForm,
        fkarea: parseInt(incidenciaForm.fkarea),
        critico: incidenciaForm.critico ? true : false,
        fkequipo: incidenciaForm.fkequipo ? parseInt(incidenciaForm.fkequipo) : null,
      };
      
      // Crear o actualizar incidencia
      if (isEditMode) {
        // Actualizar incidencia existente
        await updateIncidencia(editingIncidenciaId, incidenciaData);
      } else {
        // Crear nueva incidencia
        await createIncidencia(incidenciaData);
      }
      
      // Recargar lista de incidencias
      loadIncidencias(activePage);
      
      // Cerrar modal
      setShowIncidenciaModal(false);
      setFormError(null);
    } catch (err) {
      console.error('Error al guardar incidencia:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Error al guardar la incidencia. Intente nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Actualizar estatus de incidencia
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateIncidenciaStatus(id, newStatus);
      
      // Actualizar estado local
      setIncidencias(incidencias.map(incidencia => {
        if (incidencia.idincidencia === id) {
          return { ...incidencia, estatus: newStatus };
        }
        return incidencia;
      }));
    } catch (err) {
      console.error(`Error al actualizar estatus de incidencia ${id}:`, err);
      setError('No se pudo actualizar el estatus de la incidencia');
    }
  };
  
  // Publicar o quitar de cartelera
  const handleToggleCartelera = async (incidenciaId, currentStatus) => {
    try {
      setUpdatingCartelera(true);
      await toggleIncidenciaCartelera(incidenciaId);
      
      // Actualizar estado en la lista local
      const updatedIncidencias = incidencias.map(i => {
        if (i.idincidencia === incidenciaId) {
          return { 
            ...i, 
            en_cartelera: currentStatus ? null : 1 
          };
        }
        return i;
      });
      
      setIncidencias(updatedIncidencias);
    } catch (err) {
      console.error(`Error al cambiar estado de cartelera para incidencia ${incidenciaId}:`, err);
      setError('No se pudo actualizar el estado de cartelera. Intente nuevamente.');
    } finally {
      setUpdatingCartelera(false);
    }
  };
  
  // Función para obtener texto de estatus
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVO':
        return <CBadge color="info">Activo</CBadge>;
      case 'INACTIVO':
        return <CBadge color="danger">Inactivo</CBadge>;
      case 'FINALIZADO':
        return <CBadge color="success">Finalizado</CBadge>;
      case 'PROCESO':
        return <CBadge color="warning">En Proceso</CBadge>;
      default:
        return <CBadge color="secondary">{status}</CBadge>;
    }
  };
  
  // Función para obtener badge de tipo de incidencia
  const getTipoIncidenciaBadge = (tipo) => {
    switch (tipo) {
      case 'TÉCNICA':
        return <CBadge color="primary">Técnica</CBadge>;
      case 'SEGURIDAD':
        return <CBadge color="danger">Seguridad</CBadge>;
      case 'PERSONAL':
        return <CBadge color="info">Personal</CBadge>;
      case 'EQUIPAMIENTO':
        return <CBadge color="warning">Equipamiento</CBadge>;
      case 'SISTEMAS':
        return <CBadge color="success">Sistemas</CBadge>;
      case 'INFRAESTRUCTURA':
        return <CBadge color="dark">Infraestructura</CBadge>;
      case 'MANTENIMIENTO':
        return <CBadge color="light" className="text-dark">Mantenimiento</CBadge>;
      default:
        return <CBadge color="secondary">{tipo}</CBadge>;
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

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">
                  <CIcon icon={cilAlarm} className="me-2" />
                  Gestión de Incidencias
                </h4>
              </div>
              <div>
                <CButton 
                  color="primary" 
                  className="me-2"
                  onClick={handleNewIncidencia}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nueva Incidencia
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
              <CForm className="row g-3" onSubmit={(e) => { e.preventDefault(); applyFilters(); }}>
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
                
                <CCol md={3}>
                  <CFormLabel>Estatus</CFormLabel>
                  <CFormSelect
                    name="estatus"
                    value={filters.estatus}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="FINALIZADO">Finalizado</option>
                    <option value="PROCESO">En Proceso</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Tipo de Incidencia</CFormLabel>
                  <CFormSelect
                    name="tipoincidencia"
                    value={filters.tipoincidencia}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    {tiposIncidencia.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                
                <CCol md={3}>
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

                <CCol md={3}>
                    <CFormLabel>Equipo</CFormLabel>
                    <CFormSelect
                    name="fkequipo"
                    value={filters.fkequipo}
                    onChange={handleFilterChange}
                    >
                    <option value="">Todos</option>
                    {equipos.map(equipo => (
                        <option key={equipo.idequipo} value={equipo.idequipo}>
                        {equipo.descripcion_equipo}
                        </option>
                    ))}
                    </CFormSelect>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Crítico</CFormLabel>
                  <CFormSelect
                    name="critico"
                    value={filters.critico}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                  </CFormSelect>
                </CCol>
                
                <CCol xs={12} className="d-flex justify-content-end">
                  <CButton 
                    color="secondary" 
                    variant="outline"
                    className="me-2"
                    onClick={resetFilters}
                    type="button"
                  >
                    Limpiar
                  </CButton>
                  <CButton 
                    color="primary"
                    type="submit"
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
                <p className="mt-2">Cargando incidencias...</p>
              </div>
            ) : (
              <>
                <CTable hover responsive className="mb-4">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell style={{ minWidth: '250px' }}>Descripción</CTableHeaderCell>
                      <CTableHeaderCell>Tipo</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell>Área</CTableHeaderCell>
                      <CTableHeaderCell>Involucrados</CTableHeaderCell>
                      <CTableHeaderCell>Estatus</CTableHeaderCell>
                      <CTableHeaderCell>Registrado por</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {incidencias.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={8} className="text-center">
                          No se encontraron incidencias
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      incidencias.map(incidencia => (
                        <CTableRow key={incidencia.idincidencia} className={incidencia.critico ? 'table-danger' : ''}>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              {incidencia.critico === 1 && (
                                <CIcon icon={cilWarning} className="me-2 text-danger" />
                              )}
                              <div className="text-truncate" style={{ maxWidth: '300px' }}>
                                {incidencia.descripcion}
                              </div>
                            </div>
                            {incidencia.en_cartelera && (
                              <CBadge color="warning" shape="rounded-pill" className="mt-1">
                                En Cartelera
                              </CBadge>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>{getTipoIncidenciaBadge(incidencia.tipoincidencia)}</CTableDataCell>
                          <CTableDataCell>{formatDate(incidencia.fecha)}</CTableDataCell>
                          <CTableDataCell>{incidencia.nombre_area || '-'}</CTableDataCell>
                          <CTableDataCell className="text-truncate" style={{ maxWidth: '150px' }}>
                            {incidencia.involucrados || '-'}
                          </CTableDataCell>
                          <CTableDataCell>{getStatusBadge(incidencia.estatus)}</CTableDataCell>
                          <CTableDataCell>{incidencia.nombre_usuario || incidencia.login}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CTooltip content="Editar incidencia">
                              <CButton
                                color="primary"
                                size="sm"
                                variant="outline"
                                className="me-1"
                                onClick={() => handleEditIncidencia(incidencia.idincidencia)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                            </CTooltip>
                            
                            <CTooltip content={incidencia.en_cartelera ? "Quitar de cartelera" : "Publicar en cartelera"}>
                              <CButton
                                color={incidencia.en_cartelera ? "warning" : "success"}
                                size="sm"
                                variant="outline"
                                className="me-1"
                                onClick={() => handleToggleCartelera(incidencia.idincidencia, incidencia.en_cartelera)}
                                disabled={updatingCartelera}
                              >
                                <CIcon icon={incidencia.en_cartelera ? cilX : cilCopy} />
                              </CButton>
                            </CTooltip>
                            
                            {incidencia.estatus === 'ACTIVO' && (
                              <CTooltip content="Marcar en proceso">
                                <CButton
                                  color="info"
                                  size="sm"
                                  variant="outline"
                                  className="me-1"
                                  onClick={() => handleUpdateStatus(incidencia.idincidencia, 'PROCESO')}
                                >
                                  <CIcon icon={cilClock} />
                                </CButton>
                              </CTooltip>
                            )}
                            
                            {incidencia.estatus === 'PROCESO' && (
                              <CTooltip content="Finalizar">
                                <CButton
                                  color="success"
                                  size="sm"
                                  variant="outline"
                                  className="me-1"
                                  onClick={() => handleUpdateStatus(incidencia.idincidencia, 'FINALIZADO')}
                                >
                                  <CIcon icon={cilCheck} />
                                </CButton>
                              </CTooltip>
                            )}
                            
                            {(incidencia.estatus === 'ACTIVO' || incidencia.estatus === 'PROCESO') && (
                              <CTooltip content="Desactivar">
                                <CButton
                                  color="danger"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(incidencia.idincidencia, 'INACTIVO')}
                                >
                                  <CIcon icon={cilBan} />
                                </CButton>
                              </CTooltip>
                            )}
                            
                            {incidencia.estatus === 'INACTIVO' && (
                              <CTooltip content="Activar">
                                <CButton
                                  color="success"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(incidencia.idincidencia, 'ACTIVO')}
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
                  Mostrando {incidencias.length} de {totalItems} incidencias
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      {/* Modal para crear/editar incidencia */}
      <CModal 
        visible={showIncidenciaModal} 
        onClose={() => setShowIncidenciaModal(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? (
              <>
                <CIcon icon={cilPencil} className="me-2" />
                Editar Incidencia
              </>
            ) : (
              <>
                <CIcon icon={cilAlarm} className="me-2" />
                Nueva Incidencia
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
              <CFormLabel>Descripción *</CFormLabel>
              <CFormTextarea
                name="descripcion"
                value={incidenciaForm.descripcion}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, descripcion: e.target.value})}
                rows={3}
                placeholder="Descripción detallada de la incidencia..."
                required
              />
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Tipo de Incidencia *</CFormLabel>
              <CFormSelect
                name="tipoincidencia"
                value={incidenciaForm.tipoincidencia}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, tipoincidencia: e.target.value})}
                required
              >
                <option value="">Seleccione un tipo</option>
                {tiposIncidencia.map(tipo => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Área *</CFormLabel>
              <CFormSelect
                name="fkarea"
                value={incidenciaForm.fkarea}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, fkarea: e.target.value})}
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
              <CFormLabel>Fecha *</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
                <CFormInput
                  type="date"
                  name="fecha"
                  value={incidenciaForm.fecha}
                  onChange={(e) => setIncidenciaForm({...incidenciaForm, fecha: e.target.value})}
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Hora *</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilClock} />
                </CInputGroupText>
                <CFormInput
                  type="time"
                  name="hora"
                  value={incidenciaForm.hora}
                  onChange={(e) => setIncidenciaForm({...incidenciaForm, hora: e.target.value})}
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={8}>
              <CFormLabel>Involucrados:</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilPeople} />
                </CInputGroupText>
                <CFormInput
                  name="involucrados"
                  value={incidenciaForm.involucrados}
                  onChange={(e) => setIncidenciaForm({...incidenciaForm, involucrados: e.target.value})}
                  placeholder="Personas involucradas en la incidencia"
                />
              </CInputGroup>
            </CCol>

            <CCol md={4}>
                <CFormLabel>Equipo Involucrado</CFormLabel>
                <CFormSelect
                name="fkequipo"
                value={incidenciaForm.fkequipo}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, fkequipo: e.target.value})}
                >
                <option value="">Sin equipo</option>
                {equipos.map(equipo => (
                    <option key={equipo.idequipo} value={equipo.idequipo}>
                    {equipo.descripcion_equipo}
                    </option>
                ))}
                </CFormSelect>
            </CCol>
            
            <CCol md={12}>
              <CFormLabel>Observaciones</CFormLabel>
              <CFormTextarea
                name="observacion"
                value={incidenciaForm.observacion}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, observacion: e.target.value})}
                rows={2}
                placeholder="Observaciones adicionales..."
              />
            </CCol>
            
            <CCol md={12}>
              <CFormLabel>¿Qué se hizo?</CFormLabel>
              <CFormTextarea
                name="que_se_hizo"
                value={incidenciaForm.que_se_hizo}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, que_se_hizo: e.target.value})}
                rows={2}
                placeholder="Acciones tomadas ante la incidencia..."
              />
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Estatus *</CFormLabel>
              <CFormSelect
                name="estatus"
                value={incidenciaForm.estatus}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, estatus: e.target.value})}
                required
              >
                <option value="ACTIVO">Activo</option>
                <option value="PROCESO">En Proceso</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="INACTIVO">Inactivo</option>
              </CFormSelect>
            </CCol>
            
            <CCol md={6} className="d-flex align-items-center mt-md-5">
              <CFormSwitch
                label="Marcar como crítico"
                id="critico-switch"
                checked={incidenciaForm.critico}
                onChange={(e) => setIncidenciaForm({...incidenciaForm, critico: e.target.checked})}
              />
              <div className="form-text text-muted ms-3">
                Las incidencias críticas se destacan visualmente
              </div>
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowIncidenciaModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveIncidencia}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditMode ? 'Actualizar Incidencia' : 'Crear Incidencia'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Incidencias;