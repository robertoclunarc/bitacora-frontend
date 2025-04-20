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
import { createSenal, getSenalesPages, updateSenal } from '../../services/senales.service';

const Senales = () => {
  const navigate = useNavigate();
  
  const [senales, setSenales] = useState([]);
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

  const [showSenalModal, setShowSenalModal] = useState(false);
  const [selectedSenal, setSelectedSenal] = useState(null);
  const [senalForm, setSenalForm] = useState({
    descripcion: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const loadSenales = useCallback(async (page = 1, filtersObj = filters) => {
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
      const response = await getSenalesPages(params.toString(), token);
      
      const { senales, pagination } = response;
      
      setSenales(senales || []);
      if (pagination) {
        setTotalItems(pagination.total || 0);
        setTotalPages(Math.ceil((pagination.total || 0) / itemsPerPage));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar señales:', err);
      setError('No se pudieron cargar las señales. Intente nuevamente.');
      setSenales([]);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage,]);
  
  useEffect(() => {
    loadSenales(activePage);
  }, [activePage, loadSenales]);

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
        loadSenales(activePage)
    }
}, [activePage, navigate, loadSenales])

  const handlePageChange = (page) => {
    setActivePage(page);
    loadSenales(page);
  };
  
  const applyFilters = () => {
    setActivePage(1);
    loadSenales(1, filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      descripcion: ''
    };
    setFilters(emptyFilters);
    setActivePage(1);
    loadSenales(1, emptyFilters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewSenal = () => {
    setSenalForm({
      descripcion: ''
    });
    setIsEditMode(false);
    setSelectedSenal(null);
    setFormError(null);
    setShowSenalModal(true);
  };

  const handleEditSenal = (senal) => {
    setSenalForm({
      descripcion: senal.descripcion
    });
    setIsEditMode(true);
    setSelectedSenal(senal);
    setFormError(null);
    setShowSenalModal(true);
  };

  const handleSaveSenal = async () => {
    if (!senalForm.descripcion) {
      setFormError('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const senalData = {
        descripcion: senalForm.descripcion
      };
      
      if (isEditMode) {
        await updateSenal(selectedSenal.idsenal, senalData, token);
      } else {
        await createSenal(senalData, token);
      }
      
      loadSenales(activePage);
      setShowSenalModal(false);
      setFormError(null);
    } catch (err) {
      console.error('Error al guardar señal:', err);
      setFormError('Error al guardar señal. Intente nuevamente.');
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
                  Señales Registradas
                </h5>
              </div>
              <div>
                <CButton 
                  color="primary" 
                  className="me-2"
                  onClick={handleNewSenal}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nueva Señal
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
                <p className="mt-2">Cargando señales...</p>
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
                    {senales.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={2} className="text-center">
                          No se encontraron señales
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      senales.map(senal => (
                        <CTableRow key={senal.idsenal}>
                          <CTableDataCell>{senal.descripcion}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              color="primary"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSenal(senal)}
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
                  Mostrando {senales.length} de {totalItems} señales
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      <CModal 
        visible={showSenalModal} 
        onClose={() => setShowSenalModal(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? 'Editar Señal' : 'Nueva Señal'}
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
                value={senalForm.descripcion}
                onChange={(e) => setSenalForm({...senalForm, descripcion: e.target.value})}
                required
              />
            </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowSenalModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveSenal}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditMode ? 'Actualizar Señal' : 'Crear Señal'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Senales;