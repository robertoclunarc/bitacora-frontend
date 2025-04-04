import React, { useState, useEffect } from 'react'
import {
  CButton,  CButtonGroup,  CCard,  CCardBody,
  CCardFooter,  CCardHeader,  CCardText,
  CCardTitle,  CCol,  CRow,  CSpinner,
  CBadge,  CTable,  CTableBody,  CTableDataCell,
  CTableHead,  CTableHeaderCell,  CTableRow,  CProgress
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilBell,   cilWarning, 
  cilInfo,   cilCalendarCheck,  cilPeople
} from '@coreui/icons'
import { getCarteleraActive } from '../../services/cartelera.service'
import { getBitacorasActive } from '../../services/bitocoras.services'
import { getReunionesActive } from '../../services/reuniones.service'

const Dashboard = () => {
  const [carteleras, setCarteleras] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actividad, setActividad] = useState([])
  const [loadingActividad, setLoadingActividad] = useState(true)

  useEffect(() => {
    // Función para obtener carteleras
    const fetchCarteleras = async () => {
      try {
        setLoading(true)
        
        const response = await getCarteleraActive(12, 0) // Obtener las primeras 12 carteleras
        
        if (response.data && response.data.carteleras) {
          // Ordenar carteleras: DANGER primero, luego por fecha ascendente
          const sortedCarteleras = response.data.carteleras.sort((a, b) => {
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
        console.log('Bitácoras:', bitacorasRes)
        // Combinar y formatear datos de actividad
        const bitacoras = bitacorasRes.bitacoras.map(b => ({
          tipo: 'Bitácora',
          descripcion: b.tema || b.descripcion.substring(0, 50) + '...',
          fecha: new Date(b.fecha).toLocaleDateString(),
          usuario: b.login
        }))
        
        const reuniones = reunionesRes.reuniones.map(r => ({
          tipo: 'Reunión',
          descripcion: r.tema,
          fecha: new Date(r.fecha_inicio).toLocaleDateString(),
          usuario: r.login_registrado
        }))
        
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
                {['Todas', 'Importante', 'Normal'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === 'Todas'}
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
                      className="h-100"
                    >
                      <CCardHeader className="d-flex justify-content-between align-items-center">
                        {getIconByType(cartelera.tipo_info)}
                        <CBadge color={getCardColorByType(cartelera.tipo_info)} shape="rounded-pill">
                          {cartelera.tipo_info || 'INFO'}
                        </CBadge>
                      </CCardHeader>
                      <CCardBody>
                        <CCardTitle>{cartelera.titulo || `Aviso #${cartelera.idcartelera}`}</CCardTitle>
                        <CCardText>
                          {cartelera.descripcion?.length > 80 
                            ? cartelera.descripcion.substring(0, 80) + '...' 
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
                    <div className="fs-5 fw-semibold">1,123</div>
                  </div>
                </CCol>
                <CCol xs={6} md={6} className="mb-3">
                  <div className="border-start border-start-4 border-start-danger py-1 px-3">
                    <div className="text-medium-emphasis small">Reuniones</div>
                    <div className="fs-5 fw-semibold">450</div>
                  </div>
                </CCol>
                <CCol xs={6} md={6} className="mb-3">
                  <div className="border-start border-start-4 border-start-warning py-1 px-3">
                    <div className="text-medium-emphasis small">Carteleras</div>
                    <div className="fs-5 fw-semibold">87</div>
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
    </>
  )
}

export default Dashboard