import React, { useState, useEffect, useCallback } from 'react';
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
  CTabPane
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPeople,
  cilPlus,
  cilSearch,
  cilFilter,
  cilPencil,
  cilTrash,
  cilCalendar,
  cilClock,
  cilLocationPin,
  cilBriefcase,
  cilBell,
  cilEnvelopeOpen,
  cilClipboard,
  cilUserPlus,
  cilCheck,
  cilX, 
  cilCheckAlt, cilUser
} from '@coreui/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar servicios
import { 
  getReuniones, 
  getReunionById, 
  createReunion, 
  updateReunion, 
  deleteReunion
} from '../../../services/reuniones.service';
import { 
  getMinutasByReunion, 
  createMinuta, 
  updateMinuta, 
  deleteMinuta 
} from '../../../services/minutas.service';
import { 
  getIntegrantesByReunion, 
  createIntegrante, 
  deleteIntegrante, 
  searchIntegrantes,
  updateIntegrante
} from '../../../services/integrantes.service';
import { sendReunionNotification } from '../../../services/notificaciones.service';
import { getAreas } from '../../../services/areas.service';

const Reuniones = () => {
  //const navigate = useNavigate();
  
  // Estados para la lista de reuniones
  const [reuniones, setReuniones] = useState([]);
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
    tema: '',
    fecha_inicio: '',
    fecha_fin: '',
    estatus: '',
    tipo: '',
    fkarea: ''
  });
  
  // Estados para las áreas (para el select de filtros)
  const [areas, setAreas] = useState([]);
  
  // Estado para el modal de reunión
  const [showReunionModal, setShowReunionModal] = useState(false);
  const [reunionForm, setReunionForm] = useState({
    tema: '',
    fkarea: '',
    fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: format(new Date(), 'HH:mm'),
    fecha_fin: format(new Date(), 'yyyy-MM-dd'),
    hora_fin: format(new Date(), 'HH:mm'),
    estatus: 'PROGRAMADA',
    lugar: '',
    responsable: '',
    tipo: 'NORMAL'
  });
  const [activeTab, setActiveTab] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingReunionId, setEditingReunionId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Estados para minutas
  const [minutas, setMinutas] = useState([]);
  const [loadingMinutas, setLoadingMinutas] = useState(false);
  const [minutaForm, setMinutaForm] = useState({
    descripcionminuta: '',
    responsable: ''
  });
  const [editingMinutaId, setEditingMinutaId] = useState(null);
  
  // Estados para integrantes
  const [integrantes, setIntegrantes] = useState([]);
  const [loadingIntegrantes, setLoadingIntegrantes] = useState(false);
  const [integranteForm, setIntegranteForm] = useState({
    nombres_apellidos_integrante: '',
    emailintegrante: '',
    asistio: null
  });

  // Estado para la edición de un integrante específico
  const [editingIntegrante, setEditingIntegrante] = useState(null);
  const [showEditIntegranteModal, setShowEditIntegranteModal] = useState(false);

  // Añadir estado para edición de integrantes
  /*const [editingIntegranteId, setEditingIntegranteId] = useState(null);
  const [integranteEditForm, setIntegranteEditForm] = useState({
    nombres_apellidos_integrante: '',
    emailintegrante: '',
    asistio: null
  });*/

  // Estado para modal de registro de asistencia
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isManualIntegrante, setIsManualIntegrante] = useState(false);
  
  // Estado para modal de notificaciones
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationReunion, setNotificationReunion] = useState(null);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState({ success: false, message: '' });

  // Iniciar edición de integrante
  const handleEditIntegranteStart = (integrante) => {
    setEditingIntegrante(integrante);
    setShowEditIntegranteModal(true);
  };

  // Guardar cambios de integrante
  const handleEditIntegranteSave = () => {
    if (!editingIntegrante) return;
    
    const updatedIntegrantes = integrantes.map(integrante => {
      if ((integrante.idintegrantereunion && integrante.idintegrantereunion === editingIntegrante.idintegrantereunion) || 
          (!integrante.idintegrantereunion && integrante.tempId === editingIntegrante.tempId)) {
        return {
          ...integrante,
          asistio: editingIntegrante.asistio,
          isEdited: true
        };
      }
      return integrante;
    });
    
    setIntegrantes(updatedIntegrantes);
    setShowEditIntegranteModal(false);
    setEditingIntegrante(null);
  };
  
  // Función para cargar reuniones
  const loadReuniones = useCallback(async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true);
      const response = await getReuniones(page, itemsPerPage, filtersObj);
      
      setReuniones(response.reuniones || []);
      if (response.pagination) {
        setTotalItems(response.pagination.total || 0);
        setTotalPages(Math.ceil((response.pagination.total || 0) / itemsPerPage));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar reuniones:', err);
      setError('No se pudieron cargar las reuniones. Intente nuevamente.');
      setReuniones([]);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]); 
  
  // Función para cargar áreas
  const loadAreas = useCallback(async () => {
    try {
      const response = await getAreas(localStorage.getItem('token'));
      
      setAreas(response.areas || []);
    } catch (err) {
      console.error('Error al cargar áreas:', err);
    }
  }, []);
  
  // Cargar reuniones y áreas al iniciar
  useEffect(() => {
    loadReuniones(activePage);
    loadAreas();
  }, [activePage, loadReuniones, loadAreas]);
  
  // Función para manejar cambio de página
  const handlePageChange = (page) => {
    setActivePage(page);
  };
  
  // Función para aplicar filtros
  const applyFilters = () => {
    setActivePage(1);
    loadReuniones(1, filters);
  };
  
  // Función para resetear filtros
  const resetFilters = () => {
    const emptyFilters = {
      tema: '',
      fecha_inicio: '',
      fecha_fin: '',
      estatus: '',
      tipo: '',
      fkarea: ''
    };
    setFilters(emptyFilters);
    setActivePage(1);
    loadReuniones(1, emptyFilters);
  };
  
  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // FUNCIONES PARA GESTIÓN DE REUNIONES
  
  // Mostrar modal para nueva reunión
  const handleNewReunion = () => {
    setReunionForm({
      tema: '',
      fkarea: '',
      fecha_inicio: format(new Date(), 'yyyy-MM-dd'),
      hora_inicio: format(new Date(), 'HH:mm'),
      fecha_fin: format(new Date(), 'yyyy-MM-dd'),
      hora_fin: format(new Date(), 'HH:mm'),
      estatus: 'PROGRAMADA',
      lugar: '',
      responsable: '',
      tipo: 'NORMAL'
    });
    setMinutas([]);
    setIntegrantes([]);
    setActiveTab(1);
    setIsEditMode(false);
    setEditingReunionId(null);
    setFormError(null);
    setShowReunionModal(true);
  };
  
  // Mostrar modal para editar reunión
  const handleEditReunion = async (id) => {
    try {
      setLoading(true);
      const response = await getReunionById(id);
      const reunion = response.reunion;
      
      if (!reunion) {
        throw new Error('No se pudo obtener la información de la reunión');
      }
      
      // Formatear fechas para el formulario
      setReunionForm({
        tema: reunion.tema || '',
        fkarea: reunion.fkarea || '',
        fecha_inicio: reunion.fecha_inicio ? format(new Date(reunion.fecha_inicio), 'yyyy-MM-dd') : '',
        hora_inicio: reunion.hora_inicio || '',
        fecha_fin: reunion.fecha_fin ? format(new Date(reunion.fecha_fin), 'yyyy-MM-dd') : '',
        hora_fin: reunion.horafin || '',
        estatus: reunion.estatus || 'PROGRAMADA',
        lugar: reunion.lugar || '',
        responsable: reunion.responsable || '',
        tipo: reunion.tipo || 'NORMAL'
      });
      
      // Cargar minutas de la reunión
      await loadMinutas(id);
      
      // Cargar integrantes de la reunión
      await loadIntegrantes(id);
      
      setActiveTab(1);
      setIsEditMode(true);
      setEditingReunionId(id);
      setFormError(null);
      setShowReunionModal(true);
    } catch (err) {
      console.error(`Error al cargar reunión ${id}:`, err);
      setError('No se pudo cargar la información de la reunión');
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar minutas de una reunión
  const loadMinutas = async (reunionId) => {
    try {
      setLoadingMinutas(true);
      const response = await getMinutasByReunion(reunionId);
      setMinutas(response.minutas || []);
    } catch (err) {
      console.error(`Error al cargar minutas de la reunión ${reunionId}:`, err);
    } finally {
      setLoadingMinutas(false);
    }
  };
  
  // Cargar integrantes de una reunión
  const loadIntegrantes = async (reunionId) => {
    try {
      setLoadingIntegrantes(true);
      const response = await getIntegrantesByReunion(reunionId);
      
      setIntegrantes(response.integrantes || []);
    } catch (err) {
      console.error(`Error al cargar integrantes de la reunión ${reunionId}:`, err);
    } finally {
      setLoadingIntegrantes(false);
    }
  };
  
  // Guardar reunión (crear o actualizar)
  const handleSaveReunion = async () => {
    // Validar formulario
    if (!reunionForm.tema || !reunionForm.fecha_inicio || !reunionForm.hora_inicio) {
      setFormError('Por favor complete todos los campos obligatorios (tema, fecha y hora de inicio)');
      return;
    }
    
    // Validar que haya al menos dos integrantes
    if (integrantes.length < 2) {
      setFormError('La reunión debe tener al menos dos integrantes');
      setActiveTab(3); // Cambiar a la pestaña de integrantes
      return;
    }
    
    try {
      setSaving(true);
      
      const reunionData = {
        ...reunionForm,
        fkarea: reunionForm.fkarea ? parseInt(reunionForm.fkarea) : null
      };
      
      // Crear o actualizar reunión
      let savedReunion;
      if (isEditMode) {
        // Actualizar reunión existente
        const response = await updateReunion(editingReunionId, reunionData);
        savedReunion = response.reunion;
      } else {
        // Crear nueva reunión
        const response = await createReunion(reunionData);
        savedReunion = response.reunion;
      }
      
      const reunionId = savedReunion.idreunion || editingReunionId;
      
      // Procesar minutas (solo si estamos editando)
      if (isEditMode) {
        // Procesar cada minuta: Crear nuevas, actualizar existentes
        for (const minuta of minutas) {
          if (minuta.isNew) {
            // Nueva minuta
            await createMinuta({
              fkreunion: reunionId,
              descripcionminuta: minuta.descripcionminuta,
              responsable: minuta.responsable
            });
          } else if (minuta.isEdited && !minuta.isDeleted) {
            // Minuta editada
            await updateMinuta(minuta.idminuta, {
              descripcionminuta: minuta.descripcionminuta,
              responsable: minuta.responsable
            });
          } else if (minuta.isDeleted) {
            // Minuta eliminada
            await deleteMinuta(minuta.idminuta);
          }
        }
      } else {
        // Si es una nueva reunión, crear todas las minutas
        for (const minuta of minutas) {
          await createMinuta({
            fkreunion: reunionId,
            descripcionminuta: minuta.descripcionminuta,
            responsable: minuta.responsable
          });
        }
      }
      
      // Procesar integrantes
      if (isEditMode) {
        // Para edición, actualizar los integrantes existentes y crear los nuevos
        for (const integrante of integrantes) {
          if (integrante.isNew) {
            // Nuevo integrante
            await createIntegrante({
              fkreunion: reunionId,
              nombres_apellidos_integrante: integrante.nombres_apellidos_integrante,
              emailintegrante: integrante.emailintegrante,
              asistio: integrante.asistio  // Puede ser null
            });
          } else if (integrante.isEdited && !integrante.isDeleted) {
            // Integrante con asistencia actualizada
            await updateIntegrante(integrante.idintegrantereunion, {
              asistio: integrante.asistio,
              nombres_apellidos_integrante: integrante.nombres_apellidos_integrante,
              emailintegrante: integrante.emailintegrante,
              fkreunion: reunionId
            });
          } else if (integrante.isDeleted) {
            // Integrante eliminado
            await deleteIntegrante(integrante.idintegrantereunion);
          }
        }
      } else {
        // Si es una nueva reunión, crear todos los integrantes sin asistencia definida
        for (const integrante of integrantes) {
          await createIntegrante({
            fkreunion: reunionId,
            nombres_apellidos_integrante: integrante.nombres_apellidos_integrante,
            emailintegrante: integrante.emailintegrante,
            asistio: null  // Siempre null para nuevas reuniones
          });
        }
      }
      
      // Recargar lista de reuniones
      loadReuniones(activePage);
      
      // Cerrar modal
      setShowReunionModal(false);
      setFormError(null);
    } catch (err) {
      console.error('Error al guardar reunión:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('Error al guardar la reunión. Intente nuevamente.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Eliminar reunión
  const handleDeleteReunion = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta reunión?')) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteReunion(id);
      
      // Recargar lista de reuniones
      loadReuniones(activePage);
    } catch (err) {
      console.error(`Error al eliminar reunión ${id}:`, err);
      setError('No se pudo eliminar la reunión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // FUNCIONES PARA GESTIÓN DE MINUTAS
  
  // Agregar nueva minuta al estado local
  const handleAddMinuta = () => {
    if (!minutaForm.descripcionminuta) {
      return;
    }
    
    const newMinuta = {
      descripcionminuta: minutaForm.descripcionminuta,
      responsable: minutaForm.responsable,
      isNew: true, // Marcar como nueva para procesar después
      tempId: `temp-${Date.now()}` // ID temporal para referencias
    };
    
    setMinutas([...minutas, newMinuta]);
    setMinutaForm({ descripcionminuta: '', responsable: '' });
  };
  
  // Iniciar edición de minuta
  const handleEditMinutaStart = (minuta) => {
    setMinutaForm({
      descripcionminuta: minuta.descripcionminuta,
      responsable: minuta.responsable
    });
    setEditingMinutaId(minuta.idminuta || minuta.tempId);
  };
  
  // Guardar edición de minuta
  const handleEditMinutaSave = () => {
    if (!minutaForm.descripcionminuta) {
      return;
    }
    
    const updatedMinutas = minutas.map(minuta => {
      if ((minuta.idminuta && minuta.idminuta === editingMinutaId) || 
          (!minuta.idminuta && minuta.tempId === editingMinutaId)) {
        return {
          ...minuta,
          descripcionminuta: minutaForm.descripcionminuta,
          responsable: minutaForm.responsable,
          isEdited: true // Marcar como editada para procesar después
        };
      }
      return minuta;
    });
    
    setMinutas(updatedMinutas);
    setMinutaForm({ descripcionminuta: '', responsable: '' });
    setEditingMinutaId(null);
  };
  
  // Cancelar edición de minuta
  const handleEditMinutaCancel = () => {
    setMinutaForm({ descripcionminuta: '', responsable: '' });
    setEditingMinutaId(null);
  };
  
  // Marcar minuta para eliminar
  const handleDeleteMinuta = (minutaId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta minuta?')) {
      return;
    }
    
    const updatedMinutas = minutas.map(minuta => {
      if ((minuta.idminuta && minuta.idminuta === minutaId) || 
          (!minuta.idminuta && minuta.tempId === minutaId)) {
        return { ...minuta, isDeleted: true }; // Marcar como eliminada
      }
      return minuta;
    }).filter(minuta => 
      // Filtrar minutas temporales (sin ID) si están marcadas como eliminadas
      minuta.idminuta || (!minuta.idminuta && !minuta.isDeleted)
    );
    
    setMinutas(updatedMinutas);
  };
  
  // FUNCIONES PARA GESTIÓN DE INTEGRANTES
  
  // Buscar integrantes en la API externa
  const handleSearchIntegrantes = async () => {
    if (!searchTerm || searchTerm.length < 3) {
      return;
    }
    
    try {
      setLoadingSearch(true);
      const response = await searchIntegrantes(searchTerm);
      setSearchResults(response || []);
    } catch (err) {
      console.error('Error al buscar integrantes:', err);
    } finally {
      setLoadingSearch(false);
    }
  };
  
  // Agregar integrante desde la búsqueda
  const handleAddSearchedIntegrante = (integrante) => {
    // Verificar si ya existe este integrante
    const exists = integrantes.some(
      i => i.nombres_apellidos_integrante === integrante.nombres_apellidos ||
           i.emailintegrante === integrante.email
    );
    
    if (exists) {
      alert('Este integrante ya ha sido agregado a la reunión');
      return;
    }
    
    // Definir la asistencia solo si estamos editando una reunión que ya pasó
    const isAttendanceRequired = isEditMode && reunionForm.estatus !== 'PROGRAMADA';
    
    const newIntegrante = {
      nombres_apellidos_integrante: integrante.nombres_apellidos,
      emailintegrante: integrante.email,
      asistio: isAttendanceRequired ? false : null, // null por defecto, false si se requiere un valor
      isNew: true,
      tempId: `temp-${Date.now()}` // ID temporal para referencias
    };
    
    setIntegrantes([...integrantes, newIntegrante]);
    setSearchTerm('');
    setSearchResults([]);
  };
  
  // Agregar integrante manual
  const handleAddManualIntegrante = () => {
    if (!integranteForm.nombres_apellidos_integrante || !integranteForm.emailintegrante) {
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(integranteForm.emailintegrante)) {
      alert('Por favor ingrese un correo electrónico válido');
      return;
    }
    
    // Verificar si ya existe este integrante
    const exists = integrantes.some(
      i => i.nombres_apellidos_integrante === integranteForm.nombres_apellidos_integrante ||
           i.emailintegrante === integranteForm.emailintegrante
    );
    
    if (exists) {
      alert('Este integrante ya ha sido agregado a la reunión');
      return;
    }
    
    // Definir la asistencia solo si estamos editando una reunión que ya pasó
    const isAttendanceRequired = isEditMode && reunionForm.estatus !== 'PROGRAMADA';
    
    const newIntegrante = {
      nombres_apellidos_integrante: integranteForm.nombres_apellidos_integrante,
      emailintegrante: integranteForm.emailintegrante,
      asistio: isAttendanceRequired ? integranteForm.asistio : null,
      isNew: true,
      tempId: `temp-${Date.now()}`
    };
    
    setIntegrantes([...integrantes, newIntegrante]);
    setIntegranteForm({
      nombres_apellidos_integrante: '',
      emailintegrante: '',
      asistio: null
    });
    setIsManualIntegrante(false);
  };
  
  // Eliminar integrante
  const handleDeleteIntegrante = (integranteId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este integrante?')) {
      return;
    }
    
    const updatedIntegrantes = integrantes.map(integrante => {
      if ((integrante.idintegrantereunion && integrante.idintegrantereunion === integranteId) || 
          (!integrante.idintegrantereunion && integrante.tempId === integranteId)) {
        return { ...integrante, isDeleted: true }; // Marcar como eliminado
      }
      return integrante;
    }).filter(integrante => 
      // Filtrar integrantes temporales (sin ID) si están marcados como eliminados
      integrante.idintegrantereunion || (!integrante.idintegrantereunion && !integrante.isDeleted)
    );
    
    setIntegrantes(updatedIntegrantes);
  };
  
  // FUNCIONES PARA NOTIFICACIONES
  
  // Mostrar modal para enviar notificación
  const handleShowNotification = (reunion) => {
    setNotificationReunion(reunion);
    setNotificationStatus({ success: false, message: '' });
    setShowNotificationModal(true);
  };
  
  // Enviar notificación por correo
  const handleSendNotification = async () => {
    if (!notificationReunion) return;
    
    try {
      setSendingNotification(true);
      
      // Obtener integrantes de la reunión
      const integrantesResponse = await getIntegrantesByReunion(notificationReunion.idreunion);
      const integrantesReunion = integrantesResponse.integrantes || [];
      
      // Preparar datos para la notificación
      const notificationData = {
        reunionId: notificationReunion.idreunion,
        subject: `Reunión: ${notificationReunion.tema}`,
        recipients: integrantesReunion.map(i => i.emailintegrante).filter(Boolean),
        content: {
          tema: notificationReunion.tema,
          fecha: format(new Date(notificationReunion.fecha_inicio), 'dd/MM/yyyy', { locale: es }),
          hora: notificationReunion.hora_inicio,
          lugar: notificationReunion.lugar || 'Por definir',
          tipo: notificationReunion.tipo,
          responsable: notificationReunion.responsable || 'No especificado',
          integrantes: integrantesReunion.map(i => i.nombres_apellidos_integrante)
        }
      };
      
      // Enviar notificación
      await sendReunionNotification(notificationData);
      
      setNotificationStatus({ 
        success: true, 
        message: 'Notificación enviada exitosamente a los integrantes de la reunión'
      });
      
      // Opcional: cerrar modal después de un tiempo
      setTimeout(() => {
        setShowNotificationModal(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error al enviar notificación:', err);
      setNotificationStatus({ 
        success: false, 
        message: 'Error al enviar la notificación. Intente nuevamente.'
      });
    } finally {
      setSendingNotification(false);
    }
  };
  
  // Función para obtener texto de estatus
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PROGRAMADA':
        return <CBadge color="info">Programada</CBadge>;
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
  
  // Función para obtener texto de tipo
  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'URGENTE':
        return <CBadge color="danger">Urgente</CBadge>;
      case 'CRITICA':
        return <CBadge color="danger">Crítica</CBadge>;
      case 'DIARIA':
        return <CBadge color="info">Diaria</CBadge>;
      case 'SEMANAL':
        return <CBadge color="primary">Semanal</CBadge>;
      case 'MENSUAL':
        return <CBadge color="success">Mensual</CBadge>;
      case 'ANUAL':
        return <CBadge color="dark">Anual</CBadge>;
      case 'EXTRAORDINARIA':
        return <CBadge color="warning">Extraordinaria</CBadge>;
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
                  <CIcon icon={cilCalendar} className="me-2" />
                  Gestión de Reuniones
                </h4>
              </div>
              <div>
                <CButton 
                  color="primary" 
                  className="me-2"
                  onClick={handleNewReunion}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nueva Reunión
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
                  <CFormLabel>Tema</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilClipboard} />
                    </CInputGroupText>
                    <CFormInput
                      name="tema"
                      placeholder="Buscar por tema"
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
                
                <CCol md={4}>
                  <CFormLabel>Estatus</CFormLabel>
                  <CFormSelect
                    name="estatus"
                    value={filters.estatus}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="PROGRAMADA">Programada</option>
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
                    <option value="URGENTE">Urgente</option>
                    <option value="CRITICA">Crítica</option>
                    <option value="DIARIA">Diaria</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSUAL">Mensual</option>
                    <option value="ANUAL">Anual</option>
                    <option value="EXTRAORDINARIA">Extraordinaria</option>
                    <option value="NORMAL">Normal</option>
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
                <p className="mt-2">Cargando reuniones...</p>
              </div>
            ) : (
              <>
                <CTable hover responsive className="mb-4">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Tema</CTableHeaderCell>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell>Hora</CTableHeaderCell>
                      <CTableHeaderCell>Lugar</CTableHeaderCell>
                      <CTableHeaderCell>Tipo</CTableHeaderCell>
                      <CTableHeaderCell>Estatus</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {reuniones.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={7} className="text-center">
                          No se encontraron reuniones
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      reuniones.map(reunion => (
                        <CTableRow key={reunion.idreunion}>
                          <CTableDataCell>
                            <strong>{reunion.tema}</strong>
                          </CTableDataCell>
                          <CTableDataCell>{formatDate(reunion.fecha_inicio)}</CTableDataCell>
                          <CTableDataCell>{reunion.hora_inicio}</CTableDataCell>
                          <CTableDataCell>{reunion.lugar || '-'}</CTableDataCell>
                          <CTableDataCell>{getTipoBadge(reunion.tipo)}</CTableDataCell>
                          <CTableDataCell>{getStatusBadge(reunion.estatus)}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              color="primary"
                              size="sm"
                              variant="outline"
                              className="me-2"
                              onClick={() => handleEditReunion(reunion.idreunion)}
                            >
                              <CIcon icon={cilPencil} className="me-1" /> 
                              Editar
                            </CButton>
                            <CButton
                              color="success"
                              size="sm"
                              variant="outline"
                              className="me-2"
                              onClick={() => handleShowNotification(reunion)}
                            >
                              <CIcon icon={cilEnvelopeOpen} className="me-1" /> 
                              Notificar
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteReunion(reunion.idreunion)}
                            >
                              <CIcon icon={cilTrash} className="me-1" /> 
                              Eliminar
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
                  Mostrando {reuniones.length} de {totalItems} reuniones
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      {/* Modal para editar integrante individualmente */}
      <CModal 
        visible={showEditIntegranteModal} 
        onClose={() => setShowEditIntegranteModal(false)}
        size="md"
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilUser} className="me-2" />
            Editar Asistencia de Integrante
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {editingIntegrante && (
            <CForm>
              <div className="mb-3">
                <CFormLabel>Nombre del Integrante</CFormLabel>
                <CFormInput
                  value={editingIntegrante.nombres_apellidos_integrante}
                  readOnly
                />
              </div>
              
              <div className="mb-3">
                <CFormLabel>Correo Electrónico</CFormLabel>
                <CFormInput
                  value={editingIntegrante.emailintegrante}
                  readOnly
                />
              </div>
              
              <div className="mb-3">
                <CFormLabel>¿Asistió a la reunión?</CFormLabel>
                <CFormSelect
                  value={editingIntegrante.asistio === null ? '' : editingIntegrante.asistio.toString()}
                  onChange={(e) => setEditingIntegrante({
                    ...editingIntegrante,
                    asistio: e.target.value === '' ? null : e.target.value === 'true'
                  })}
                >
                  <option value="">Sin registrar</option>
                  <option value="true">Sí asistió</option>
                  <option value="false">No asistió</option>
                </CFormSelect>
              </div>
            </CForm>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowEditIntegranteModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleEditIntegranteSave}
          >
            Guardar Cambios
          </CButton>
        </CModalFooter>
      </CModal>
      
      {/* Modal para crear/editar reunión */}
      <CModal 
        visible={showReunionModal} 
        onClose={() => setShowReunionModal(false)}
        size="xl"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? (
              <>
                <CIcon icon={cilPencil} className="me-2" />
                Editar Reunión
              </>
            ) : (
              <>
                <CIcon icon={cilCalendar} className="me-2" />
                Nueva Reunión
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
                aria-controls="minutas-tab-pane"
                aria-selected={activeTab === 2}
                onClick={() => setActiveTab(2)}
              >
                Minutas
              </CNavLink>
            </CNavItem>
            <CNavItem role="presentation">
              <CNavLink
                active={activeTab === 3}
                component="button"
                role="tab"
                aria-controls="integrantes-tab-pane"
                aria-selected={activeTab === 3}
                onClick={() => setActiveTab(3)}
              >
                Integrantes
              </CNavLink>
            </CNavItem>
          </CNav>
          <CTabContent className="mt-4">
            {/* Pestaña de Información General */}
            <CTabPane role="tabpanel" aria-labelledby="info-tab-pane" visible={activeTab === 1}>
              <CForm className="row g-3">
                <CCol md={12}>
                  <CFormLabel>Tema de la Reunión *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilClipboard} />
                    </CInputGroupText>
                    <CFormInput
                      name="tema"
                      value={reunionForm.tema}
                      onChange={(e) => setReunionForm({...reunionForm, tema: e.target.value})}
                      required
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={6}>
                  <CFormLabel>Fecha de Inicio *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilCalendar} />
                    </CInputGroupText>
                    <CFormInput
                      type="date"
                      name="fecha_inicio"
                      value={reunionForm.fecha_inicio}
                      onChange={(e) => setReunionForm({...reunionForm, fecha_inicio: e.target.value})}
                      required
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={6}>
                  <CFormLabel>Hora de Inicio *</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilClock} />
                    </CInputGroupText>
                    <CFormInput
                      type="time"
                      name="hora_inicio"
                      value={reunionForm.hora_inicio}
                      onChange={(e) => setReunionForm({...reunionForm, hora_inicio: e.target.value})}
                      required
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={6}>
                  <CFormLabel>Fecha de Fin</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilCalendar} />
                    </CInputGroupText>
                    <CFormInput
                      type="date"
                      name="fecha_fin"
                      value={reunionForm.fecha_fin}
                      onChange={(e) => setReunionForm({...reunionForm, fecha_fin: e.target.value})}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={6}>
                  <CFormLabel>Hora de Fin</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilClock} />
                    </CInputGroupText>
                    <CFormInput
                      type="time"
                      name="hora_fin"
                      value={reunionForm.hora_fin}
                      onChange={(e) => setReunionForm({...reunionForm, hora_fin: e.target.value})}
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
                      value={reunionForm.lugar}
                      onChange={(e) => setReunionForm({...reunionForm, lugar: e.target.value})}
                      placeholder="Ubicación de la reunión"
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
                      value={reunionForm.fkarea}
                      onChange={(e) => setReunionForm({...reunionForm, fkarea: e.target.value})}
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
                  <CFormLabel>Tipo de Reunión *</CFormLabel>
                  <CFormSelect
                    name="tipo"
                    value={reunionForm.tipo}
                    onChange={(e) => setReunionForm({...reunionForm, tipo: e.target.value})}
                    required
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="URGENTE">Urgente</option>
                    <option value="CRITICA">Crítica</option>
                    <option value="DIARIA">Diaria</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSUAL">Mensual</option>
                    <option value="ANUAL">Anual</option>
                    <option value="EXTRAORDINARIA">Extraordinaria</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={6}>
                  <CFormLabel>Estatus *</CFormLabel>
                  <CFormSelect
                    name="estatus"
                    value={reunionForm.estatus}
                    onChange={(e) => setReunionForm({...reunionForm, estatus: e.target.value})}
                    required
                  >
                    <option value="PROGRAMADA">Programada</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="FINALIZADA">Finalizada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={12}>
                  <CFormLabel>Responsable</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilPeople} />
                    </CInputGroupText>
                    <CFormInput
                      name="responsable"
                      value={reunionForm.responsable}
                      onChange={(e) => setReunionForm({...reunionForm, responsable: e.target.value})}
                      placeholder="Persona responsable de la reunión"
                    />
                  </CInputGroup>
                </CCol>
              </CForm>
            </CTabPane>
            
            {/* Pestaña de Minutas */}
            <CTabPane role="tabpanel" aria-labelledby="minutas-tab-pane" visible={activeTab === 2}>
              <div className="mb-3">
                <h6>Agregar Minuta</h6>
                <CForm className="row g-3">
                  <CCol md={editingMinutaId ? 6 : 8}>
                    <CFormLabel>Descripción</CFormLabel>
                    <CFormInput
                      name="descripcionminuta"
                      value={minutaForm.descripcionminuta}
                      onChange={(e) => setMinutaForm({...minutaForm, descripcionminuta: e.target.value})}
                      placeholder="Descripción de la minuta"
                    />
                  </CCol>
                  
                  <CCol md={editingMinutaId ? 3 : 4}>
                    <CFormLabel>Responsable</CFormLabel>
                    <CFormInput
                      name="responsable"
                      value={minutaForm.responsable}
                      onChange={(e) => setMinutaForm({...minutaForm, responsable: e.target.value})}
                      placeholder="Responsable"
                    />
                  </CCol>
                  
                  {editingMinutaId ? (
                    <CCol md={3} className="d-flex align-items-end">
                      <CButton 
                        color="primary"
                        className="me-2"
                        onClick={handleEditMinutaSave}
                      >
                        <CIcon icon={cilCheck} className="me-1" />
                        Guardar
                      </CButton>
                      <CButton 
                        color="secondary"
                        onClick={handleEditMinutaCancel}
                      >
                        <CIcon icon={cilX} className="me-1" />
                        Cancelar
                      </CButton>
                    </CCol>
                  ) : (
                    <CCol md={12} className="d-flex align-items-end justify-content-end">
                      <CButton 
                        color="primary"
                        onClick={handleAddMinuta}
                        disabled={!minutaForm.descripcionminuta}
                      >
                        <CIcon icon={cilPlus} className="me-1" />
                        Agregar Minuta
                      </CButton>
                    </CCol>
                  )}
                </CForm>
              </div>
              
              <hr />
              
              <div className="mt-3">
                <h6>Minutas de la Reunión</h6>
                {loadingMinutas ? (
                  <div className="text-center my-3">
                    <CSpinner size="sm" />
                    <p>Cargando minutas...</p>
                  </div>
                ) : (
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Descripción</CTableHeaderCell>
                        <CTableHeaderCell>Responsable</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {minutas.filter(m => !m.isDeleted).length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={3} className="text-center">
                            No hay minutas registradas para esta reunión
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        minutas
                          .filter(m => !m.isDeleted)
                          .map((minuta, index) => (
                            <CTableRow key={minuta.idminuta || `temp-${index}`}>
                              <CTableDataCell>{minuta.descripcionminuta}</CTableDataCell>
                              <CTableDataCell>{minuta.responsable}</CTableDataCell>
                              <CTableDataCell className="text-center">
                                <CButton
                                  color="primary"
                                  size="sm"
                                  variant="outline"
                                  className="me-2"
                                  onClick={() => handleEditMinutaStart(minuta)}
                                >
                                  Editar
                                </CButton>
                                <CButton
                                  color="danger"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteMinuta(minuta.idminuta || minuta.tempId)}
                                >
                                  Eliminar
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))
                      )}
                    </CTableBody>
                  </CTable>
                )}
              </div>
            </CTabPane>
            
            {/* Pestaña de Integrantes */}
            <CTabPane role="tabpanel" aria-labelledby="integrantes-tab-pane" visible={activeTab === 3}>
              <div className="mb-3">
                <h5>Agregar Integrantes</h5>
                <CRow className="mb-3">
                  <CCol md={8}>
                    {isEditMode && reunionForm.estatus !== 'PROGRAMADA' && integrantes.filter(i => !i.isDeleted).length > 0 && (
                      <div className="mb-3">
                        <CButton 
                          color="primary"
                          onClick={() => setShowAttendanceModal(true)}
                        >
                          <CIcon icon={cilCheckAlt} className="me-2" />
                          Registrar Asistencia
                        </CButton>
                      </div>
                    )}
                    <CInputGroup>
                      <CInputGroupText>
                        <CIcon icon={cilSearch} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Buscar integrante por nombre o correo (mínimo 3 caracteres)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchIntegrantes();
                          }
                        }}
                      />
                    </CInputGroup>
                  </CCol>
                  <CCol md={4}>
                    <CButton 
                      color="primary"
                      onClick={handleSearchIntegrantes}
                      disabled={searchTerm.length < 3 || loadingSearch}
                    >
                      {loadingSearch ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <CIcon icon={cilSearch} className="me-1" />
                          Buscar
                        </>
                      )}
                    </CButton>
                    <CButton 
                      color="success"
                      className="ms-2"
                      onClick={() => setIsManualIntegrante(true)}
                    >
                      <CIcon icon={cilUserPlus} className="me-1" />
                      Manual
                    </CButton>
                  </CCol>
                </CRow>
                
                {/* Resultados de búsqueda */}
                {searchResults.length > 0 && (
                  <div className="mt-3 mb-3">
                    <h6>Resultados de búsqueda</h6>
                    <CTable hover responsive size="sm" bordered={false}>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell>Nombre</CTableHeaderCell>
                          <CTableHeaderCell>Email</CTableHeaderCell>
                          <CTableHeaderCell>Acción</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {searchResults.map((integrante, index) => (
                          <CTableRow key={`search-${index}`}>
                            <CTableDataCell>{integrante.nombres_apellidos}</CTableDataCell>
                            <CTableDataCell>{integrante.email}</CTableDataCell>
                            <CTableDataCell>
                              <CButton
                                color="primary"
                                size="sm"
                                onClick={() => handleAddSearchedIntegrante(integrante)}
                              >
                                Agregar
                              </CButton>
                            </CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </div>
                )}
                
                {/* Formulario para agregar integrante manual */}
                <CCollapse visible={isManualIntegrante}>
                  <div className="mt-3 mb-3 p-3 border rounded">
                    <h6>Agregar Integrante Manualmente</h6>
                    <CForm className="row g-3">
                      <CCol md={5}>
                        <CFormLabel>Nombre Completo *</CFormLabel>
                        <CFormInput
                          name="nombres_apellidos_integrante"
                          value={integranteForm.nombres_apellidos_integrante}
                          onChange={(e) => setIntegranteForm({...integranteForm, nombres_apellidos_integrante: e.target.value})}
                          placeholder="Nombre y apellidos"
                          required
                        />
                      </CCol>
                      
                      <CCol md={5}>
                        <CFormLabel>Email *</CFormLabel>
                        <CFormInput
                          type="email"
                          name="emailintegrante"
                          value={integranteForm.emailintegrante}
                          onChange={(e) => setIntegranteForm({...integranteForm, emailintegrante: e.target.value})}
                          placeholder="correo@ejemplo.com"
                          required
                        />
                      </CCol>
                      
                      <CCol md={isEditMode ? 2 : 0}>
                        {isEditMode && reunionForm.estatus !== 'PROGRAMADA' && (
                          <>
                            <CFormLabel>Asistió</CFormLabel>
                            <CFormSelect
                              name="asistio"
                              value={integranteForm.asistio === null ? '' : integranteForm.asistio.toString()}
                              onChange={(e) => setIntegranteForm({
                                ...integranteForm, 
                                asistio: e.target.value === '' ? null : e.target.value === 'true'
                              })}
                            >
                              <option value="">Sin registrar</option>
                              <option value="true">Sí</option>
                              <option value="false">No</option>
                            </CFormSelect>
                          </>
                        )}
                      </CCol>
                      
                      <CCol md={12} className="d-flex justify-content-end">
                        <CButton 
                          color="secondary"
                          className="me-2"
                          onClick={() => {
                            setIsManualIntegrante(false);
                            setIntegranteForm({
                              nombres_apellidos_integrante: '',
                              emailintegrante: '',
                              asistio: null
                            });
                          }}
                        >
                          Cancelar
                        </CButton>
                        <CButton 
                          color="primary"
                          onClick={handleAddManualIntegrante}
                          disabled={!integranteForm.nombres_apellidos_integrante || !integranteForm.emailintegrante}
                        >
                          Agregar
                        </CButton>
                      </CCol>
                    </CForm>
                  </div>
                </CCollapse>
              </div>
              
              <hr />
              
              <div className="mt-3">
                <h6>Integrantes de la Reunión {integrantes.filter(i => !i.isDeleted).length > 0 && `(${integrantes.filter(i => !i.isDeleted).length})`}</h6>
                {loadingIntegrantes ? (
                  <div className="text-center my-3">
                    <CSpinner size="sm" />
                    <p>Cargando integrantes...</p>
                  </div>
                ) : (
                  <CTable hover responsive>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Nombre</CTableHeaderCell>
                        <CTableHeaderCell>Email</CTableHeaderCell>
                        <CTableHeaderCell>Asistió</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {integrantes.filter(i => !i.isDeleted).length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={4} className="text-center">
                            No hay integrantes registrados para esta reunión
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        integrantes
                          .filter(i => !i.isDeleted)
                          .map((integrante, index) => (
                            <CTableRow key={integrante.idintegrantereunion || `temp-${index}`}>
                              <CTableDataCell>{integrante.nombres_apellidos_integrante}</CTableDataCell>
                              <CTableDataCell>{integrante.emailintegrante}</CTableDataCell>
                              <CTableDataCell>
                                {integrante.asistio === true ? (
                                  <CBadge color="success">Sí</CBadge>
                                ) : integrante.asistio === false ? (
                                  <CBadge color="danger">No</CBadge>
                                ) : (
                                  <CBadge color="secondary">Pendiente</CBadge>
                                )}
                              </CTableDataCell>
                              <CTableDataCell className="text-center">
                                {(reunionForm.estatus !== 'CANCELADA' || reunionForm.estatus !== 'FINALIZADA') && (
                                  <CButton
                                    color="primary"
                                    size="sm"
                                    variant="outline"
                                    className="me-2"
                                    onClick={() => handleEditIntegranteStart(integrante)}
                                  >
                                    Editar
                                  </CButton>
                                )}
                                <CButton
                                  color="danger"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteIntegrante(integrante.idintegrantereunion || integrante.tempId)}
                                >
                                  Eliminar
                                </CButton>
                              </CTableDataCell>
                            </CTableRow>
                          ))
                      )}
                    </CTableBody>
                  </CTable>
                )}
                
                {integrantes.filter(i => !i.isDeleted).length < 2 && (
                  <CAlert color="warning">
                    <strong>Atención:</strong> La reunión debe tener al menos dos integrantes.
                  </CAlert>
                )}
              </div>
            </CTabPane>
          </CTabContent>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowReunionModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveReunion}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditMode ? 'Actualizar Reunión' : 'Crear Reunión'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
      
      {/* Modal para enviar notificaciones */}
      <CModal 
        visible={showNotificationModal} 
        onClose={() => setShowNotificationModal(false)}
        size="md"
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilBell} className="me-2" />
            Enviar Notificación
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {notificationStatus.message && (
            <CAlert color={notificationStatus.success ? 'success' : 'danger'} className="mb-3">
              {notificationStatus.message}
            </CAlert>
          )}
          
          {notificationReunion && (
            <div>
              <h5>Detalles de la Reunión</h5>
              <p><strong>Tema:</strong> {notificationReunion.tema}</p>
              <p><strong>Fecha:</strong> {formatDate(notificationReunion.fecha_inicio)}</p>
              <p><strong>Hora:</strong> {notificationReunion.hora_inicio}</p>
              <p><strong>Lugar:</strong> {notificationReunion.lugar || 'No especificado'}</p>
              
              <p className="mt-3">¿Desea enviar notificación por correo electrónico a todos los integrantes de esta reunión?</p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowNotificationModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSendNotification}
            disabled={sendingNotification || notificationStatus.success}
          >
            {sendingNotification ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Enviando...
              </>
            ) : (
              'Enviar Notificación'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* Modal para registro de asistencia */}
      <CModal 
        visible={showAttendanceModal} 
        onClose={() => setShowAttendanceModal(false)}
      >
        <CModalHeader>
          <CModalTitle>Registro de Asistencia</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CTable>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Asistencia</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {integrantes.filter(i => !i.isDeleted).map((integrante, index) => (
                <CTableRow key={`attendance-${index}`}>
                  <CTableDataCell>{integrante.nombres_apellidos_integrante}</CTableDataCell>
                  <CTableDataCell>
                    <CFormSelect
                      value={integrante.asistio === null ? '' : integrante.asistio.toString()}
                      onChange={(e) => {
                        const updatedIntegrantes = [...integrantes];
                        const idx = updatedIntegrantes.findIndex(
                          i => (i.idintegrantereunion && i.idintegrantereunion === integrante.idintegrantereunion) || 
                              (!i.idintegrantereunion && i.tempId === integrante.tempId)
                        );
                        if (idx !== -1) {
                          updatedIntegrantes[idx] = {
                            ...updatedIntegrantes[idx],
                            asistio: e.target.value === '' ? null : e.target.value === 'true',
                            isEdited: true
                          };
                          setIntegrantes(updatedIntegrantes);
                        }
                      }}
                    >
                      <option value="">Sin registrar</option>
                      <option value="true">Asistió</option>
                      <option value="false">No asistió</option>
                    </CFormSelect>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowAttendanceModal(false)}
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Reuniones;