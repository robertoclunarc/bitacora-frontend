import React, { useState, useEffect, useCallback } from 'react';
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormSelect,
  CPagination,
  CPaginationItem,
  CAlert,
  CCollapse
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPlus,
  cilSearch,
  cilPencil,
  cilBuilding
} from '@coreui/icons';
import { createEquipo, getEquipos, updateEquipo } from '../../services/equipos.service';
import { getAreas } from '../../services/areas.service';

const Equipos = () => {
  const navigate = useNavigate();
  
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    descripcion_equipo: '',
    codigo_sap: '',
    fkarea: ''
  });

  const [showEquipoModal, setShowEquipoModal] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState(null);
  const [equipoForm, setEquipoForm] = useState({
    fkarea: '',
    descripcion_equipo: '',
    codigo_sap: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(true);
  
  const loadEquipos = useCallback(async (page = 1, filtersObj = filters) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', itemsPerPage);
      
      Object.keys(filtersObj).forEach(key => {
        if (filtersObj[key]) {
          params.append(key, filtersObj[key]);
        }
      });
      
      const token = localStorage.getItem('token');
      const response = await getEquipos(params.toString(), token);
      
      const { equipos, pagination } = response;
      
      setEquipos(equipos || []);
      if (pagination) {
        setTotalItems(pagination.total || 0);
        setTotalPages(Math.ceil((pagination.total || 0) / itemsPerPage));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar equipos:', err);
      setError('No se pudieron cargar los equipos. Intente nuevamente.');
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);
  
  const loadAreas = async () => {
    try {
      setLoadingAreas(true);
      
      const token = localStorage.getItem('token');
      const response = await getAreas(token);
      
      setAreas(response.areas || []);
    } catch (err) {
      console.error('Error al cargar áreas:', err);
    } finally {
      setLoadingAreas(false);
    }
  };

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
        loadEquipos(activePage)
        loadAreas()
    }
}, [activePage, navigate, loadEquipos])

  const handlePageChange = (page) => {
    setActivePage(page);
    loadEquipos(page);
  };
  
  const applyFilters = () => {
    setActivePage(1);
    loadEquipos(1, filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      descripcion_equipo: '',
      codigo_sap: '',
      fkarea: ''
    };
    setFilters(emptyFilters);
    setActivePage(1);
    loadEquipos(1, emptyFilters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewEquipo = () => {
    setEquipoForm({
      fkarea: '',
      descripcion_equipo: '',
      codigo_sap: ''
    });
    setIsEditMode(false);
    setSelectedEquipo(null);
    setFormError(null);
    setShowEquipoModal(true);
  };

  const handleEditEquipo = (equipo) => {
    setEquipoForm({
      fkarea: equipo.fkarea,
      descripcion_equipo: equipo.descripcion_equipo,
      codigo_sap: equipo.codigo_sap
    });
    setIsEditMode(true);
    setSelectedEquipo(equipo);
    setFormError(null);
    setShowEquipoModal(true);
  };

  const handleSaveEquipo = async () => {
    if (!equipoForm.descripcion_equipo || !equipoForm.fkarea) {
      setFormError('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const equipoData = {
        ...equipoForm,
        fkarea: parseInt(equipoForm.fkarea)
      };
      
      if (isEditMode) {
        await updateEquipo(selectedEquipo.idequipo, equipoData, token);
      } else {
        await createEquipo(equipoData, token);
      }
      
      loadEquipos(activePage);
      setShowEquipoModal(false);
      setFormError(null);
    } catch (err) {
      console.error('Error al guardar equipo:', err);
      setFormError('Error al guardar equipo. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">
                  <CIcon icon={cilBuilding} className="me-2" />
                  Equipos Registrados
                </h5>
              </div>
              <div>
                <CButton 
                  color="primary" 
                  className="me-2"
                  onClick={handleNewEquipo}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nuevo Equipo
                </CButton>
                <CButton 
                  color={filterVisible ? "dark" : "light"}
                  variant="outline"
                  onClick={() => setFilterVisible(!filterVisible)}
                >
                  <CIcon icon={cilSearch} className="me-2" />
                  Filtros
                </CButton>
              </div>
            </div>
          </CCardHeader>
          
          <CCollapse visible={filterVisible}>
            <CCardBody className="border-bottom">
              <CForm className="row g-3">
                <CCol md={4}>
                  <CFormLabel>Descripción del Equipo</CFormLabel>
                  <CFormInput
                    name="descripcion_equipo"
                    placeholder="Buscar por descripción"
                    value={filters.descripcion_equipo}
                    onChange={handleFilterChange}
                  />
                </CCol>
                
                <CCol md={4}>
                  <CFormLabel>Código SAP</CFormLabel>
                  <CFormInput
                    name="codigo_sap"
                    placeholder="Buscar por código SAP"
                    value={filters.codigo_sap}
                    onChange={handleFilterChange}
                  />
                </CCol>
                
                <CCol md={4}>
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
                <p className="mt-2">Cargando equipos...</p>
              </div>
            ) : (
              <>
                <CTable hover responsive className="mb-4">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Descripción</CTableHeaderCell>
                      <CTableHeaderCell>Código SAP</CTableHeaderCell>
                      <CTableHeaderCell>Área</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {equipos.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={4} className="text-center">
                          No se encontraron equipos
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      equipos.map(equipo => (
                        <CTableRow key={equipo.idequipo}>
                          <CTableDataCell>{equipo.descripcion_equipo}</CTableDataCell>
                          <CTableDataCell>{equipo.codigo_sap}</CTableDataCell>
                          <CTableDataCell>
                            {areas.find(a => a.idarea === equipo.fkarea)?.nombrearea || '-'}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              color="primary"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditEquipo(equipo)}
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
                  Mostrando {equipos.length} de {totalItems} equipos
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      <CModal 
        visible={showEquipoModal} 
        onClose={() => setShowEquipoModal(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? 'Editar Equipo' : 'Nuevo Equipo'}
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
              <CFormLabel>Descripción del Equipo *</CFormLabel>
              <CFormInput
                name="descripcion_equipo"
                value={equipoForm.descripcion_equipo}
                onChange={(e) => setEquipoForm({...equipoForm, descripcion_equipo: e.target.value})}
                required
              />
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Código SAP</CFormLabel>
              <CFormInput
                name="codigo_sap"
                value={equipoForm.codigo_sap}
                onChange={(e) => setEquipoForm({...equipoForm, codigo_sap: e.target.value})}
              />
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Área *</CFormLabel>
              <CFormSelect
                name="fkarea"
                value={equipoForm.fkarea}
                onChange={(e) => setEquipoForm({...equipoForm, fkarea: e.target.value})}
                required
                disabled={loadingAreas}
              >
                <option value="">Seleccione un área</option>
                {areas.map(area => (
                  <option key={area.idarea} value={area.idarea}>
                    {area.nombrearea}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowEquipoModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveEquipo}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditMode ? 'Actualizar Equipo' : 'Crear Equipo'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Equipos;