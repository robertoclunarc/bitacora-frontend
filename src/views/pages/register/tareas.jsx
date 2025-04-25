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
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilList,
  cilPlus,
  cilSearch,
  cilFilter,
  cilPencil,
  cilCalendar,
  cilUser,
  cilInfo,
  cilBan,
  cilCheck,
  cilClock,
  //cilTrash,
  //cilWarning,
  //cilTag,
  cilChart
} from '@coreui/icons';
import { format/*, parseISO*/, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Chart } from "react-google-charts";

// Importar servicios
import { 
  getTareas, 
  getTareaById, 
  createTarea, 
  updateTarea, 
  updateTareaStatus
} from '../../../services/tareas.service';
import {
  getDetallesByTareaId,
  createDetalle,
  updateDetalle,
  updateDetalleStatus
} from '../../../services/detallesTareas.service';
import { getEquipos } from '../../../services/equipos.service';

const Tareas = () => {
  // Estados para la lista de tareas
  const [tareas, setTareas] = useState([]);
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
    descripcion: '',
    tipo_tarea: '',
    estatus: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  
  // Estados para el modal de tarea
  const [showTareaModal, setShowTareaModal] = useState(false);
  const [tareaForm, setTareaForm] = useState({
    descripcion: '',
    tipo_tarea: 'NORMAL',
    estatus: 'PENDIENTE',
    fkarea: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTareaId, setEditingTareaId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Estados para detalles de tareas
  const [detalles, setDetalles] = useState([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  
  // Estados para el modal de detalle de tarea
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detalleForm, setDetalleForm] = useState({
    descripcion: '',
    responsable: '',
    fkequipo: '',
    fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
    fecha_fin: '',
    estatus: 'PENDIENTE'
  });
  const [isEditingDetalle, setIsEditingDetalle] = useState(false);
  const [editingDetalleId, setEditingDetalleId] = useState(null);
  const [detalleFormError, setDetalleFormError] = useState(null);
  const [savingDetalle, setSavingDetalle] = useState(false);
  
  // Estados para equipos
  const [equipos, setEquipos] = useState([]);
  const [userData, setUserData] = useState(null);
  
  // Función para cargar tareas
  const loadTareas = useCallback(async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true);
      const response = await getTareas(page, itemsPerPage, filtersObj);

      // Cargar información del usuario
      const userStr = localStorage.getItem('user');      
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
        
      }
      
      setTareas(response.tareas || []);
      if (response.pagination) {
        setTotalItems(response.pagination.total || 0);
        setTotalPages(Math.ceil((response.pagination.total || 0) / itemsPerPage));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
      setError('No se pudieron cargar las tareas. Intente nuevamente.');
      setTareas([]);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);
  
  // Función para cargar equipos
  const loadEquipos = async () => {
    try {      
      // Cargar equipos
      const equiposResponse = await getEquipos(localStorage.getItem('token'));
      setEquipos(equiposResponse.equipos || []);
    } catch (err) {
      console.error('Error al cargar equipos:', err);
    }
  };
  
  // Cargar tareas y equipos al iniciar
  useEffect(() => {
    loadTareas(activePage);
    loadEquipos();
  }, [activePage, loadTareas]);
  
  // Función para manejar cambio de página
  const handlePageChange = (page) => {
    setActivePage(page);
  };
  
  // Función para aplicar filtros
  const applyFilters = () => {
    setActivePage(1);
    loadTareas(1, filters);
  };
  
  // Función para resetear filtros
  const resetFilters = () => {
    const emptyFilters = {
      descripcion: '',
      tipo_tarea: '',
      estatus: '',
      fecha_inicio: '',
      fecha_fin: ''
    };
    setFilters(emptyFilters);
    setActivePage(1);
    loadTareas(1, emptyFilters);
  };
  
  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // FUNCIONES PARA GESTIÓN DE TAREAS
  
  // Mostrar modal para nueva tarea
  const handleNewTarea = () => {
    setTareaForm({
      descripcion: '',
      tipo_tarea: 'NORMAL',
      estatus: 'PENDIENTE',
      fkarea: ''
    });
    
    setIsEditMode(false);
    setEditingTareaId(null);
    setFormError(null);
    setShowTareaModal(true);
  };
  
  // Mostrar modal para editar tarea
  const handleEditTarea = async (id) => {
    try {
      setLoading(true);
      const response = await getTareaById(id);
      const tarea = response.tarea;
      
      if (!tarea) {
        throw new Error('No se pudo obtener la información de la tarea');
      }
      
      // Formatear para el formulario
      setTareaForm({
        descripcion: tarea.descripcion || '',
        tipo_tarea: tarea.tipo_tarea || 'NORMAL',
        estatus: tarea.estatus || 'PENDIENTE',
        fkarea: tarea.fkarea
      });
      
      setIsEditMode(true);
      setEditingTareaId(id);
      setFormError(null);
      setShowTareaModal(true);
    } catch (err) {
      console.error(`Error al cargar tarea ${id}:`, err);
      setError('No se pudo cargar la información de la tarea');
    } finally {
      setLoading(false);
    }
  };
  
  // Ver detalles de tarea
  const handleViewTareaDetails = async (id) => {
    try {
      setLoadingDetalles(true);
      
      // Cargar tarea y detalles
      const tareaResponse = await getTareaById(id);
      const tarea = tareaResponse.tarea;
      
      if (!tarea) {
        throw new Error('No se pudo obtener la información de la tarea');
      }
      
      // Formatear para el formulario
      setTareaForm({
        descripcion: tarea.descripcion || '',
        tipo_tarea: tarea.tipo_tarea || 'NORMAL',
        estatus: tarea.estatus || 'PENDIENTE',
        fkarea: tarea.fkarea
      });
      
      // Cargar detalles
      const detallesResponse = await getDetallesByTareaId(id);
      setDetalles(detallesResponse.detalles || []);
      
      setEditingTareaId(id);
      setActiveTab(1);
      
      // Seleccionar la primera pestaña
      setActiveTab(1);
    } catch (err) {
      console.error(`Error al cargar detalles de tarea ${id}:`, err);
      setError('No se pudo cargar la información de la tarea y sus detalles');
    } finally {
      setLoadingDetalles(false);
    }
  };
  
  // Guardar tarea (crear o actualizar)
  const handleSaveTarea = async () => {
    // Validar formulario
    if (!tareaForm.descripcion || !tareaForm.tipo_tarea) {
      setFormError('Por favor complete todos los campos obligatorios (descripción y tipo)');
      return;
    }
    
    try {
      setSaving(true);
      
      // Crear o actualizar tarea
      if (isEditMode) {
        // Actualizar tarea existente
        await updateTarea(editingTareaId, tareaForm);
      } else {
        // Crear nueva tarea
        await createTarea(tareaForm);
      }
      
      // Recargar lista de tareas
      loadTareas(activePage);
      
      // Cerrar modal
      setShowTareaModal(false);
      setFormError(null);
    } catch (err) {
      console.error('Error al guardar tarea:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Error al guardar la tarea. Intente nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Actualizar estatus de tarea
  const handleUpdateTareaStatus = async (id, newStatus) => {
    try {
      await updateTareaStatus(id, newStatus);
      
      // Actualizar estado local
      setTareas(tareas.map(tarea => {
        if (tarea.idtarea === id) {
          return { ...tarea, estatus: newStatus };
        }
        return tarea;
      }));
      
      // Si estamos editando esta tarea, actualizar el formulario
      if (editingTareaId === id) {
        setTareaForm(prev => ({ ...prev, estatus: newStatus }));
      }
    } catch (err) {
      console.error(`Error al actualizar estatus de tarea ${id}:`, err);
      setError('No se pudo actualizar el estatus de la tarea');
    }
  };
  
  // FUNCIONES PARA GESTIÓN DE DETALLES DE TAREAS
  
  // Mostrar modal para nuevo detalle
  const handleNewDetalle = () => {
    setDetalleForm({
      descripcion: '',
      responsable: '',
      fkequipo: '',
      fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
      fecha_fin: '',
      estatus: 'PENDIENTE'
    });
    
    setIsEditingDetalle(false);
    setEditingDetalleId(null);
    setDetalleFormError(null);
    setShowDetalleModal(true);
  };
  
  // Mostrar modal para editar detalle
  const handleEditDetalle = (detalle) => {
    setDetalleForm({
      descripcion: detalle.descripcion || '',
      responsable: detalle.responsable || '',
      fkequipo: detalle.fkequipo || '',
      fecha_inicio: detalle.fecha_inicio ? format(new Date(detalle.fecha_inicio), 'yyyy-MM-dd') : '',
      fecha_fin: detalle.fecha_fin ? format(new Date(detalle.fecha_fin), 'yyyy-MM-dd') : '',
      estatus: detalle.estatus || 'PENDIENTE'
    });
    
    setIsEditingDetalle(true);
    setEditingDetalleId(detalle.iddetalletarea);
    setDetalleFormError(null);
    setShowDetalleModal(true);
  };
  
  // Guardar detalle (crear o actualizar)
  const handleSaveDetalle = async () => {
    // Validar formulario
    if (!detalleForm.descripcion || !detalleForm.responsable || !detalleForm.fecha_inicio) {
      setDetalleFormError('Por favor complete todos los campos obligatorios (descripción, responsable y fecha de inicio)');
      return;
    }
    
    try {
      setSavingDetalle(true);
      
      // Crear o actualizar detalle
      if (isEditingDetalle) {
        // Actualizar detalle existente
        await updateDetalle(editingDetalleId, detalleForm);
      } else {
        // Crear nuevo detalle
        await createDetalle(editingTareaId, detalleForm);
      }
      
      // Recargar detalles
      const detallesResponse = await getDetallesByTareaId(editingTareaId);
      setDetalles(detallesResponse.detalles || []);
      
      // Cerrar modal
      setShowDetalleModal(false);
      setDetalleFormError(null);
    } catch (err) {
      console.error('Error al guardar detalle:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setDetalleFormError(err.response.data.message);
      } else {
        setDetalleFormError('Error al guardar el detalle. Intente nuevamente.');
      }
    } finally {
      setSavingDetalle(false);
    }
  };
  
  // Actualizar estatus de detalle
  const handleUpdateDetalleStatus = async (id, newStatus) => {
    try {
      // Si el estatus es FINALIZADA y no tiene fecha_fin, usamos la fecha actual
      let fecha_fin = null;
      if (newStatus === 'FINALIZADA') {
        const detalle = detalles.find(d => d.iddetalletarea === id);
        if (!detalle.fecha_fin) {
          fecha_fin = format(new Date(), 'yyyy-MM-dd');
        }
      }
      
      await updateDetalleStatus(id, newStatus, fecha_fin);
      
      // Recargar detalles
      const detallesResponse = await getDetallesByTareaId(editingTareaId);
      setDetalles(detallesResponse.detalles || []);
    } catch (err) {
      console.error(`Error al actualizar estatus de detalle ${id}:`, err);
      setError('No se pudo actualizar el estatus del detalle');
    }
  };
  
  // Función para obtener texto de estatus
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDIENTE':
        return <CBadge color="info">Pendiente</CBadge>;
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
  
  // Función para obtener badge de tipo de tarea
  const getTipoTareaBadge = (tipo) => {
    switch (tipo) {
      case 'NORMAL':
        return <CBadge color="primary">Normal</CBadge>;
      case 'URGENTE':
        return <CBadge color="danger">Urgente</CBadge>;
      case 'PREVENTIVA':
        return <CBadge color="success">Preventiva</CBadge>;
      case 'CORRECTIVA':
        return <CBadge color="warning">Correctiva</CBadge>;
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
  
  // Función para preparar datos del gráfico Gantt
  const prepareGanttData = () => {
    const data = [
      [
        { type: 'string', label: 'ID Detalle' },
        { type: 'string', label: 'Descripción' },
        { type: 'string', label: 'Estado' },
        { type: 'date', label: 'Inicio' },
        { type: 'date', label: 'Fin' },
        { type: 'number', label: 'Duración' },
        { type: 'number', label: 'Porcentaje' },
        { type: 'string', label: 'Dependencias' }
      ]
    ];
    
    // Asegurarnos de que los detalles estén ordenados por fecha
    const sortedDetalles = [...detalles].sort((a, b) => {
      return new Date(a.fecha_inicio) - new Date(b.fecha_inicio);
    });
    
    sortedDetalles.forEach(detalle => {
      // Determinar fechas
      const startDate = detalle.fecha_inicio ? new Date(detalle.fecha_inicio) : new Date();
      
      // Para la fecha de fin, usar la fecha_fin si existe, o calcular una fecha estimada
      let endDate;
      if (detalle.fecha_fin) {
        endDate = new Date(detalle.fecha_fin);
      } else {
        // Si no hay fecha de fin, estimamos 3 días desde la fecha de inicio
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 3);
      }
      
      // Calcular porcentaje según el estado
      let percent = 0;
      switch (detalle.estatus) {
        case 'PENDIENTE':
          percent = 0;
          break;
        case 'EN_PROCESO':
          percent = 50;
          break;
        case 'FINALIZADA':
          percent = 100;
          break;
        case 'CANCELADA':
          percent = 0; // Las canceladas se muestran como no iniciadas
          break;
        default:
          percent = 0;
      }
      
      // Calcular duración en días
      const duration = differenceInDays(endDate, startDate) || 1; // Mínimo 1 día
      
      // Agregar fila al gráfico
      data.push([
        `${detalle.iddetalletarea}`,
        `${detalle.descripcion} (${detalle.responsable})`,
        detalle.estatus,
        startDate,
        endDate,
        duration,
        percent,
        null // Sin dependencias
      ]);
    });
    
    return data;
  };
  
  // Opciones para el gráfico Gantt
  const ganttOptions = {
    height: 400,
    gantt: {
      trackHeight: 30,
      criticalPathEnabled: false,
      percentEnabled: true,
      barCornerRadius: 5,
      shadowEnabled: true,
      arrow: {
        angle: 60,
        width: 2,
        color: '#ccc',
        radius: 0
      },
      palette: [
        {
          color: '#5D5CDE', // Color para tareas pendientes
          dark: '#4A49BD',
          light: '#8887E7'
        },
        {
          color: '#ffa726', // Color para tareas en proceso
          dark: '#f57c00',
          light: '#ffcc80'
        },
        {
          color: '#66bb6a', // Color para tareas finalizadas
          dark: '#43a047',
          light: '#a5d6a7'
        },
        {
          color: '#ef5350', // Color para tareas canceladas
          dark: '#e53935',
          light: '#ef9a9a'
        }
      ]
    }
  };

  return (
    <div>
      {/* Lista de Tareas */}
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0">
                    <CIcon icon={cilList} className="me-2" />
                    Gestión de Actividades
                  </h4>
                </div>
                <div>
                  <CButton 
                    color="primary" 
                    className="me-2"
                    onClick={handleNewTarea}
                  >
                    <CIcon icon={cilPlus} className="me-2" />
                    Nueva Tarea
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
                  <CCol md={6}>
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
                  
                  <CCol md={6}>
                    <CFormLabel>Tipo de Tarea</CFormLabel>
                    <CFormSelect
                      name="tipo_tarea"
                      value={filters.tipo_tarea}
                      onChange={handleFilterChange}
                    >
                      <option value="">Todos</option>
                      <option value="NORMAL">Normal</option>
                      <option value="URGENTE">Urgente</option>
                      <option value="PREVENTIVA">Preventiva</option>
                      <option value="CORRECTIVA">Correctiva</option>
                    </CFormSelect>
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
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROCESO">En Proceso</option>
                      <option value="FINALIZADA">Finalizada</option>
                      <option value="CANCELADA">Cancelada</option>
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
                  <p className="mt-2">Cargando tareas...</p>
                </div>
              ) : (
                <>
                  <CTable hover responsive className="mb-4">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell style={{ minWidth: '300px' }}>Descripción</CTableHeaderCell>
                        <CTableHeaderCell>Tipo</CTableHeaderCell>
                        <CTableHeaderCell>Área</CTableHeaderCell>
                        <CTableHeaderCell>Estatus</CTableHeaderCell>
                        <CTableHeaderCell>Fecha Registro</CTableHeaderCell>
                        <CTableHeaderCell>Registrado por</CTableHeaderCell>
                        <CTableHeaderCell>Detalles</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {tareas.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={7} className="text-center">
                            No se encontraron tareas
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        tareas.map(tarea => (
                          <CTableRow key={tarea.idtarea} className={tarea.tipo_tarea === 'URGENTE' ? 'table-danger' : ''}>
                            <CTableDataCell>
                              <div className="text-truncate" style={{ maxWidth: '300px' }}>
                                {tarea.descripcion}
                              </div>
                            </CTableDataCell>
                            <CTableDataCell>{getTipoTareaBadge(tarea.tipo_tarea)}</CTableDataCell>
                            <CTableDataCell>{tarea.nombre_area}</CTableDataCell>
                            <CTableDataCell>{getStatusBadge(tarea.estatus)}</CTableDataCell>
                            <CTableDataCell>{formatDate(tarea.fecha_registrado)}</CTableDataCell>
                            <CTableDataCell>{tarea.nombre_usuario || tarea.login_registrado}</CTableDataCell>
                            <CTableDataCell>
                              {tarea.detalles_count > 0 ? (
                                <CBadge color="info" shape="rounded-pill">
                                  {tarea.detalles_count} detalle(s)
                                </CBadge>
                              ) : (
                                <CBadge color="light" shape="rounded-pill" className="text-dark">
                                  Sin detalles
                                </CBadge>
                              )}
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                              <CTooltip content="Ver detalles">
                                <CButton
                                  color="primary"
                                  size="sm"
                                  variant="outline"
                                  className="me-1"
                                  onClick={() => handleViewTareaDetails(tarea.idtarea)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#detailsModal"
                                >
                                  <CIcon icon={cilInfo} />
                                </CButton>
                              </CTooltip>
                              
                              <CTooltip content="Editar tarea">
                                <CButton
                                  color="warning"
                                  size="sm"
                                  variant="outline"
                                  className="me-1"
                                  onClick={() => handleEditTarea(tarea.idtarea)}
                                >
                                  <CIcon icon={cilPencil} />
                                </CButton>
                              </CTooltip>
                              
                              {tarea.estatus === 'PENDIENTE' && (
                                <CTooltip content="Iniciar proceso">
                                  <CButton
                                    color="info"
                                    size="sm"
                                    variant="outline"
                                    className="me-1"
                                    onClick={() => handleUpdateTareaStatus(tarea.idtarea, 'EN_PROCESO')}
                                  >
                                    <CIcon icon={cilClock} />
                                  </CButton>
                                </CTooltip>
                              )}
                              
                              {tarea.estatus === 'EN_PROCESO' && (
                                <CTooltip content="Finalizar">
                                  <CButton
                                    color="success"
                                    size="sm"
                                    variant="outline"
                                    className="me-1"
                                    onClick={() => handleUpdateTareaStatus(tarea.idtarea, 'FINALIZADA')}
                                  >
                                    <CIcon icon={cilCheck} />
                                  </CButton>
                                </CTooltip>
                              )}
                              
                              {(tarea.estatus === 'PENDIENTE' || tarea.estatus === 'EN_PROCESO') && (
                                <CTooltip content="Cancelar">
                                  <CButton
                                    color="danger"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateTareaStatus(tarea.idtarea, 'CANCELADA')}
                                  >
                                    <CIcon icon={cilBan} />
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
                    Mostrando {tareas.length} de {totalItems} tareas
                  </div>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      
      {/* Modal de detalles de tarea */}
      <CModal 
        visible={editingTareaId !== null} 
        onClose={() => setEditingTareaId(null)}
        size="xl"
        id="detailsModal"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilInfo} className="me-2" />
            Detalles de Tarea
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingDetalles ? (
            <div className="text-center my-3">
              <CSpinner color="primary" />
              <p>Cargando detalles...</p>
            </div>
          ) : (
            <>
              <CCard className="mb-4">
                <CCardHeader className="bg-light">
                  <h5 className="mb-0">
                    <CIcon icon={cilList} className="me-2 text-primary" />
                    Información de la Tarea
                  </h5>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol md={6}>
                      <p><strong>Descripción:</strong> {tareaForm.descripcion}</p>
                      <p><strong>Tipo:</strong> {getTipoTareaBadge(tareaForm.tipo_tarea)}</p>
                    </CCol>
                    <CCol md={6}>
                      <p><strong>Estatus:</strong> {getStatusBadge(tareaForm.estatus)}</p>
                      <div>
                        {tareaForm.estatus === 'PENDIENTE' && (
                          <CButton
                            color="info"
                            size="sm"
                            className="me-2 mt-2"
                            onClick={() => handleUpdateTareaStatus(editingTareaId, 'EN_PROCESO')}
                          >
                            <CIcon icon={cilClock} className="me-1" />
                            Iniciar Proceso
                          </CButton>
                        )}
                        
                        {tareaForm.estatus === 'EN_PROCESO' && (
                          <CButton
                            color="success"
                            size="sm"
                            className="me-2 mt-2"
                            onClick={() => handleUpdateTareaStatus(editingTareaId, 'FINALIZADA')}
                          >
                            <CIcon icon={cilCheck} className="me-1" />
                            Finalizar
                          </CButton>
                        )}
                        
                        {(tareaForm.estatus === 'PENDIENTE' || tareaForm.estatus === 'EN_PROCESO') && (
                          <CButton
                            color="danger"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleUpdateTareaStatus(editingTareaId, 'CANCELADA')}
                          >
                            <CIcon icon={cilBan} className="me-1" />
                            Cancelar
                          </CButton>
                        )}
                      </div>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
              
              <CNav variant="tabs" role="tablist" className="mb-3">
                <CNavItem>
                  <CNavLink
                    active={activeTab === 1}
                    onClick={() => setActiveTab(1)}
                  >
                    <CIcon icon={cilList} className="me-2" />
                    Detalles
                  </CNavLink>
                </CNavItem>
                <CNavItem>
                  <CNavLink
                    active={activeTab === 2}
                    onClick={() => setActiveTab(2)}
                  >
                    <CIcon icon={cilChart} className="me-2" />
                    Gráfico Gantt
                  </CNavLink>
                </CNavItem>
              </CNav>
              
              <CTabContent>
                <CTabPane visible={activeTab === 1}>
                {(tareaForm && userData && tareaForm.fkarea === userData.fkarea) && (
                    <div className="mb-3 d-flex justify-content-end">
                      <CButton
                        color="primary"
                        onClick={handleNewDetalle}
                      >
                        <CIcon icon={cilPlus} className="me-2" />
                        Agregar Detalle
                      </CButton>
                    </div>
                )}  
                  <CTable responsive hover>
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell>Descripción</CTableHeaderCell>
                        <CTableHeaderCell>Responsable</CTableHeaderCell>
                        <CTableHeaderCell>Equipo</CTableHeaderCell>
                        <CTableHeaderCell>Fecha Inicio</CTableHeaderCell>
                        <CTableHeaderCell>Fecha Fin</CTableHeaderCell>
                        <CTableHeaderCell>Estatus</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {detalles.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={7} className="text-center">
                            No hay detalles registrados para esta tarea
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        detalles.map(detalle => (
                          <CTableRow key={detalle.iddetalletarea}>
                            <CTableDataCell>
                              <div className="text-truncate" style={{ maxWidth: '200px' }}>
                                {detalle.descripcion}
                              </div>
                            </CTableDataCell>
                            <CTableDataCell>{detalle.responsable}</CTableDataCell>
                            <CTableDataCell>{detalle.nombre_equipo || '-'}</CTableDataCell>
                            <CTableDataCell>{formatDate(detalle.fecha_inicio)}</CTableDataCell>
                            <CTableDataCell>{formatDate(detalle.fecha_fin) || '-'}</CTableDataCell>
                            <CTableDataCell>{getStatusBadge(detalle.estatus)}</CTableDataCell>
                            <CTableDataCell className="text-center">
                              <CTooltip content="Editar detalle">
                                <CButton
                                  color="warning"
                                  size="sm"
                                  variant="outline"
                                  className="me-1"
                                  onClick={() => handleEditDetalle(detalle)}
                                >
                                  <CIcon icon={cilPencil} />
                                </CButton>
                              </CTooltip>
                              
                              {detalle.estatus === 'PENDIENTE' && (
                                <CTooltip content="Iniciar proceso">
                                  <CButton
                                    color="info"
                                    size="sm"
                                    variant="outline"
                                    className="me-1"
                                    onClick={() => handleUpdateDetalleStatus(detalle.iddetalletarea, 'EN_PROCESO')}
                                  >
                                    <CIcon icon={cilClock} />
                                  </CButton>
                                </CTooltip>
                              )}
                              
                              {detalle.estatus === 'EN_PROCESO' && (
                                <CTooltip content="Finalizar">
                                  <CButton
                                    color="success"
                                    size="sm"
                                    variant="outline"
                                    className="me-1"
                                    onClick={() => handleUpdateDetalleStatus(detalle.iddetalletarea, 'FINALIZADA')}
                                  >
                                    <CIcon icon={cilCheck} />
                                  </CButton>
                                </CTooltip>
                              )}
                              
                              {(detalle.estatus === 'PENDIENTE' || detalle.estatus === 'EN_PROCESO') && (
                                <CTooltip content="Cancelar">
                                  <CButton
                                    color="danger"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUpdateDetalleStatus(detalle.iddetalletarea, 'CANCELADA')}
                                  >
                                    <CIcon icon={cilBan} />
                                  </CButton>
                                </CTooltip>
                              )}
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      )}
                    </CTableBody>
                  </CTable>
                </CTabPane>
                
                <CTabPane visible={activeTab === 2}>
                  {detalles.length === 0 ? (
                    <CAlert color="info">
                      No hay detalles disponibles para mostrar en el gráfico Gantt.
                    </CAlert>
                  ) : (
                    <CCard>
                      <CCardHeader className="bg-light">
                        <h5 className="mb-0">
                          <CIcon icon={cilChart} className="me-2 text-primary" />
                          Cronograma de Tareas
                        </h5>
                      </CCardHeader>
                      <CCardBody>
                        <div className="mb-3">
                          <div className="d-flex mb-2">
                            <div className="me-3">
                              <span className="badge bg-info">&nbsp;</span> Pendiente
                            </div>
                            <div className="me-3">
                              <span className="badge bg-warning">&nbsp;</span> En Proceso
                            </div>
                            <div className="me-3">
                              <span className="badge bg-success">&nbsp;</span> Finalizada
                            </div>
                            <div>
                              <span className="badge bg-danger">&nbsp;</span> Cancelada
                            </div>
                          </div>
                        </div>
                        
                        <Chart
                          chartType="Gantt"
                          width="100%"
                          height="400px"
                          data={prepareGanttData()}
                          options={ganttOptions}
                        />
                      </CCardBody>
                    </CCard>
                  )}
                </CTabPane>
              </CTabContent>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setEditingTareaId(null)}
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
      
      {/* Modal para crear/editar tarea */}
      <CModal 
        visible={showTareaModal} 
        onClose={() => setShowTareaModal(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? (
              <>
                <CIcon icon={cilPencil} className="me-2" />
                Editar Tarea
              </>
            ) : (
              <>
                <CIcon icon={cilList} className="me-2" />
                Nueva Tarea
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
                value={tareaForm.descripcion}
                onChange={(e) => setTareaForm({...tareaForm, descripcion: e.target.value})}
                rows={3}
                placeholder="Descripción detallada de la tarea..."
                required
              />
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Tipo de Tarea *</CFormLabel>
              <CFormSelect
                name="tipo_tarea"
                value={tareaForm.tipo_tarea}
                onChange={(e) => setTareaForm({...tareaForm, tipo_tarea: e.target.value})}
                required
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente</option>
                <option value="PREVENTIVA">Preventiva</option>
                <option value="CORRECTIVA">Correctiva</option>
              </CFormSelect>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Estatus *</CFormLabel>
              <CFormSelect
                name="estatus"
                value={tareaForm.estatus}
                onChange={(e) => setTareaForm({...tareaForm, estatus: e.target.value})}
                required
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="CANCELADA">Cancelada</option>
              </CFormSelect>
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowTareaModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveTarea}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditMode ? 'Actualizar Tarea' : 'Crear Tarea'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
      
      {/* Modal para crear/editar detalle de tarea */}
      <CModal 
        visible={showDetalleModal} 
        onClose={() => setShowDetalleModal(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditingDetalle ? (
              <>
                <CIcon icon={cilPencil} className="me-2" />
                Editar Detalle de Tarea
              </>
            ) : (
              <>
                <CIcon icon={cilPlus} className="me-2" />
                Nuevo Detalle de Tarea
              </>
            )}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {detalleFormError && (
            <CAlert color="danger" className="mb-3">
              {detalleFormError}
            </CAlert>
          )}
          
          <CForm className="row g-3">
            <CCol md={12}>
              <CFormLabel>Descripción *</CFormLabel>
              <CFormTextarea
                name="descripcion"
                value={detalleForm.descripcion}
                onChange={(e) => setDetalleForm({...detalleForm, descripcion: e.target.value})}
                rows={2}
                placeholder="Descripción detallada de la actividad..."
                required
              />
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Responsable *</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilUser} />
                </CInputGroupText>
                <CFormInput
                  name="responsable"
                  value={detalleForm.responsable}
                  onChange={(e) => setDetalleForm({...detalleForm, responsable: e.target.value})}
                  placeholder="Persona responsable"
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Equipo</CFormLabel>
              <CFormSelect
                name="fkequipo"
                value={detalleForm.fkequipo}
                onChange={(e) => setDetalleForm({...detalleForm, fkequipo: e.target.value})}
              >
                <option value="">Sin equipo</option>
                {equipos.map(equipo => (
                  <option key={equipo.idequipo} value={equipo.idequipo}>
                    {equipo.nombreequipo}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Fecha Inicio *</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
                <CFormInput
                  type="date"
                  name="fecha_inicio"
                  value={detalleForm.fecha_inicio}
                  onChange={(e) => setDetalleForm({...detalleForm, fecha_inicio: e.target.value})}
                  required
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Fecha Fin</CFormLabel>
              <CInputGroup>
                <CInputGroupText>
                  <CIcon icon={cilCalendar} />
                </CInputGroupText>
                <CFormInput
                  type="date"
                  name="fecha_fin"
                  value={detalleForm.fecha_fin}
                  onChange={(e) => setDetalleForm({...detalleForm, fecha_fin: e.target.value})}
                />
              </CInputGroup>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Estatus *</CFormLabel>
              <CFormSelect
                name="estatus"
                value={detalleForm.estatus}
                onChange={(e) => setDetalleForm({...detalleForm, estatus: e.target.value})}
                required
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="CANCELADA">Cancelada</option>
              </CFormSelect>
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowDetalleModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveDetalle}
            disabled={savingDetalle}
          >
            {savingDetalle ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditingDetalle ? 'Actualizar Detalle' : 'Crear Detalle'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default Tareas;