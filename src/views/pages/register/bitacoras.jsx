import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CFormTextarea,
  CTooltip,
  CProgress
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilNotes,
  cilPlus,
  cilSearch,
  cilFilter,
  cilPencil,
  cilTrash,
  cilCalendar,
  cilClock,
  cilBriefcase,
  cilDescription,
  cilFile,
  cilBell,
  cilCloudUpload,
  cilPaperclip,
  cilX,
  cilCheck,
  cilTags,
  cilUser,
  cilLocationPin,
  cilInfo
} from '@coreui/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar servicios
import { 
  getBitacoras, 
  getBitacoraById, 
  createBitacora, 
  updateBitacora, 
  deleteBitacora,
  updateBitacoraStatus,
  getTiposBitacora
} from '../../../services/bitocoras.services';
import {
  getAdjuntosByBitacoraId,
  uploadAdjunto,
  deleteAdjunto,
  downloadAdjunto
} from '../../../services/adjuntos.service';

const Bitacoras = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Estados para la lista de bitácoras
  const [bitacoras, setBitacoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para la paginación
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estados para el filtrado
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    titulo: '',
    fecha_inicio: '',
    fecha_fin: '',
    estatus: '',
    tipo: '',
    fkarea: ''
  });
  
  // Estados para catálogos
  const [areas, setAreas] = useState([]);
  const [tiposBitacora, setTiposBitacora] = useState([]);
  
  // Estado para el modal de bitácora
  const [showBitacoraModal, setShowBitacoraModal] = useState(false);
  const [bitacoraForm, setBitacoraForm] = useState({
    titulo: '',
    descripcion: '',
    fkarea: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: format(new Date(), 'HH:mm'),
    estatus: 'ABIERTA',
    lugar: '',
    responsable: '',
    tipo: 'GENERAL'
  });
  const [activeTab, setActiveTab] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBitacoraId, setEditingBitacoraId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Estados para adjuntos
  const [adjuntos, setAdjuntos] = useState([]);
  const [loadingAdjuntos, setLoadingAdjuntos] = useState(false);
  const [adjuntoForm, setAdjuntoForm] = useState({
    descripcion: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  // Función para cargar bitácoras
  const loadBitacoras = async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true);
      const response = await getBitacoras(page, itemsPerPage, filtersObj);
      
      setBitacoras(response.bitacoras || []);
      if (response.pagination) {
        setTotalItems(response.pagination.total || 0);
        setTotalPages(Math.ceil((response.pagination.total || 0) / itemsPerPage));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar bitácoras:', err);
      setError('No se pudieron cargar las bitácoras. Intente nuevamente.');
      setBitacoras([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Función para cargar catálogos
  const loadCatalogos = async () => {
    try {
      // Cargar áreas
      const areasResponse = await fetch(`${process.env.REACT_APP_API_URL}/areas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const areasData = await areasResponse.json();
      setAreas(areasData.areas || []);
      
      // Cargar tipos de bitácora
      const tiposResponse = await getTiposBitacora();
      setTiposBitacora(tiposResponse.tipos || []);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    }
  };
  
  // Cargar bitácoras y catálogos al iniciar
  useEffect(() => {
    loadBitacoras(activePage);
    loadCatalogos();
  }, [activePage]);
  
  // Función para manejar cambio de página
  const handlePageChange = (page) => {
    setActivePage(page);
  };
  
  // Función para aplicar filtros
  const applyFilters = () => {
    setActivePage(1);
    loadBitacoras(1, filters);
  };
  
  // Función para resetear filtros
  const resetFilters = () => {
    const emptyFilters = {
      titulo: '',
      fecha_inicio: '',
      fecha_fin: '',
      estatus: '',
      tipo: '',
      fkarea: ''
    };
    setFilters(emptyFilters);
    setActivePage(1);
    loadBitacoras(1, emptyFilters);
  };
  
  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // FUNCIONES PARA GESTIÓN DE BITÁCORAS
  
  // Mostrar modal para nueva bitácora
  const handleNewBitacora = () => {
    setBitacoraForm({
      titulo: '',
      descripcion: '',
      fkarea: '',
      fecha: format(new Date(), 'yyyy-MM-dd'),
      hora: format(new Date(), 'HH:mm'),
      estatus: 'ABIERTA',
      lugar: '',
      responsable: '',
      tipo: 'GENERAL'
    });
    setAdjuntos([]);
    setActiveTab(1);
    setIsEditMode(false);
    setEditingBitacoraId(null);
    setFormError(null);
    setShowBitacoraModal(true);
  };
  
  // Mostrar modal para editar bitácora
  const handleEditBitacora = async (id) => {
    try {
      setLoading(true);
      const response = await getBitacoraById(id);
      const bitacora = response.bitacora;
      
      if (!bitacora) {
        throw new Error('No se pudo obtener la información de la bitácora');
      }
      
      // Formatear fechas para el formulario
      setBitacoraForm({
        titulo: bitacora.titulo || '',
        descripcion: bitacora.descripcion || '',
        fkarea: bitacora.fkarea || '',
        fecha: bitacora.fecha ? format(new Date(bitacora.fecha), 'yyyy-MM-dd') : '',
        hora: bitacora.hora || '',
        estatus: bitacora.estatus || 'ABIERTA',
        lugar: bitacora.lugar || '',
        responsable: bitacora.responsable || '',
        tipo: bitacora.tipo || 'GENERAL'
      });
      
      // Cargar adjuntos de la bitácora
      await loadAdjuntos(id);
      
      setActiveTab(1);
      setIsEditMode(true);
      setEditingBitacoraId(id);
      setFormError(null);
      setShowBitacoraModal(true);
    } catch (err) {
      console.error(`Error al cargar bitácora ${id}:`, err);
      setError('No se pudo cargar la información de la bitácora');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar adjuntos de una bitácora
  const loadAdjuntos = async (bitacoraId) => {
    try {
      setLoadingAdjuntos(true);
      const response = await getAdjuntosByBitacoraId(bitacoraId);
      setAdjuntos(response.adjuntos || []);
    } catch (err) {
      console.error(`Error al cargar adjuntos de la bitácora ${bitacoraId}:`, err);
    } finally {
      setLoadingAdjuntos(false);
    }
  };
  
  // Guardar bitácora (crear o actualizar)
  const handleSaveBitacora = async () => {
    // Validar formulario
    if (!bitacoraForm.titulo || !bitacoraForm.fecha || !bitacoraForm.tipo) {
      setFormError('Por favor complete todos los campos obligatorios (título, fecha y tipo)');
      return;
    }
    
    try {
      setSaving(true);
      
      const bitacoraData = {
        ...bitacoraForm,
        fkarea: bitacoraForm.fkarea ? parseInt(bitacoraForm.fkarea) : null
      };
      
      // Crear o actualizar bitácora
      let savedBitacora;
      if (isEditMode) {
        // Actualizar bitácora existente
        const response = await updateBitacora(editingBitacoraId, bitacoraData);
        savedBitacora = response.bitacora;
      } else {
        // Crear nueva bitácora
        const response = await createBitacora(bitacoraData);
        savedBitacora = response.bitacora;
      }
      
      const bitacoraId = savedBitacora.idbitacora || editingBitacoraId;
      
      // Recargar lista de bitácoras
      loadBitacoras(activePage);
      
      // Cerrar modal
      setShowBitacoraModal(false);
      setFormError(null);
    } catch (err) {
      console.error('Error al guardar bitácora:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Error al guardar la bitácora. Intente nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Eliminar bitácora
  const handleDeleteBitacora = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta bitácora?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteBitacora(id);
      
      // Recargar lista de bitácoras
      loadBitacoras(activePage);
    } catch (err) {
      console.error(`Error al eliminar bitácora ${id}:`, err);
      setError('No se pudo eliminar la bitácora. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // FUNCIONES PARA GESTIÓN DE ADJUNTOS
  
  // Manejar selección de archivo
  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Manejar clic en el botón de seleccionar archivo
  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  };
  
  // Subir adjunto
  const handleUploadAdjunto = async () => {
    if (!selectedFile) {
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (adjuntoForm.descripcion) {
        formData.append('descripcion', adjuntoForm.descripcion);
      }
      
      // Configurar axios para monitorear el progreso
      const onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      };
      
      // Subir archivo
      await uploadAdjunto(editingBitacoraId, selectedFile, adjuntoForm.descripcion);
      
      // Recargar adjuntos
      await loadAdjuntos(editingBitacoraId);
      
      // Limpiar formulario
      setSelectedFile(null);
      setAdjuntoForm({ descripcion: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error al subir adjunto:', err);
      alert('Error al subir el archivo. Intente nuevamente.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Eliminar adjunto
  const handleDeleteAdjunto = async (adjuntoId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este adjunto?')) {
      return;
    }
    
    try {
      await deleteAdjunto(editingBitacoraId, adjuntoId);
      
      // Recargar adjuntos
      await loadAdjuntos(editingBitacoraId);
    } catch (err) {
      console.error(`Error al eliminar adjunto ${adjuntoId}:`, err);
      alert('Error al eliminar el adjunto. Intente nuevamente.');
    }
  };
  
  // Descargar adjunto
  const handleDownloadAdjunto = async (adjunto) => {
    try {
      await downloadAdjunto(editingBitacoraId, adjunto.idadjunto, adjunto.nombre_archivo);
    } catch (err) {
      console.error(`Error al descargar adjunto ${adjunto.idadjunto}:`, err);
      alert('Error al descargar el archivo. Intente nuevamente.');
    }
  };
  
  // Función para obtener texto de estatus
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ABIERTA':
        return <CBadge color="info">Abierta</CBadge>;
      case 'EN_PROCESO':
        return <CBadge color="warning">En Proceso</CBadge>;
      case 'FINALIZADA':
        return <CBadge color="success">Finalizada</CBadge>;
      case 'CANCELADA':
        return <CBadge color="danger">Cancelada</CBadge>;
      default:
        return <CBadge color="secondary">{status}</CBadge>;
    }
  };
  
  // Función para obtener badge de tipo
  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'GENERAL':
        return <CBadge color="primary">General</CBadge>;
      case 'MANTENIMIENTO':
        return <CBadge color="danger">Mantenimiento</CBadge>;
      case 'INCIDENTE':
        return <CBadge color="warning">Incidente</CBadge>;
      case 'REPORTE':
        return <CBadge color="info">Reporte</CBadge>;
      case 'DOCUMENTO':
        return <CBadge color="success">Documento</CBadge>;
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
  
  // Función para obtener el ícono según el tipo de archivo
  const getFileIcon = (fileName) => {
    if (!fileName) return cilFile;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
      return 'cilImage';
    } else if (['doc', 'docx', 'odt'].includes(extension)) {
      return 'cilFile';
    } else if (['xls', 'xlsx', 'ods'].includes(extension)) {
      return 'cilSpreadsheet';
    } else if (['pdf'].includes(extension)) {
      return 'cilFile';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return 'cilFile';
    } else {
      return cilFile;
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
                  <CIcon icon={cilNotes} className="me-2" />
                  Gestión de Bitácoras
                </h4>
              </div>
              <div>
                <CButton 
                  color="primary" 
                  className="me-2"
                  onClick={handleNewBitacora}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nueva Bitácora
                </CButton>
                <CButton 
                  color={filterVisible ? "dark" : "light"}
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
                  <CFormLabel>Título</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilDescription} />
                    </CInputGroupText>
                    <CFormInput
                      name="titulo"
                      placeholder="Buscar por título"
                      value={filters.titulo}
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
                    <option value="ABIERTA">Abierta</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="FINALIZADA">Finalizada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Tipo</CFormLabel>
                  <CFormSelect
                    name="tipo"
                    value={filters.tipo}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    {tiposBitacora.map(tipo => (
                      <option key={tipo.valor} value={tipo.valor}>
                        {tipo.etiqueta}
                      </option>
                    ))}
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
                <p className="mt-2">Cargando bitácoras...</p>
              </div>
            ) : (
              <>
                <CTable hover responsive className="mb-4">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Título</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell>Hora</CTableHeaderCell>
                      <CTableHeaderCell>Lugar</CTableHeaderCell>
                      <CTableHeaderCell>Tipo</CTableHeaderCell>
                      <CTableHeaderCell>Estatus</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {bitacoras.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={7} className="text-center">
                          No se encontraron bitácoras
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      bitacoras.map(bitacora => (
                        <CTableRow key={bitacora.idbitacora}>
                          <CTableDataCell>
                            <strong>{bitacora.titulo}</strong>
                            {bitacora.adjuntos_count > 0 && (
                              <CBadge color="info" shape="rounded-pill" className="ms-2">
                                <CIcon icon={cilPaperclip} size="sm" /> {bitacora.adjuntos_count}
                              </CBadge>
                            )}
                          </CTableDataCell>
                          <CTableDataCell>{formatDate(bitacora.fecha)}</CTableDataCell>
                          <CTableDataCell>{bitacora.hora}</CTableDataCell>
                          <CTableDataCell>{bitacora.lugar || '-'}</CTableDataCell>
                          <CTableDataCell>{getTipoBadge(bitacora.tipo)}</CTableDataCell>
                          <CTableDataCell>{getStatusBadge(bitacora.estatus)}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CTooltip content="Editar bitácora">
                              <CButton
                                color="primary"
                                size="sm"
                                variant="outline"
                                className="me-2"
                                onClick={() => handleEditBitacora(bitacora.idbitacora)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                            </CTooltip>
                            <CTooltip content="Eliminar bitácora">
                              <CButton
                                color="danger"
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteBitacora(bitacora.idbitacora)}
                              >
                                <CIcon icon={cilTrash} />
                              </CButton>
                            </CTooltip>
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
                  Mostrando {bitacoras.length} de {totalItems} bitácoras
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      {/* Modal para crear/editar bitácora */}
      <CModal 
        visible={showBitacoraModal} 
        onClose={() => setShowBitacoraModal(false)}
        size="xl"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? (
              <>
                <CIcon icon={cilPencil} className="me-2" />
                Editar Bitácora
              </>
            ) : (
              <>
                <CIcon icon={cilNotes} className="me-2" />
                Nueva Bitácora
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
          
          <CNav variant="tabs" role="tablist">
            <CNavItem role="presentation">
              <CNavLink
                active={activeTab === 1}
                component="button"
                role="tab"
                aria-controls="info-tab-pane"
                aria-selected={activeTab === 1}
                onClick={() => setActiveTab(1)}
              >
                Información General
              </CNavLink>
            </CNavItem>
            {isEditMode && (
              <CNavItem role="presentation">
                <CNavLink
                  active={activeTab === 2}
                  component="button"
                  role="tab"
                  aria-controls="adjuntos-tab-pane"
                  aria-selected={activeTab === 2}
                  onClick={() => setActiveTab(2)}
                >
                  Archivos Adjuntos
                </CNavLink>
              </CNavItem>
            )}
          </CNav>
          <CTabContent className="mt-4">
            {/* Pestaña de Información General */}
            <CTabPane role="tabpanel" aria-labelledby="info-tab-pane" visible={activeTab === 1}>
              <CForm className="row g-3">
                <CCol md={12}>
                  <CFormLabel>Título de la Bitácora *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilDescription} />
                    </CInputGroupText>
                    <CFormInput
                      name="titulo"
                      value={bitacoraForm.titulo}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, titulo: e.target.value})}
                      required
                    />
                  </CInputGroup>
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
                      value={bitacoraForm.fecha}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, fecha: e.target.value})}
                      required
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={6}>
                  <CFormLabel>Hora</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilClock} />
                    </CInputGroupText>
                    <CFormInput
                      type="time"
                      name="hora"
                      value={bitacoraForm.hora}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, hora: e.target.value})}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={6}>
                  <CFormLabel>Lugar</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormInput
                      name="lugar"
                      value={bitacoraForm.lugar}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, lugar: e.target.value})}
                      placeholder="Ubicación"
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={6}>
                  <CFormLabel>Área</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilBriefcase} />
                    </CInputGroupText>
                    <CFormSelect
                      name="fkarea"
                      value={bitacoraForm.fkarea}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, fkarea: e.target.value})}
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
                  <CFormLabel>Tipo de Bitácora *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilTags} />
                    </CInputGroupText>
                    <CFormSelect
                      name="tipo"
                      value={bitacoraForm.tipo}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, tipo: e.target.value})}
                      required
                    >
                      {tiposBitacora.map(tipo => (
                        <option key={tipo.valor} value={tipo.valor}>
                          {tipo.etiqueta}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>
                </CCol>
                
                <CCol md={6}>
                  <CFormLabel>Estatus *</CFormLabel>
                  <CFormSelect
                    name="estatus"
                    value={bitacoraForm.estatus}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, estatus: e.target.value})}
                    required
                  >
                    <option value="ABIERTA">Abierta</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="FINALIZADA">Finalizada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={12}>
                  <CFormLabel>Responsable</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      name="responsable"
                      value={bitacoraForm.responsable}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, responsable: e.target.value})}
                      placeholder="Persona responsable"
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={12}>
                  <CFormLabel>Descripción</CFormLabel>
                  <CFormTextarea
                    name="descripcion"
                    value={bitacoraForm.descripcion}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, descripcion: e.target.value})}
                    rows={5}
                    placeholder="Descripción detallada..."
                  />
                </CCol>
              </CForm>
            </CTabPane>
            
            {/* Pestaña de Archivos Adjuntos */}
            {isEditMode && (
              <CTabPane role="tabpanel" aria-labelledby="adjuntos-tab-pane" visible={activeTab === 2}>
                <div className="mb-3">
                  <h5>Adjuntar Archivo</h5>
                  <CForm className="row g-3">
                    <CCol md={12}>
                      <div className="mb-3">
                        <CFormLabel>Descripción del Archivo</CFormLabel>
                        <CFormInput
                          name="descripcion"
                          value={adjuntoForm.descripcion}
                          onChange={(e) => setAdjuntoForm({...adjuntoForm, descripcion: e.target.value})}
                          placeholder="Descripción del archivo (opcional)"
                        />
                      </div>
                      
                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <CButton
                            color="primary"
                            variant="outline"
                            onClick={handleSelectFileClick}
                          >
                            <CIcon icon={cilCloudUpload} className="me-2" />
                            Seleccionar Archivo
                          </CButton>
                          
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                          />
                          
                          {selectedFile && (
                            <span className="text-truncate">
                              {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {uploading && (
                        <div className="mb-3">
                          <CProgress value={uploadProgress} className="mb-2">
                            {uploadProgress}%
                          </CProgress>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-end">
                        <CButton
                          color="primary"
                          onClick={handleUploadAdjunto}
                          disabled={!selectedFile || uploading}
                        >
                          {uploading ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Subiendo...
                            </>
                          ) : (
                            <>
                              <CIcon icon={cilCloudUpload} className="me-2" />
                              Subir Archivo
                            </>
                          )}
                        </CButton>
                      </div>
                    </CCol>
                  </CForm>
                </div>
                
                <hr />
                
                <div className="mt-3">
                  <h5>Archivos Adjuntos</h5>
                  {loadingAdjuntos ? (
                    <div className="text-center my-3">
                      <CSpinner size="sm" />
                      <p>Cargando adjuntos...</p>
                    </div>
                  ) : (
                    <CTable hover responsive>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Archivo</CTableHeaderCell>
                          <CTableHeaderCell>Descripción</CTableHeaderCell>
                          <CTableHeaderCell>Tamaño</CTableHeaderCell>
                          <CTableHeaderCell>Fecha</CTableHeaderCell>
                          <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {adjuntos.length === 0 ? (
                          <CTableRow>
                            <CTableDataCell colSpan={5} className="text-center">
                              No hay archivos adjuntos para esta bitácora
                            </CTableDataCell>
                          </CTableRow>
                        ) : (
                          adjuntos.map((adjunto) => (
                            <CTableRow key={adjunto.idadjunto}>
                              <CTableDataCell>
                                <div className="d-flex align-items-center">
                                  <CIcon icon={getFileIcon(adjunto.nombre_archivo)} className="me-2" />
                                  <span className="text-truncate" style={{ maxWidth: "200px" }}>
                                    {adjunto.nombre_archivo}
                                  </span>
                                </div>
                              </CTableDataCell>
                              <CTableDataCell>
                                {adjunto.descripcion || '-'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {Math.round(adjunto.tamano / 1024)} KB
                              </CTableDataCell>
                              <CTableDataCell>
                                {formatDate(adjunto.fecha_creacion)}
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                <CTooltip content="Descargar archivo">
                                  <CButton
                                    color="primary"
                                    size="sm"
                                    variant="outline"
                                    className="me-2"
                                    onClick={() => handleDownloadAdjunto(adjunto)}
                                  >
                                    <CIcon icon={cilCloudUpload} className="icon-flip-vertical" />
                                  </CButton>
                                </CTooltip>
                                <CTooltip content="Eliminar archivo">
                                  <CButton
                                    color="danger"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteAdjunto(adjunto.idadjunto)}
                                  >
                                    <CIcon icon={cilTrash} />
                                  </CButton>
                                </CTooltip>
                              </CTableDataCell>
                            </CTableRow>
                          ))
                        )}
                      </CTableBody>
                    </CTable>
                  )}
                </div>
              </CTabPane>
            )}
          </CTabContent>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowBitacoraModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveBitacora}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditMode ? 'Actualizar Bitácora' : 'Crear Bitácora'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Bitacoras;