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
  CAlert,
  CPagination,
  CPaginationItem,
  CCollapse
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPlus,
  cilSearch,
  cilPencil
} from '@coreui/icons';
import { createSistema, getSistemasPages, updateSistema } from '../../services/sistemas.service';

const Sistemas = () => {
  const navigate = useNavigate();
  
  const [sistemas, setSistemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    descripcion: ''
  });

  const [showSistemaModal, setShowSistemaModal] = useState(false);
  const [selectedSistema, setSelectedSistema] = useState(null);
  const [sistemaForm, setSistemaForm] = useState({
    descripcion: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const loadSistemas = useCallback(async (page = 1, filtersObj = filters) => {
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
      
      const response = await getSistemasPages(params.toString(), token);
      
      const { sistemas, pagination } = response;
      
      setSistemas(sistemas || []);
      if (pagination) {
        setTotalItems(pagination.total || 0);
        setTotalPages(Math.ceil((pagination.total || 0) / itemsPerPage));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar sistemas:', err);
      setError('No se pudieron cargar los sistemas. Intente nuevamente.');
      setSistemas([]);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);
  
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
    loadSistemas(activePage)
    
    }
}, [activePage, navigate, loadSistemas])

  const handlePageChange = (page) => {
    setActivePage(page);
    loadSistemas(page);
  };
  
  const applyFilters = () => {
    setActivePage(1);
    loadSistemas(1, filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      descripcion: ''
    };
    setFilters(emptyFilters);
    setActivePage(1);
    loadSistemas(1, emptyFilters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewSistema = () => {
    setSistemaForm({
      descripcion: ''
    });
    setIsEditMode(false);
    setSelectedSistema(null);
    setFormError(null);
    setShowSistemaModal(true);
  };

  const handleEditSistema = (sistema) => {
    setSistemaForm({
      descripcion: sistema.descripcion
    });
    setIsEditMode(true);
    setSelectedSistema(sistema);
    setFormError(null);
    setShowSistemaModal(true);
  };

  const handleSaveSistema = async () => {
    if (!sistemaForm.descripcion) {
      setFormError('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const sistemaData = {
        descripcion: sistemaForm.descripcion
      };
      
      if (isEditMode) {
        await updateSistema(selectedSistema.idsistema, sistemaData, token);
      } else {
        await createSistema(sistemaData, token);
      }
      
      loadSistemas(activePage);
      setShowSistemaModal(false);
      setFormError(null);
    } catch (err) {
      console.error('Error al guardar sistema:', err);
      setFormError('Error al guardar sistema. Intente nuevamente.');
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
                  <CIcon icon={cilSearch} className="me-2" />
                  Sistemas Registrados
                </h5>
              </div>
              <div>
                <CButton 
                  color="primary" 
                  className="me-2"
                  onClick={handleNewSistema}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nuevo Sistema
                </CButton>
                <CButton 
                  color={filterVisible ? "dark" : "grey"}
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
                <CCol md={6}>
                  <CFormLabel>Descripción</CFormLabel>
                  <CFormInput
                    name="descripcion"
                    placeholder="Buscar por descripción"
                    value={filters.descripcion}
                    onChange={handleFilterChange}
                  />
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
                <p className="mt-2">Cargando sistemas...</p>
              </div>
            ) : (
              <>
                <CTable hover responsive className="mb-4">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Descripción</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {sistemas.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={2} className="text-center">
                          No se encontraron sistemas
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      sistemas.map(sistema => (
                        <CTableRow key={sistema.idsistema}>
                          <CTableDataCell>{sistema.descripcion}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              color="primary"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSistema(sistema)}
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
                  Mostrando {sistemas.length} de {totalItems} sistemas
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      <CModal 
        visible={showSistemaModal} 
        onClose={() => setShowSistemaModal(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? 'Editar Sistema' : 'Nuevo Sistema'}
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
              <CFormInput
                name="descripcion"
                value={sistemaForm.descripcion}
                onChange={(e) => setSistemaForm({...sistemaForm, descripcion: e.target.value})}
                required
              />
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowSistemaModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveSistema}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditMode ? 'Actualizar Sistema' : 'Crear Sistema'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Sistemas;