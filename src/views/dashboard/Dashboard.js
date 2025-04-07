import React, { useState, useEffect } from 'react'
import {
  CButton,  CButtonGroup,  CCard,  CCardBody,
  CCardFooter,  CCardHeader,  CCardText,
  CCol,  CRow,  CSpinner,
  CBadge,  CTable,  CTableBody,  CTableDataCell,
  CTableHead,  CTableHeaderCell,  CTableRow,  CProgress,
  CModal, CModalBody, CModalHeader, CModalTitle, CModalFooter
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilBell,   cilWarning, cilUser,  cilClock, 
  cilInfo,   cilCalendarCheck,  cilPeople
} from '@coreui/icons'
import { getCarteleraActive } from '../../services/cartelera.service'
import { getBitacorasActive } from '../../services/bitocoras.services'
import { getReunionesActive } from '../../services/reuniones.service'

const Dashboard = () => {
  const [carteleras, setCarteleras] = useState([])
  const [cartelerasAll, setCartelerasAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actividad, setActividad] = useState([])
  const [loadingActividad, setLoadingActividad] = useState(true)
  const [totalBitacoras, setTotalBitacoras] = useState(0)
  const [totalReuniones, setTotalReuniones] = useState(0)
  const [totalCarteletas, setTotalCarteleras] = useState(0)

  // Estados para el modal
  const [selectedCartelera, setSelectedCartelera] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [filtroTipo, setFiltroTipo] = useState('Todas');

  useEffect(() => {
    // Función para obtener carteleras
    const fetchCarteleras = async () => {
      try {
        setLoading(true)
        
        const response = await getCarteleraActive(12, 0) // Obtener las primeras 12 carteleras
        
        if (response && response.carteleras) {
          // Ordenar carteleras: DANGER primero, luego por fecha ascendente
          const sortedCarteleras = response.carteleras.sort((a, b) => {
            // Primero por tipo_info (DANGER > WARNING > INFO)
            const typeOrder = { DANGER: 1, WARNING: 2, INFO: 3 }
            const typeA = typeOrder[a.tipo_info] || 4
            const typeB = typeOrder[b.tipo_info] || 4
            
            if (typeA !== typeB) {
              return typeA - typeB
            }
            
            // Luego por fecha de inicio ascendente
            return new Date(a.fecha_inicio_publicacion) - new Date(b.fecha_inicio_publicacion)
          })
          
          // Limitar a 12 carteleras
          setCarteleras(sortedCarteleras.slice(0, 12))
          setCartelerasAll(sortedCarteleras.slice(0, 12))
          setTotalCarteleras(cartelerasAll.length || 0)
        }
      } catch (err) {
        console.error('Error al obtener carteleras:', err)
        setError('No se pudieron cargar las carteleras. Por favor, intenta nuevamente.')
      } finally {
        setLoading(false)
      }
    }

    // Función para obtener actividad reciente
    const fetchActividad = async () => {
      try {
        setLoadingActividad(true)
        // Ejemplo: obtener las últimas 5 entradas de actividad (puedes ajustar según tus endpoints)
        const [bitacorasRes, reunionesRes] = await Promise.all([
          getBitacorasActive(3, 0),
          getReunionesActive(3, 0)          
        ])
        
        // Combinar y formatear datos de actividad
        const bitacoras = bitacorasRes.bitacoras.map(b => ({
          tipo: 'Bitácora',
          descripcion: b.tema || b.descripcion.substring(0, 50) + '...',
          fecha: new Date(b.fecha).toLocaleDateString(),
          usuario: b.login
        }))

        setTotalBitacoras(bitacoras.length() || 0)
        
        const reuniones = reunionesRes.reuniones.map(r => ({
          tipo: 'Reunión',
          descripcion: r.tema,
          fecha: new Date(r.fecha_inicio).toLocaleDateString(),
          usuario: r.login_registrado
        }))

        setTotalReuniones(reuniones.length() || 0)
        
        // Combinar, ordenar por fecha y limitar a 5 elementos
        const combinedActivity = [...bitacoras, ...reuniones]
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
          .slice(0, 5)
        
        setActividad(combinedActivity)
      } catch (err) {
        console.error('Error al obtener actividad reciente:', err)
      } finally {
        setLoadingActividad(false)
      }
    }

    fetchCarteleras()
    fetchActividad()
  }, [])

  // Función para obtener el ícono según el tipo_info
  const getIconByType = (type) => {
    switch (type) {
      case 'DANGER':
        return <CIcon icon={cilWarning} className="text-danger" />
      case 'WARNING':
        return <CIcon icon={cilBell} className="text-warning" />
      case 'INFO':
      default:
        return <CIcon icon={cilInfo} className="text-info" />
    }
  }

  // Función para obtener el color de la tarjeta según el tipo_info
  const getCardColorByType = (type) => {
    switch (type) {
      case 'DANGER':
        return 'danger'
      case 'WARNING':
        return 'warning'
      case 'INFO':
      default:
        return 'info'
    }
  }

  // Función para abrir el modal con la información de la cartelera
  const handleCarteleraClick = (cartelera) => {
    setSelectedCartelera(cartelera)
    setShowModal(true)
  }

  const handleFiltraTipo = (tipo) => {
    let selectOpcion
    switch (tipo) {
      case 'Danger':
        selectOpcion = 'DANGER';
        break;
      case 'Warning':
        selectOpcion = 'WARNING';
        break;
      case 'Info':
        selectOpcion = 'INFO';
        break;
      default:
        selectOpcion = 'Todas';
        break;
    }
    setFiltroTipo(tipo);    
    const datosFiltrados = selectOpcion === 'Todas'  ? cartelerasAll  : cartelerasAll.filter(item => item.tipo_info === selectOpcion);    
    setCarteleras(datosFiltrados);
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Carteleras Informativas
              </h4>
              <div className="small text-medium-emphasis">Información relevante y actualizada</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButtonGroup className="float-end">
                {['Todas', 'Danger', 'Warning', 'Info'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === filtroTipo}
                    onClick={() => handleFiltraTipo(value)}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>

          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <CSpinner color="primary" />
            </div>
          ) : error ? (
            <div className="text-center text-danger my-5">
              <p>{error}</p>
              <CButton color="primary" onClick={() => window.location.reload()}>
                Reintentar
              </CButton>
            </div>
          ) : (
            <CRow className="mt-4">
              {carteleras.length === 0 ? (
                <CCol className="text-center my-5">
                  <p>No hay carteleras activas para mostrar.</p>
                </CCol>
              ) : (
                carteleras.map((cartelera, index) => (
                  <CCol sm={6} lg={3} key={cartelera.idcartelera || index} className="mb-4">
                    <CCard 
                      color={getCardColorByType(cartelera.tipo_info)} 
                      textColor={cartelera.tipo_info === 'DANGER' ? 'white' : undefined}
                      className="h-100 cursor-pointer"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCarteleraClick(cartelera)}
                    >
                      <CCardHeader className="d-flex justify-content-between align-items-center">
                        {getIconByType(cartelera.tipo_info)}
                        <CBadge color={getCardColorByType(cartelera.tipo_info)} shape="rounded-pill">
                          {cartelera.nombrearea || 'INFO'}
                        </CBadge>
                      </CCardHeader>
                      <CCardBody>                        
                        <CCardText>
                          {cartelera.descripcion?.length > 120 
                            ? cartelera.descripcion.substring(0, 120) + '...' 
                            : cartelera.descripcion}
                        </CCardText>
                      </CCardBody>
                      <CCardFooter className="text-medium-emphasis">
                        <small>
                          Válido hasta: {new Date(cartelera.fecha_fin_publicacion).toLocaleDateString()}
                        </small>
                      </CCardFooter>
                    </CCard>
                  </CCol>
                ))
              )}
            </CRow>
          )}
        </CCardBody>
      </CCard>

      <CRow>
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Actividad Reciente</strong>
            </CCardHeader>
            <CCardBody>
              {loadingActividad ? (
                <div className="text-center my-3">
                  <CSpinner size="sm" />
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Tipo</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Descripción</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Fecha</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Usuario</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {actividad.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={4} className="text-center">
                          No hay actividad reciente.
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      actividad.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            <CBadge color={item.tipo === 'Bitácora' ? 'info' : 'primary'}>
                              {item.tipo}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>{item.descripcion}</CTableDataCell>
                          <CTableDataCell>{item.fecha}</CTableDataCell>
                          <CTableDataCell>{item.usuario}</CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>

        <CCol md={6}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Resumen del Sistema</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={6} md={6} className="mb-3">
                  <div className="border-start border-start-4 border-start-info py-1 px-3">
                    <div className="text-medium-emphasis small">Bitácoras</div>
                    <div className="fs-5 fw-semibold">{ totalBitacoras }</div>
                  </div>
                </CCol>
                <CCol xs={6} md={6} className="mb-3">
                  <div className="border-start border-start-4 border-start-danger py-1 px-3">
                    <div className="text-medium-emphasis small">Reuniones</div>
                    <div className="fs-5 fw-semibold">{ totalReuniones }</div>
                  </div>
                </CCol>
                <CCol xs={6} md={6} className="mb-3">
                  <div className="border-start border-start-4 border-start-warning py-1 px-3">
                    <div className="text-medium-emphasis small">Carteleras</div>
                    <div className="fs-5 fw-semibold">{totalCarteletas}</div>
                  </div>
                </CCol>
                <CCol xs={6} md={6} className="mb-3">
                  <div className="border-start border-start-4 border-start-success py-1 px-3">
                    <div className="text-medium-emphasis small">Usuarios</div>
                    <div className="fs-5 fw-semibold">25</div>
                  </div>
                </CCol>
              </CRow>

              <hr className="mt-0 mb-4" />

              <div className="mb-3 progress-group">
                <div className="progress-group-header">
                  <CIcon className="me-2" icon={cilCalendarCheck} />
                  <span>Reuniones Pendientes</span>
                  <span className="ms-auto fw-semibold">12</span>
                  <span className="text-medium-emphasis small">(80%)</span>
                </div>
                <div className="progress-group-bars">
                  <CProgress thin color="success" value={80} />
                </div>
              </div>
              <div className="mb-3 progress-group">
                <div className="progress-group-header">
                  <CIcon className="me-2" icon={cilPeople} />
                  <span>Actividad de Usuarios</span>
                  <span className="ms-auto fw-semibold">15</span>
                  <span className="text-medium-emphasis small">(60%)</span>
                </div>
                <div className="progress-group-bars">
                  <CProgress thin color="info" value={60} />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {/* Modal de detalle de cartelera */}
      <CModal 
        visible={showModal} 
        onClose={() => setShowModal(false)}
        size="lg"
        backdrop="static"
        alignment="center"
      >
        {selectedCartelera && (
          <>
            <CModalHeader 
              className={`bg-${getCardColorByType(selectedCartelera.tipo_info)} ${selectedCartelera.tipo_info === 'DANGER' ? 'text-white' : ''}`}
            >
              <CModalTitle>
                {getIconByType(selectedCartelera.tipo_info)}
                <span className="ms-2">
                  {selectedCartelera.tipo_info}
                </span>
              </CModalTitle>
            </CModalHeader>
            <CModalBody>
              <div className="mb-3">                
                <p className="mb-4" style={{ whiteSpace: 'pre-line' }}>
                  {selectedCartelera.descripcion}
                </p>
                
                <hr/>
                
                <div className="row mt-4">
                  <div className="col-md-6">
                    <h6 className="mb-2 d-flex align-items-center">
                      <CIcon icon={cilClock} className="me-2" />
                      Periodo de vigencia:
                    </h6>
                    <p>
                      <strong>Desde:</strong> {new Date(selectedCartelera.fecha_inicio_publicacion).toLocaleDateString()} <br/>
                      <strong>Hasta:</strong> {new Date(selectedCartelera.fecha_fin_publicacion).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-2 d-flex align-items-center">
                      <CIcon icon={cilUser} className="me-2" />
                      Información de registro:
                    </h6>
                    <p>
                      <strong>Usuario:</strong> {selectedCartelera.login_registrado} <br/>
                      <strong>Fecha:</strong> {selectedCartelera.fecha_registrado ? new Date(selectedCartelera.fecha_registrado).toLocaleString() : 'N/A'}<br/>
                      <strong>{selectedCartelera.publico === 1 ? "Publico" : 'Privado'}</strong> 
                    </p>
                  </div>
                </div>
                
                {selectedCartelera.fkarea && (
                  <div className="mt-2">
                    <strong>Área:</strong> {selectedCartelera.nombrearea}
                  </div>
                )}
              </div>
            </CModalBody>
            <CModalFooter className={`bg-${getCardColorByType(selectedCartelera.tipo_info)} opacity-75 ${selectedCartelera.tipo_info === 'DANGER' ? 'text-white' : ''}`}>
              <CButton 
                color={selectedCartelera.tipo_info === 'DANGER' ? 'light' : getCardColorByType(selectedCartelera.tipo_info)} 
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </CButton>
            </CModalFooter>
          </>
        )}
      </CModal>
    </>
  )
}

export default Dashboard