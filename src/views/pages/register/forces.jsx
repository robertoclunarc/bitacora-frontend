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
  CCollapse,
  CFormSelect,
  CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
  cilPlus,
  cilSearch,
  cilPencil
} from '@coreui/icons';
import { createForce, getForcesPages, updateForce } from '../../../services/forces.service';
import { getSenales } from '../../../services/senales.service';
import { getSistemas } from '../../../services/sistemas.service';

const Forces = () => {
  const navigate = useNavigate();
  
  const [forces, setForces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    causas: '',
    valor: '',
    estatusforce: ''
  });

  const [showForceModal, setShowForceModal] = useState(false);
  const [selectedForce, setSelectedForce] = useState(null);
  const [forceForm, setForceForm] = useState({
    fksenal: '',
    fksistema: '',
    causas: '',
    valor: '',
    solicitado_por: '',
    autorizado_por: '',
    ejecutor_por: '',
    tipoforce: '',
    estatusforce: 'ACTIVO',
    login_registrado: localStorage.getItem('login') || ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [senales, setSenales] = useState([]);
  const [sistemas, setSistemas] = useState([]);
  const [loadingSenales, setLoadingSenales] = useState(true);
  const [loadingSistemas, setLoadingSistemas] = useState(true);
  
  const loadForces = useCallback(async (page = 1, filtersObj = filters) => {
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
      const response = await getForcesPages(params.toString(), token);
      
      const { forces, pagination } = response;
      
      setForces(forces || []);
      if (pagination) {
        setTotalItems(pagination.total || 0);
        setTotalPages(Math.ceil((pagination.total || 0) / itemsPerPage));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar fuerzas:', err);
      setError('No se pudieron cargar las fuerzas. Intente nuevamente.');
      setForces([]);
    } finally {
      setLoading(false);
    }
  }, [filters, itemsPerPage]);
  
  const loadSenales = async () => {
    try {
      setLoadingSenales(true);
      const token = localStorage.getItem('token');
      const response = await getSenales(token);
      setSenales(response.senales || []);
    } catch (err) {
      console.error('Error al cargar señales:', err);
    } finally {
      setLoadingSenales(false);
    }
  };

  const loadSistemas = async () => {
    try {
      setLoadingSistemas(true);
      const token = localStorage.getItem('token');
      const response = await getSistemas(token);
      setSistemas(response.sistemas || []);
    } catch (err) {
      console.error('Error al cargar sistemas:', err);
    } finally {
      setLoadingSistemas(false);
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
        loadForces(activePage);
        loadSenales();
        loadSistemas();
    }
  }, [activePage, navigate, loadForces])

  const handlePageChange = (page) => {
    setActivePage(page);
    loadForces(page);
  };
  
  const applyFilters = () => {
    setActivePage(1);
    loadForces(1, filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      causas: '',
      valor: '',
      estatusforce: ''
    };
    setFilters(emptyFilters);
    setActivePage(1);
    loadForces(1, emptyFilters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewForce = () => {
    setForceForm({
      fksenal: '',
      fksistema: '',
      causas: '',
      valor: '',
      solicitado_por: '',
      autorizado_por: '',
      ejecutor_por: '',
      tipoforce: '',
      estatusforce: 'ACTIVO',
      login_registrado: localStorage.getItem('login') || ''
    });
    setIsEditMode(false);
    setSelectedForce(null);
    setFormError(null);
    setShowForceModal(true);
  };

  const handleEditForce = (force) => {
    setForceForm({
      fksenal: force.fksenal,
      fksistema: force.fksistema,
      causas: force.causas,
      valor: force.valor,
      solicitado_por: force.solicitado_por,
      autorizado_por: force.autorizado_por,
      ejecutor_por: force.ejecutor_por,
      tipoforce: force.tipoforce,
      estatusforce: force.estatusforce,
      login_registrado: localStorage.getItem('login') || ''
    });
    setIsEditMode(true);
    setSelectedForce(force);
    setFormError(null);
    setShowForceModal(true);
  };

  const handleSaveForce = async () => {
    if (!forceForm.causas || !forceForm.valor || !forceForm.solicitado_por) {
      setFormError('Por favor complete todos los campos obligatorios.');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const forceData = {
        ...forceForm,
        valor: parseFloat(forceForm.valor),
        fksenal: forceForm.fksenal ? parseInt(forceForm.fksenal) : null,
        fksistema: forceForm.fksistema ? parseInt(forceForm.fksistema) : null
      };
      
      if (isEditMode) {
        await updateForce(selectedForce.idforce, forceData, token);
      } else {
        await createForce(forceData, token);
      }
      
      loadForces(activePage);
      setShowForceModal(false);
      setFormError(null);
    } catch (err) {
      console.error('Error al guardar fuerza:', err);
      setFormError('Error al guardar fuerza. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  // Obtener badge color según el estatus del usuario
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVO':
        return 'success'
      case 'INACTIVO':
        return 'danger'
      default:
        return 'secondary'
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">
                  <CIcon icon={cilSearch} className="me-2" />
                  Forces Registradas
                </h5>
              </div>
              <div>
                <CButton 
                  color="primary" 
                  className="me-2"
                  onClick={handleNewForce}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Nueva Fuerza
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
                  <CFormLabel>Causas</CFormLabel>
                  <CFormInput
                    name="causas"
                    placeholder="Buscar por causas"
                    value={filters.causas}
                    onChange={handleFilterChange}
                  />
                </CCol>

                <CCol md={4}>
                  <CFormLabel>Valor</CFormLabel>
                  <CFormInput
                    name="valor"
                    placeholder="Buscar por valor"
                    value={filters.valor}
                    onChange={handleFilterChange}
                  />
                </CCol>

                <CCol md={4}>
                  <CFormLabel>Estatus</CFormLabel>
                  <CFormSelect
                    name="estatusforce"
                    value={filters.estatusforce}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="COMPLETADO">Completado</option>
                    <option value="CANCELADO">Cancelado</option>
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
                <p className="mt-2">Cargando fuerzas...</p>
              </div>
            ) : (
              <>
                <CTable hover responsive className="mb-4">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Causas</CTableHeaderCell>
                      <CTableHeaderCell>Valor</CTableHeaderCell>
                      <CTableHeaderCell>Solicitado Por</CTableHeaderCell>
                      <CTableHeaderCell>Estatus</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Acciones</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {forces.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={5} className="text-center">
                          No se encontraron fuerzas
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      forces.map(force => (
                        <CTableRow key={force.idforce}>
                          <CTableDataCell>{force.causas}</CTableDataCell>
                          <CTableDataCell>{force.valor}</CTableDataCell>
                          <CTableDataCell>{force.solicitado_por}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={getStatusBadge(force.estatusforce)}>
                                {force.estatusforce}
                            </CBadge>
                          </CTableDataCell>                          
                          <CTableDataCell className="text-center">
                            <CButton
                              color="primary"
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditForce(force)}
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
                  Mostrando {forces.length} de {totalItems} fuerzas
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      
      <CModal 
        visible={showForceModal} 
        onClose={() => setShowForceModal(false)}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            {isEditMode ? 'Editar Fuerza' : 'Nueva Fuerza'}
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
              <CFormLabel>Señal</CFormLabel>
              <CFormSelect
                name="fksenal"
                value={forceForm.fksenal}
                onChange={(e) => setForceForm({...forceForm, fksenal: e.target.value})}
                disabled={loadingSenales}
              >
                <option value="">Seleccione una señal</option>
                {senales.map(senal => (
                  <option key={senal.idsenal} value={senal.idsenal}>
                    {senal.descripcion}
                  </option>
                ))}
              </CFormSelect>
            </CCol>

            <CCol md={6}>
              <CFormLabel>Sistema</CFormLabel>
              <CFormSelect
                name="fksistema"
                value={forceForm.fksistema}
                onChange={(e) => setForceForm({...forceForm, fksistema: e.target.value})}
                disabled={loadingSistemas}
              >
                <option value="">Seleccione un sistema</option>
                {sistemas.map(sistema => (
                  <option key={sistema.idsistema} value={sistema.idsistema}>
                    {sistema.descripcion}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Causas *</CFormLabel>
              <CFormInput
                name="causas"
                value={forceForm.causas}
                onChange={(e) => setForceForm({...forceForm, causas: e.target.value})}
                required
              />
            </CCol>
            
            <CCol md={6}>
              <CFormLabel>Valor *</CFormLabel>
              <CFormInput
                type="number"
                name="valor"
                value={forceForm.valor}
                onChange={(e) => setForceForm({...forceForm, valor: e.target.value})}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Solicitado Por *</CFormLabel>
              <CFormInput
                name="solicitado_por"
                value={forceForm.solicitado_por}
                onChange={(e) => setForceForm({...forceForm, solicitado_por: e.target.value})}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Autorizado Por *</CFormLabel>
              <CFormInput
                name="autorizado_por"
                value={forceForm.autorizado_por}
                onChange={(e) => setForceForm({...forceForm, autorizado_por: e.target.value})}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Ejecutor Por *</CFormLabel>
              <CFormInput
                name="ejecutor_por"
                value={forceForm.ejecutor_por}
                onChange={(e) => setForceForm({...forceForm, ejecutor_por: e.target.value})}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Tipo de Fuerza *</CFormLabel>
              <CFormInput
                name="tipoforce"
                value={forceForm.tipoforce}
                onChange={(e) => setForceForm({...forceForm, tipoforce: e.target.value})}
                required
              />
            </CCol>

            <CCol md={6}>
              <CFormLabel>Estatus *</CFormLabel>
              <CFormSelect
                name="estatusforce"
                value={forceForm.estatusforce}
                onChange={(e) => setForceForm({...forceForm, estatusforce: e.target.value})}
                required
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="COMPLETADO">Completado</option>
                <option value="CANCELADO">Cancelado</option>
              </CFormSelect>
              </CCol>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => setShowForceModal(false)}
          >
            Cancelar
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleSaveForce}
            disabled={saving}
          >
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              isEditMode ? 'Actualizar Fuerza' : 'Crear Fuerza'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Forces;