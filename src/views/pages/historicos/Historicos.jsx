// src/views/historicos/Historicos.js
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
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CBadge,
  CPagination,
  CPaginationItem,
  CAlert,
  CCollapse,
  CTooltip,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane, CForm
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilHistory,
  cilSearch,
  cilFilter,
  cilCalendar,
  cilX,
  cilDescription,
  cilInfo,
  //cilUser,
  cilWarning,
  cilCheck,
  cilTag,
  cilSortAscending,
  cilSortDescending
} from '@coreui/icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Importar servicios
import { 
  getOldBitacoras, 
  getOldBitacoraByFecha,
  getOldBitacorasCatalogos
} from '../../../services/oldBitacoras.service';

const HistoricosBitacoras = () => {
  // Estados para la lista de bitácoras históricas
  const [oldBitacoras, setOldBitacoras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para la paginación
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estados para el filtrado
  const [filterVisible, setFilterVisible] = useState(true);
  const [filters, setFilters] = useState({
    folio: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo: '',
    tema: '',
    descripcion: '',
    usuario: '',
    codigoEQ: '',
    turno: '',
    critico: '',
    revisado: '',
    orderBy: 'fecha',
    orderDir: 'DESC'
  });
  
  // Estados para catálogos
  const [tipos, setTipos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  
  // Estados para el modal de detalle
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBitacora, setSelectedBitacora] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  
  // Estado para ordenamiento
  const [sortInfo, setSortInfo] = useState({ field: 'fecha', direction: 'DESC' });
  
  // Función para cargar históricos de bitácoras optimizada con useCallback
  const loadOldBitacoras = useCallback(async (page = 1, perPage = itemsPerPage, filtersObj = filters) => {
    try {
      setLoading(true);
      
      // Incluir información de ordenamiento en los filtros
      const filtersWithSort = {
        ...filtersObj,
        orderBy: sortInfo.field,
        orderDir: sortInfo.direction
      };
      
      const response = await getOldBitacoras(page, perPage, filtersWithSort);
      
      setOldBitacoras(response.oldBitacoras || []);
      if (response.pagination) {
        setTotalItems(response.pagination.total || 0);
        setTotalPages(Math.ceil((response.pagination.total || 0) / perPage));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar históricos de bitácoras:', err);
      setError('No se pudieron cargar los históricos de bitácoras. Intente nuevamente.');
      setOldBitacoras([]);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage, sortInfo]);
  
  // Función para cargar catálogos
  const loadCatalogos = async () => {
    try {
      const catalogos = await getOldBitacorasCatalogos();
      
      setTipos(catalogos.tipos || []);
      setTurnos(catalogos.turnos || []);
      setUsuarios(catalogos.usuarios || []);
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    }
  };
  
  // Cargar bitácoras y catálogos al iniciar
  useEffect(() => {
    loadOldBitacoras(activePage);
    loadCatalogos();
  }, [activePage, loadOldBitacoras, itemsPerPage]);
  
  // Función para manejar cambio de página
  const handlePageChange = (page) => {
    setActivePage(page);
  };
  
  // Función para aplicar filtros
  const applyFilters = () => {
    setActivePage(1);
    loadOldBitacoras(1, itemsPerPage, filters);
  };
  
  // Función para resetear filtros
  const resetFilters = () => {
    const emptyFilters = {
      folio: '',
      fecha_inicio: '',
      fecha_fin: '',
      tipo: '',
      tema: '',
      descripcion: '',
      usuario: '',
      codigoEQ: '',
      turno: '',
      critico: '',
      revisado: '',
      orderBy: 'fecha',
      orderDir: 'DESC'
    };
    setFilters(emptyFilters);
    setSortInfo({ field: 'fecha', direction: 'DESC' });
    setActivePage(1);
    loadOldBitacoras(1, itemsPerPage, emptyFilters);
  };
  
  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Función para cambiar registros por página
  const handleItemsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setActivePage(1);
    loadOldBitacoras(1, value, filters);
  };
  
  // Función para manejar cambio de ordenamiento
  const handleSort = (field) => {
    const direction = sortInfo.field === field && sortInfo.direction === 'ASC' ? 'DESC' : 'ASC';
    setSortInfo({ field, direction });
    
    // Actualizar filtros para ordenamiento
    const updatedFilters = {
      ...filters,
      orderBy: field,
      orderDir: direction
    };
    
    setFilters(updatedFilters);
    loadOldBitacoras(activePage, itemsPerPage, updatedFilters);
  };
  
  // Función para ver detalle de bitácora
  const handleViewDetail = async (fecha, hora) => {
    try {
      setLoadingDetail(true);
      const response = await getOldBitacoraByFecha(formatDateBD(fecha), hora);
      
      if (response.oldBitacora) {
        setSelectedBitacora(response.oldBitacora);
        setActiveTab(1);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error(`Error al obtener detalle de bitácora ${fecha}:`, err);
      setError('No se pudo cargar el detalle de la bitácora. Intente nuevamente.');
    } finally {
      setLoadingDetail(false);
    }
  };
  
  // Función para obtener texto de turno
  const getTurnoBadge = (turno) => {
    switch (turno) {
      case '1':
        return <CBadge color="primary">Mañana</CBadge>;
      case '2':
        return <CBadge color="warning">Tarde</CBadge>;
      case '3':
        return <CBadge color="dark">Noche</CBadge>;
      default:
        return <CBadge color="secondary">{turno || '-'}</CBadge>;
    }
  };
  
  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  const formatDateBD = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd', { locale: es });
    } catch (e) {
      return dateString;
    }
  };
  
  // Icono para el ordenamiento
  const getSortIcon = (field) => {
    if (sortInfo.field !== field) return null;
    
    return sortInfo.direction === 'ASC' 
      ? <CIcon icon={cilSortAscending} className="ms-1" /> 
      : <CIcon icon={cilSortDescending} className="ms-1" />;
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0">
                  <CIcon icon={cilHistory} className="me-2" />
                  Histórico de Bitácoras
                </h4>
              </div>
              <div>
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
              <CForm className="row g-3" onSubmit={(e) => { e.preventDefault(); applyFilters(); }}>
                <CCol md={3}>
                  <CFormLabel>Folio</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilTag} />
                    </CInputGroupText>
                    <CFormInput
                      name="folio"
                      placeholder="Buscar por folio"
                      value={filters.folio}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Tema/Descripción</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilDescription} />
                    </CInputGroupText>
                    <CFormInput
                      name="tema"
                      placeholder="Buscar por tema"
                      value={filters.tema}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Descripción</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilInfo} />
                    </CInputGroupText>
                    <CFormInput
                      name="descripcion"
                      placeholder="Buscar en descripción"
                      value={filters.descripcion}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Código Equipo</CFormLabel>
                  <CInputGroup>
                    <CInputGroupText>
                      <CIcon icon={cilInfo} />
                    </CInputGroupText>
                    <CFormInput
                      name="codigoEQ"
                      placeholder="Código de equipo"
                      value={filters.codigoEQ}
                      onChange={handleFilterChange}
                    />
                  </CInputGroup>
                </CCol>
                
                <CCol md={3}>
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
                
                <CCol md={3}>
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
                  <CFormLabel>Tipo</CFormLabel>
                  <CFormSelect
                    name="tipo"
                    value={filters.tipo}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    {tipos.map((tipo, index) => (
                      <option key={index} value={tipo}>
                        {tipo}
                      </option>
                    ))}
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
                    {turnos.map((turno, index) => (
                      <option key={index} value={turno}>
                        {turno === '1' ? 'Mañana' : turno === '2' ? 'Tarde' : turno === '3' ? 'Noche' : turno}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Usuario</CFormLabel>
                  <CFormSelect
                    name="usuario"
                    value={filters.usuario}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    {usuarios.map((usuario, index) => (
                      <option key={index} value={usuario}>
                        {usuario}
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
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Revisado</CFormLabel>
                  <CFormSelect
                    name="revisado"
                    value={filters.revisado}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="1">Sí</option>
                    <option value="0">No</option>
                  </CFormSelect>
                </CCol>
                
                <CCol md={3}>
                  <CFormLabel>Registros por página</CFormLabel>
                  <CFormSelect
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
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
                <p className="mt-2">Cargando históricos de bitácoras...</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <CTable hover className="mb-4 align-middle">
                    <CTableHead color="light">
                      <CTableRow>
                        <CTableHeaderCell style={{ cursor: 'pointer' }} onClick={() => handleSort('folio')}>
                          Folio {getSortIcon('folio')}
                        </CTableHeaderCell>
                        <CTableHeaderCell style={{ cursor: 'pointer' }} onClick={() => handleSort('fecha')}>
                          Fecha {getSortIcon('fecha')}
                        </CTableHeaderCell>
                        <CTableHeaderCell>Turno</CTableHeaderCell>
                        <CTableHeaderCell style={{ cursor: 'pointer' }} onClick={() => handleSort('tipo')}>
                          Tipo {getSortIcon('tipo')}
                        </CTableHeaderCell>
                        <CTableHeaderCell style={{ minWidth: '250px', cursor: 'pointer' }} onClick={() => handleSort('tema')}>
                          Tema/Descripción {getSortIcon('tema')}
                        </CTableHeaderCell>
                        <CTableHeaderCell style={{ cursor: 'pointer' }} onClick={() => handleSort('usuario')}>
                          Usuario {getSortIcon('usuario')}
                        </CTableHeaderCell>
                        <CTableHeaderCell>Equipo</CTableHeaderCell>
                        <CTableHeaderCell>Estado</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {oldBitacoras.length === 0 ? (
                        <CTableRow>
                          <CTableDataCell colSpan={9} className="text-center">
                            No se encontraron registros
                          </CTableDataCell>
                        </CTableRow>
                      ) : (
                        oldBitacoras.map((bitacora, index) => (
                          <CTableRow key={index} className={bitacora.critico ? 'table-danger' : ''}>
                            <CTableDataCell>{bitacora.folio}</CTableDataCell>
                            <CTableDataCell>{formatDate(bitacora.fecha)}</CTableDataCell>
                            <CTableDataCell>{getTurnoBadge(bitacora.turno)}</CTableDataCell>
                            <CTableDataCell>
                              <CBadge color="info">{bitacora.tipo || '-'}</CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              <div className="d-flex align-items-center">
                                
                                <div>
                                  <strong>{bitacora.tema || 'Sin título'}</strong>
                                  <div className="text-muted small text-truncate">
                                    {bitacora.descripcion?.substring(0, 50) || '-'}
                                    {bitacora.descripcion?.length > 50 ? '...' : ''}
                                  </div>
                                </div>
                              </div>
                            </CTableDataCell>
                            <CTableDataCell>{bitacora.usuario || '-'}</CTableDataCell>
                            <CTableDataCell className="text-truncate" style={{ maxWidth: '150px' }}>
                              {bitacora.descequipo || bitacora.codigoEQ || '-'}
                            </CTableDataCell>
                            <CTableDataCell>
                              <div className="d-flex align-items-center">
                                {bitacora.critico === 1 ? (
                                  <CTooltip content="Crítico">
                                    <CIcon icon={cilWarning} className="me-2 text-danger" />
                                  </CTooltip>
                                ) : (
                                  <CTooltip content="No Crítico">
                                    <CIcon icon={cilWarning} className="me-2 text-success" />
                                  </CTooltip>
                                )}
                                {bitacora.revisado === 1 ? (
                                  <CTooltip content="Revisado">
                                    <CIcon icon={cilCheck} className="text-success" />
                                  </CTooltip>
                                ) : (
                                  <CTooltip content="No Revisado">
                                    <CIcon icon={cilX} className="text-danger" />
                                  </CTooltip>
                                )}
                              </div>
                            </CTableDataCell>
                            <CTableDataCell className="text-center">
                              <CTooltip content="Ver detalle">
                                <CButton
                                  color="info"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetail(bitacora.fecha, bitacora.hora)}
                                >
                                  <CIcon icon={cilInfo} />
                                </CButton>
                              </CTooltip>
                            </CTableDataCell>
                          </CTableRow>
                        ))
                      )}
                    </CTableBody>
                  </CTable>
                </div>
                
                {/* Información y control de paginación */}
                <div className="d-flex flex-wrap justify-content-between align-items-center">
                  <div className="text-muted small mb-2">
                    Mostrando {oldBitacoras.length} de {totalItems} registros
                  </div>
                  
                  {totalPages > 1 && (
                    <CPagination className="mb-2" align="end">
                      <CPaginationItem 
                        disabled={activePage === 1}
                        onClick={() => handlePageChange(1)}
                      >
                        Primera
                      </CPaginationItem>
                      <CPaginationItem 
                        disabled={activePage === 1}
                        onClick={() => handlePageChange(activePage - 1)}
                      >
                        Anterior
                      </CPaginationItem>
                      
                      {/* Mostrar un número limitado de páginas para evitar desbordamiento */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        
                        if (totalPages <= 5) {
                          // Si hay 5 o menos páginas, mostrarlas todas
                          pageNum = i + 1;
                        } else if (activePage <= 3) {
                          // Si estamos en las primeras páginas
                          pageNum = i + 1;
                        } else if (activePage >= totalPages - 2) {
                          // Si estamos en las últimas páginas
                          pageNum = totalPages - 4 + i;
                        } else {
                          // Estamos en medio, mostrar 2 páginas antes y 2 después
                          pageNum = activePage - 2 + i;
                        }
                        
                        return (
                          <CPaginationItem
                            key={pageNum}
                            active={pageNum === activePage}
                            onClick={() => handlePageChange(pageNum)}
                            style={{ cursor: 'pointer' }}
                          >
                            {pageNum}
                          </CPaginationItem>
                        );
                      })}
                      
                      <CPaginationItem 
                        disabled={activePage === totalPages}
                        onClick={() => handlePageChange(activePage + 1)}
                        style={{ cursor: 'pointer' }}
                      >
                        Siguiente
                      </CPaginationItem>
                      <CPaginationItem 
                        disabled={activePage === totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        style={{ cursor: 'pointer' }}
                      >
                        Última
                      </CPaginationItem>
                    </CPagination>
                  )}
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      {/* Modal de detalle de bitácora histórica */}
      <CModal 
        visible={showDetailModal} 
        onClose={() => setShowDetailModal(false)}
        size="xl"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilInfo} className="me-2" />
            Detalle de Bitácora Histórica - Folio: {selectedBitacora?.folio}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {loadingDetail ? (
            <div className="text-center my-3">
              <CSpinner color="primary" />
              <p>Cargando detalle...</p>
            </div>
          ) : selectedBitacora ? (
            <>
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
              </CNav>
              
              <CTabContent className="mt-4">
                {/* Pestaña de Información General */}
                <CTabPane role="tabpanel" aria-labelledby="info-tab-pane" visible={activeTab === 1}>
                  <CRow>
                    <CCol md={12} className="mb-4">
                      <div className="border p-3 rounded">
                        <h5 className="border-bottom pb-2">Información General</h5>
                        <CRow className="mt-3">
                          <CCol md={3}>
                            <p><strong>Folio:</strong> {selectedBitacora.folio}</p>
                          </CCol>
                          <CCol md={3}>
                            <p><strong>Fecha:</strong> {formatDate(selectedBitacora.fecha)}</p>
                          </CCol>
                          <CCol md={3}>
                            <p><strong>Hora:</strong> {selectedBitacora.hora || '-'}</p>
                          </CCol>
                          <CCol md={3}>
                            <p><strong>Tipo:</strong> {selectedBitacora.tipo || '-'}</p>
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol md={3}>
                            <p><strong>Turno:</strong> {getTurnoBadge(selectedBitacora.turno)}</p>
                          </CCol>
                          <CCol md={3}>
                            <p><strong>Usuario:</strong> {selectedBitacora.usuario || '-'}</p>
                          </CCol>
                          <CCol md={3}>
                            <p><strong>Último usuario:</strong> {selectedBitacora.ultusuario || '-'}</p>
                          </CCol>
                          <CCol md={3}>
                            <p>
                              <strong>Estado:</strong>{' '}
                              {selectedBitacora.critico && <CBadge color="danger" className="me-1">Crítico</CBadge>}
                              {selectedBitacora.revisado && <CBadge color="success">Revisado</CBadge>}
                              {!selectedBitacora.critico && !selectedBitacora.revisado && '-'}
                            </p>
                          </CCol>
                        </CRow>
                      </div>
                    </CCol>
                    
                    <CCol md={12} className="mb-4">
                      <div className="border p-3 rounded">
                        <h5 className="border-bottom pb-2">Información del Equipo</h5>
                        <CRow className="mt-3">
                          <CCol md={6}>
                            <p><strong>Código Equipo:</strong> {selectedBitacora.codigoEQ || '-'}</p>
                          </CCol>
                          <CCol md={6}>
                            <p><strong>Descripción Equipo:</strong> {selectedBitacora.descequipo || '-'}</p>
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol md={6}>
                            <p><strong>Código Responsable:</strong> {selectedBitacora.codigoR || '-'}</p>
                          </CCol>
                          <CCol md={6}>
                            <p><strong>Descripción Responsable:</strong> {selectedBitacora.respodesc || '-'}</p>
                          </CCol>
                        </CRow>
                      </div>
                    </CCol>
                    
                    <CCol md={12} className="mb-4">
                      <div className="border p-3 rounded">
                        <h5 className="border-bottom pb-2">Información de la Actividad</h5>
                        <CRow className="mt-3">
                          <CCol md={6}>
                            <p><strong>Tema:</strong> {selectedBitacora.tema || '-'}</p>
                          </CCol>
                          <CCol md={6}>
                            <p><strong>Duración Actividad:</strong> {selectedBitacora.duractividad || '-'}</p>
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol md={12}>
                            <p><strong>Descripción:</strong></p>
                            <div className="p-2 bg-light rounded">
                              {selectedBitacora.descripcion || 'Sin descripción'}
                            </div>
                          </CCol>
                        </CRow>
                      </div>
                    </CCol>
                  </CRow>
                </CTabPane>
                
                {/* Pestaña de Detalles */}
                <CTabPane role="tabpanel" aria-labelledby="details-tab-pane" visible={activeTab === 2}>
                  <CRow>
                    <CCol md={12} className="mb-4">
                      <div className="border p-3 rounded">
                        <h5 className="border-bottom pb-2">¿Qué pasó?</h5>
                        <div className="p-2 mt-3 bg-light rounded">
                          {selectedBitacora.quepaso || 'No especificado'}
                        </div>
                      </div>
                    </CCol>
                    
                    <CCol md={12} className="mb-4">
                      <div className="border p-3 rounded">
                        <h5 className="border-bottom pb-2">¿Por qué pasó?</h5>
                        <div className="p-2 mt-3 bg-light rounded">
                          {selectedBitacora.porquepaso || 'No especificado'}
                        </div>
                      </div>
                    </CCol>
                    
                    <CCol md={12} className="mb-4">
                      <div className="border p-3 rounded">
                        <h5 className="border-bottom pb-2">¿Qué se hizo?</h5>
                        <div className="p-2 mt-3 bg-light rounded">
                          {selectedBitacora.quesehizo || 'No especificado'}
                        </div>
                      </div>
                    </CCol>
                    
                    <CCol md={12} className="mb-4">
                      <div className="border p-3 rounded">
                        <h5 className="border-bottom pb-2">Observaciones</h5>
                        <div className="p-2 mt-3 bg-light rounded">
                          {selectedBitacora.observacion || 'Sin observaciones'}
                        </div>
                      </div>
                    </CCol>
                  </CRow>
                </CTabPane>
              </CTabContent>
            </>
          ) : (
            <div className="text-center">
              <p>No se ha podido cargar la información de la bitácora.</p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowDetailModal(false)}
          >
            Cerrar
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default HistoricosBitacoras;