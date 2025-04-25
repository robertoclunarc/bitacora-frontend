import React, { useState, useEffect, useRef, useCallback } from 'react';
//import { useNavigate } from 'react-router-dom';
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
  CProgress,
  CFormSwitch,
  //CFormCheck
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilNotes,
  cilPlus,
  cilSearch,
  cilFilter,
  cilPencil,
  cilCalendar,
  cilClock,
  //cilBriefcase,
  cilDescription,
  cilFile,
  //cilBell,
  cilCloudUpload,
  cilPaperclip,
  cilX,
  //cilCheck,
  //cilTags,
  cilUser,
  cilLocationPin,
  //cilElevator,
  cilCopy,
  cilWarning,
  //cilStar
} from '@coreui/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar servicios
import { 
  getBitacoras, 
  getBitacoraById, 
  createBitacora, 
  updateBitacora, 
  //updateBitacoraStatus,
  toggleBitacoraCartelera
} from '../../../services/bitocoras.services';
import {
  getArchivosByBitacoraId,
  uploadArchivo,
  deleteArchivo,
  downloadArchivo
} from '../../../services/archivos.service';
import { getTiposBitacora } from '../../../services/tiposBitacora.service';
import { getEquipos } from '../../../services/equipos.service';
import { getAreas } from '../../../services/areas.service';

const Bitacoras = () => {
  //const navigate = useNavigate();
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
  const [filterVisible, setFilterVisible] = useState(true);
  const [filters, setFilters] = useState({
    tema: '',
    fecha_inicio: '',
    fecha_fin: '',
    estatus: '',
    tipo: '',
    fkarea: '',
    turno: '',
    fkequipo: '',
    critico: ''
  });
  
  // Estados para catálogos
  const [areas, setAreas] = useState([]);
  const [tiposBitacora, setTiposBitacora] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [userData, setUserData] = useState(null);
  
  // Estado para el modal de bitácora
  const [showBitacoraModal, setShowBitacoraModal] = useState(false);
  const [bitacoraForm, setBitacoraForm] = useState({
    tema: '',
    descripcion: '',
    fkarea: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: format(new Date(), 'HH:mm'),
    turno: '1',
    estatus: 'ACTIVO',
    lugar: '',
    responsables: '',
    tipo: '',
    fkequipo: '',
    critico: false,
    publico: true,
    observacion: '',
    que_se_hizo: '',
    horas_duracion: ''
  });
  const [activeTab, setActiveTab] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBitacoraId, setEditingBitacoraId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Estados para archivos
  const [archivos, setArchivos] = useState([]);
  const [loadingArchivos, setLoadingArchivos] = useState(false);
  const [archivoForm, setArchivoForm] = useState({
    descripcion: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  // Estado para publicación en cartelera
  const [updatingCartelera, setUpdatingCartelera] = useState(false);
  
  // Función para cargar bitácoras
  const loadBitacoras = useCallback(async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true);
      const response = await getBitacoras(page, itemsPerPage, filtersObj);
      
      setBitacoras(Array.isArray(response.bitacoras) ? response.bitacoras : []);
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
      
      // Cargar tipos de bitácora
      const tiposResponse = await getTiposBitacora();
      setTiposBitacora(tiposResponse.tipos || []);
      
      // Cargar equipos
      const equiposResponse = await getEquipos(localStorage.getItem('token'));
      //console.log('Equipos:', equiposResponse.equipos);
      setEquipos(equiposResponse.equipos || []);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    }
  };
  
  // Cargar bitácoras y catálogos al iniciar
  useEffect(() => {
    loadBitacoras(activePage);
    loadCatalogos();
  }, [activePage, loadBitacoras]);
  
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
      tema: '',
      fecha_inicio: '',
      fecha_fin: '',
      estatus: '',
      tipo: '',
      fkarea: '',
      turno: '',
      fkequipo: '',
      critico: ''
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
    // Establecer valores por defecto
    const defaultAreaId = userData?.fkarea || '';
    
    setBitacoraForm({
      tema: '',
      descripcion: '',
      fkarea: defaultAreaId,
      fecha: format(new Date(), 'yyyy-MM-dd'),
      hora: format(new Date(), 'HH:mm'),
      turno: '1',
      estatus: 'ACTIVO',
      lugar: '',
      responsables: userData?.nombres || '',
      tipo: tiposBitacora.length > 0 ? tiposBitacora[0].descripciontipo : '',
      fkequipo: '',
      critico: false,
      publico: true,
      observacion: '',
      que_se_hizo: '',
      horas_duracion: ''
    });
    setArchivos([]);
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
      
      // Formatear para el formulario
      setBitacoraForm({
        tema: bitacora.tema || '',
        descripcion: bitacora.descripcion || '',
        fkarea: bitacora.fkarea || '',
        fecha: bitacora.fecha ? format(new Date(bitacora.fecha), 'yyyy-MM-dd') : '',
        hora: bitacora.hora || '',
        turno: bitacora.turno || '1',
        estatus: bitacora.estatus || 'ACTIVO',
        lugar: bitacora.lugar || '',
        responsables: bitacora.responsables || '',
        tipo: bitacora.tipo || '',
        fkequipo: bitacora.fkequipo || '',
        critico: bitacora.critico ? true : false,
        publico: bitacora.publico ? true : false,
        observacion: bitacora.observacion || '',
        que_se_hizo: bitacora.que_se_hizo || '',
        horas_duracion: bitacora.horas_duracion || ''
      });
      
      // Cargar archivos de la bitácora
      await loadArchivos(id);
      
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
  
  // Cargar archivos de una bitácora
  const loadArchivos = async (bitacoraId) => {
    try {
      setLoadingArchivos(true);
      const response = await getArchivosByBitacoraId(bitacoraId);
      setArchivos(response.archivos || []);
    } catch (err) {
      console.error(`Error al cargar archivos de la bitácora ${bitacoraId}:`, err);
    } finally {
      setLoadingArchivos(false);
    }
  };
  
  // Guardar bitácora (crear o actualizar)
  const handleSaveBitacora = async () => {
    // Validar formulario
    if (!bitacoraForm.descripcion || !bitacoraForm.fecha || !bitacoraForm.hora || !bitacoraForm.turno || !bitacoraForm.fkarea) {
      setFormError('Por favor complete todos los campos obligatorios (descripción, fecha, hora, turno y área)');
      return;
    }
    
    try {
      setSaving(true);
      
      const bitacoraData = {
        ...bitacoraForm,
        fkarea: parseInt(bitacoraForm.fkarea),
        fkequipo: bitacoraForm.fkequipo ? parseInt(bitacoraForm.fkequipo) : null,
        lugar: bitacoraForm.lugar ? bitacoraForm.lugar : null,
        critico: bitacoraForm.critico ? 1 : 0,
        publico: bitacoraForm.publico ? 1 : 0,
        horas_duracion: bitacoraForm.horas_duracion ? parseFloat(bitacoraForm.horas_duracion) : null
      };
      
      // Crear o actualizar bitácora
      //let savedBitacora;
      if (isEditMode) {
        // Actualizar bitácora existente
        await updateBitacora(editingBitacoraId, bitacoraData);
        
      } else {
        // Crear nueva bitácora
        await createBitacora(bitacoraData);
        //savedBitacora = response.bitacora;
      }
      
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
  
  // Publicar o quitar de cartelera
  const handleToggleCartelera = async (bitacoraId, currentStatus) => {
    try {
      setUpdatingCartelera(true);
      await toggleBitacoraCartelera(bitacoraId);
      
      // Actualizar estado en la lista local
      const updatedBitacoras = bitacoras.map(b => {
        if (b.idbitacora === bitacoraId) {
          return { 
            ...b, 
            en_cartelera: currentStatus ? null : 1 
          };
        }
        return b;
      });
      
      setBitacoras(updatedBitacoras);
    } catch (err) {
      console.error(`Error al cambiar estado de cartelera para bitácora ${bitacoraId}:`, err);
      setError('No se pudo actualizar el estado de cartelera. Intente nuevamente.');
    } finally {
      setUpdatingCartelera(false);
    }
  };
  
  // FUNCIONES PARA GESTIÓN DE ARCHIVOS
  
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
  
  // Subir archivo
  const handleUploadArchivo = async () => {
    if (!selectedFile) {
      return;
    }
    
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Simular actualización de progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Subir archivo
      await uploadArchivo(editingBitacoraId, selectedFile, archivoForm.descripcion);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Recargar archivos
      await loadArchivos(editingBitacoraId);
      
      // Limpiar formulario
      setSelectedFile(null);
      setArchivoForm({ descripcion: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error al subir archivo:', err);
      alert('Error al subir el archivo. Intente nuevamente.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  // Eliminar archivo
  const handleDeleteArchivo = async (archivoId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este archivo?')) {
      return;
    }
    
    try {
      await deleteArchivo(editingBitacoraId, archivoId);
      
      // Recargar archivos
      await loadArchivos(editingBitacoraId);
    } catch (err) {
      console.error(`Error al eliminar archivo ${archivoId}:`, err);
      alert('Error al eliminar el archivo. Intente nuevamente.');
    }
  };
  
  // Descargar archivo
  const handleDownloadArchivo = async (archivo) => {
    try {
      await downloadArchivo(editingBitacoraId, archivo.idarchivo, archivo.nombre_archivo);
    } catch (err) {
      console.error(`Error al descargar archivo ${archivo.idarchivo}:`, err);
      alert('Error al descargar el archivo. Intente nuevamente.');
    }
  };
  
  // Función para obtener texto de estatus
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVO':
        return <CBadge color="info">Activo</CBadge>;
      case 'INACTIVO':
        return <CBadge color="danger">Inactivo</CBadge>;
      case 'PENDIENTE':
        return <CBadge color="warning">Pendiente</CBadge>;
      case 'FINALIZADO':
        return <CBadge color="success">Finalizado</CBadge>;
      default:
        return <CBadge color="secondary">{status}</CBadge>;
    }
  };
  
  // Función para obtener badge de turno
  const getTurnoBadge = (turno) => {
    switch (turno) {
      case '1':
        return <CBadge color="primary">Mañana</CBadge>;
      case '2':
        return <CBadge color="warning">Tarde</CBadge>;
      case '3':
        return <CBadge color="dark">Noche</CBadge>;
      default:
        return <CBadge color="secondary">{turno}</CBadge>;
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
      return 'cilFile';
    } else if (['pdf'].includes(extension)) {
      return 'cilFile';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
      return 'cilFile';
    } else {
      return cilFile;
    }
  };
  
  // Función para obtener el nombre de tipo de bitácora
  /*
  const getTipoBitacoraNombre = (tipo) => {
    const tipoBitacora = tiposBitacora.find(t => t.descripciontipo === tipo);
    return tipoBitacora ? tipoBitacora.descripciontipo : tipo;
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
                  <CFormLabel>Tema/Descripción</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilDescription} />
                    </CInputGroupText>
                    <CFormInput
                      name="tema"
                      placeholder="Buscar por tema o descripción"
                      value={filters.tema}
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
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="FINALIZADO">Finalizado</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Turno</CFormLabel>
                  <CFormSelect
                    name="turno"
                    value={filters.turno}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="1">Mañana</option>
                    <option value="2">Tarde</option>
                    <option value="3">Noche</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Tipo</CFormLabel>
                  <CFormSelect
                    name="tipo"
                    value={filters.tipo}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    {tiposBitacora.map(tipo => (
                      <option key={tipo.idtipo} value={tipo.descripciontipo}>
                        {tipo.descripciontipo}
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
                      <CTableHeaderCell style={{ minWidth: '200px' }}>Tema/Descripción</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell>Turno</CTableHeaderCell>
                      <CTableHeaderCell>Área</CTableHeaderCell>
                      <CTableHeaderCell>Equipo</CTableHeaderCell>
                      <CTableHeaderCell>Tipo</CTableHeaderCell>
                      <CTableHeaderCell>Estatus</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {bitacoras.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={8} className="text-center">
                          No se encontraron bitácoras
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      bitacoras.map(bitacora => (
                        <CTableRow key={bitacora.idbitacora} className={bitacora.critico ? 'table-danger' : ''}>
                          <CTableDataCell>
                            <div className="d-flex align-items-center">
                              {bitacora.critico && (
                                <CIcon icon={cilWarning} className="me-2 text-danger" />
                              )}
                              <div>
                                <strong>{bitacora.tema || 'Sin título'}: </strong>
                                <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                                  {bitacora.descripcion.substring(0, 50)}
                                  {bitacora.descripcion.length > 50 ? '...' : ''}
                                </div>
                                <div className="mt-1">
                                  {bitacora.archivos_count > 0 && (
                                    <CBadge color="info" shape="rounded-pill" className="me-2">
                                      <CIcon icon={cilPaperclip} size="sm" /> {bitacora.archivos_count}
                                    </CBadge>
                                  )}
                                  {!bitacora.publico && (
                                    <CBadge color="dark" shape="rounded-pill" className="me-2">
                                      Privado
                                    </CBadge>
                                  )}
                                  {bitacora.en_cartelera && (
                                    <CBadge color="warning" shape="rounded-pill">
                                      En Cartelera
                                    </CBadge>
                                  )}
                                  {bitacora.horas_duracion && (
                                    <CBadge color="secondary" shape="rounded-pill" className="ms-2">
                                      <CIcon icon={cilClock} size="sm" /> {bitacora.horas_duracion}h
                                    </CBadge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>{formatDate(bitacora.fecha)}</CTableDataCell>
                          <CTableDataCell>{getTurnoBadge(bitacora.turno)}</CTableDataCell>
                          <CTableDataCell>{bitacora.nombre_area || '-'}</CTableDataCell>
                          <CTableDataCell>{bitacora.nombre_equipo || '-'}</CTableDataCell>
                          <CTableDataCell>{bitacora.tipo || '-'}</CTableDataCell>
                          <CTableDataCell>{getStatusBadge(bitacora.estatus)}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CTooltip content="Editar bitácora">
                              <CButton
                                color="primary"
                                size="sm"
                                variant="outline"
                                className="me-1"
                                onClick={() => handleEditBitacora(bitacora.idbitacora)}
                              >
                                <CIcon icon={cilPencil} />
                              </CButton>
                            </CTooltip>
                            <CTooltip content={bitacora.en_cartelera ? "Quitar de cartelera" : "Publicar en cartelera"}>
                              <CButton
                                color={bitacora.en_cartelera ? "warning" : "success"}
                                size="sm"
                                variant="outline"
                                className="me-1"
                                onClick={() => handleToggleCartelera(bitacora.idbitacora, bitacora.en_cartelera)}
                                disabled={updatingCartelera}
                              >
                                <CIcon icon={bitacora.en_cartelera ? cilX : cilCopy} />
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
            <CNavItem role="presentation">
              <CNavLink
                active={activeTab === 2}
                component="button"
                role="tab"
                aria-controls="details-tab-pane"
                aria-selected={activeTab === 2}
                onClick={() => setActiveTab(2)}
              >
                Detalles
              </CNavLink>
            </CNavItem>
            {isEditMode && (
              <CNavItem role="presentation">
                <CNavLink
                  active={activeTab === 3}
                  component="button"
                  role="tab"
                  aria-controls="adjuntos-tab-pane"
                  aria-selected={activeTab === 3}
                  onClick={() => setActiveTab(3)}
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
                  <CFormLabel>Tema</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilDescription} />
                    </CInputGroupText>
                    <CFormInput
                      name="tema"
                      value={bitacoraForm.tema}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, tema: e.target.value})}
                      placeholder="Título o tema de la bitácora"
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={12}>
                  <CFormLabel>Descripción *</CFormLabel>
                  <CFormTextarea
                    name="descripcion"
                    value={bitacoraForm.descripcion}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, descripcion: e.target.value})}
                    rows={4}
                    placeholder="Descripción detallada..."
                    required
                  />
                </CCol>
                
                <CCol md={4}>
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
                
                <CCol md={4}>
                  <CFormLabel>Hora *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilClock} />
                    </CInputGroupText>
                    <CFormInput
                      type="time"
                      name="hora"
                      value={bitacoraForm.hora}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, hora: e.target.value})}
                      required
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Turno *</CFormLabel>
                  <CFormSelect
                    name="turno"
                    value={bitacoraForm.turno}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, turno: e.target.value})}
                    required
                  >
                    <option value="1">Mañana</option>
                    <option value="2">Tarde</option>
                    <option value="3">Noche</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Área *</CFormLabel>
                  <CFormSelect
                    name="fkarea"
                    value={bitacoraForm.fkarea}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, fkarea: e.target.value})}
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
                
                <CCol md={4}>
                  <CFormLabel>Equipo</CFormLabel>
                  <CFormSelect
                    name="fkequipo"
                    value={bitacoraForm.fkequipo}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, fkequipo: e.target.value})}
                  >
                    <option value="">Sin equipo</option>
                    {equipos.map(equipo => (
                      <option key={equipo.idequipo} value={equipo.idequipo}>
                        {equipo.descripcion_equipo}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Tipo</CFormLabel>
                  <CFormSelect
                    name="tipo"
                    value={bitacoraForm.tipo}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, tipo: e.target.value})}
                  >
                    <option value="">Seleccione un tipo</option>
                    {tiposBitacora.map(tipo => (
                      <option key={tipo.idtipo} value={tipo.descripciontipo}>
                        {tipo.descripciontipo}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Estatus *</CFormLabel>
                  <CFormSelect
                    name="estatus"
                    value={bitacoraForm.estatus}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, estatus: e.target.value})}
                    required
                  >
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="FINALIZADO">Finalizado</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Lugar</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilLocationPin} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="lugar"
                      value={bitacoraForm.lugar}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, lugar: e.target.value})}
                      placeholder="Lugar de la actividad"
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Horas de duración</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilClock} />
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      name="horas_duracion"
                      value={bitacoraForm.horas_duracion}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, horas_duracion: e.target.value})}
                      placeholder="Horas"
                      step="0.5"
                      min="0"
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol xs={6} className="mt-4">
                  <CFormSwitch
                    label="Es crítico"
                    id="critico-switch"
                    checked={bitacoraForm.critico}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, critico: e.target.checked})}
                  />
                  <div className="form-text text-muted">
                    Marcar como crítico destaca esta bitácora.
                  </div>
                </CCol>
                
                <CCol xs={6} className="mt-4">
                  <CFormSwitch
                    label="Es público"
                    id="publico-switch"
                    checked={bitacoraForm.publico}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, publico: e.target.checked})}
                  />
                  <div className="form-text text-muted">
                    Si no es público, solo su área podrá verlo.
                  </div>
                </CCol>
              </CForm>
            </CTabPane>
            
            {/* Pestaña de Detalles */}
            <CTabPane role="tabpanel" aria-labelledby="details-tab-pane" visible={activeTab === 2}>
              <CForm className="row g-3">
                <CCol md={12}>
                  <CFormLabel>Responsables</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      name="responsables"
                      value={bitacoraForm.responsables}
                      onChange={(e) => setBitacoraForm({...bitacoraForm, responsables: e.target.value})}
                      placeholder="Responsables de la actividad"
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={12}>
                  <CFormLabel>Observaciones</CFormLabel>
                  <CFormTextarea
                    name="observacion"
                    value={bitacoraForm.observacion}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, observacion: e.target.value})}
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
                </CCol>
                
                <CCol md={12}>
                  <CFormLabel>¿Qué se hizo?</CFormLabel>
                  <CFormTextarea
                    name="que_se_hizo"
                    value={bitacoraForm.que_se_hizo}
                    onChange={(e) => setBitacoraForm({...bitacoraForm, que_se_hizo: e.target.value})}
                    rows={3}
                    placeholder="Descripción de acciones realizadas..."
                  />
                </CCol>
              </CForm>
            </CTabPane>
            
            {/* Pestaña de Archivos Adjuntos */}
            {isEditMode && (
              <CTabPane role="tabpanel" aria-labelledby="adjuntos-tab-pane" visible={activeTab === 3}>
                <div className="mb-3">
                  <h5>Adjuntar Archivo</h5>
                  <CForm className="row g-3">
                    <CCol md={12}>
                      <div className="mb-3">
                        <CFormLabel>Descripción del Archivo</CFormLabel>
                        <CFormInput
                          name="descripcion"
                          value={archivoForm.descripcion}
                          onChange={(e) => setArchivoForm({...archivoForm, descripcion: e.target.value})}
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
                          onClick={handleUploadArchivo}
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
                  {loadingArchivos ? (
                    <div className="text-center my-3">
                      <CSpinner size="sm" />
                      <p>Cargando archivos...</p>
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
                        {archivos.length === 0 ? (
                          <CTableRow>
                            <CTableDataCell colSpan={5} className="text-center">
                              No hay archivos adjuntos para esta bitácora
                            </CTableDataCell>
                          </CTableRow>
                        ) : (
                          archivos.map((archivo) => (
                            <CTableRow key={archivo.idarchivo}>
                              <CTableDataCell>
                                <div className="d-flex align-items-center">
                                  <CIcon icon={getFileIcon(archivo.nombre_archivo)} className="me-2" />
                                  <span className="text-truncate" style={{ maxWidth: "200px" }}>
                                    {archivo.nombre_archivo}
                                  </span>
                                </div>
                              </CTableDataCell>
                              <CTableDataCell>
                                {archivo.descripcion || '-'}
                              </CTableDataCell>
                              <CTableDataCell>
                                {Math.round(archivo.tamano / 1024)} KB
                              </CTableDataCell>
                              <CTableDataCell>
                                {formatDate(archivo.fecha_carga)}
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                <CTooltip content="Descargar archivo">
                                  <CButton
                                    color="primary"
                                    size="sm"
                                    variant="outline"
                                    className="me-2"
                                    onClick={() => handleDownloadArchivo(archivo)}
                                  >
                                    <CIcon icon={cilCloudUpload} className="icon-flip-vertical" />
                                  </CButton>
                                </CTooltip>
                                <CTooltip content="Eliminar archivo">
                                  <CButton
                                    color="danger"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteArchivo(archivo.idarchivo)}
                                  >
                                    <CIcon icon={cilX} />
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