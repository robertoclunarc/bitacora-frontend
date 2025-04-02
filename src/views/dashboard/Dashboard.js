import React from 'react'
import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { CChartLine, CChartDoughnut } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilChartPie } from '@coreui/icons'

const Dashboard = () => {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min)

  return (
    <>
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Actividad del Sistema
              </h4>
              <div className="small text-medium-emphasis">Enero - Julio 2023</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButtonGroup className="float-end">
                {['Día', 'Mes', 'Año'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === 'Mes'}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <CChartLine
            style={{ height: '300px', marginTop: '40px' }}
            data={{
              labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
              datasets: [
                {
                  label: 'Bitácoras',
                  backgroundColor: 'rgba(220, 220, 220, 0.2)',
                  borderColor: 'rgba(220, 220, 220, 1)',
                  pointBackgroundColor: 'rgba(220, 220, 220, 1)',
                  pointBorderColor: '#fff',
                  data: [random(50, 200), random(50, 200), random(50, 200), random(50, 200), random(50, 200), random(50, 200), random(50, 200)],
                },
                {
                  label: 'Reuniones',
                  backgroundColor: 'rgba(151, 187, 205, 0.2)',
                  borderColor: 'rgba(151, 187, 205, 1)',
                  pointBackgroundColor: 'rgba(151, 187, 205, 1)',
                  pointBorderColor: '#fff',
                  data: [random(50, 200), random(50, 200), random(50, 200), random(50, 200), random(50, 200), random(50, 200), random(50, 200)],
                },
              ],
            }}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                },
              },
              scales: {
                x: {
                  grid: {
                    drawOnChartArea: false,
                  },
                },
                y: {
                  beginAtZero: true,
                  max: 250,
                },
              },
              elements: {
                line: {
                  tension: 0.4,
                },
                point: {
                  radius: 0,
                  hitRadius: 10,
                  hoverRadius: 4,
                  hoverBorderWidth: 3,
                },
              },
            }}
          />
        </CCardBody>
        <CCardFooter>
          <CRow xs={{ cols: 1 }} md={{ cols: 5 }} className="text-center">
            <CCol className="mb-sm-2 mb-0">
              <div className="text-medium-emphasis">Bitácoras Totales</div>
              <div className="fw-semibold">1,123 (+ 22%)</div>
              <CProgress thin className="mt-2" precision={1} color="success" value={40} />
            </CCol>
            <CCol className="mb-sm-2 mb-0">
              <div className="text-medium-emphasis">Reuniones</div>
              <div className="fw-semibold">450 (+ 15.4%)</div>
              <CProgress thin className="mt-2" precision={1} color="info" value={20} />
            </CCol>
            <CCol className="mb-sm-2 mb-0">
              <div className="text-medium-emphasis">Carteleras</div>
              <div className="fw-semibold">87 (+ 5.4%)</div>
              <CProgress thin className="mt-2" precision={1} color="warning" value={60} />
            </CCol>
            <CCol className="mb-sm-2 mb-0">
              <div className="text-medium-emphasis">Force</div>
              <div className="fw-semibold">728 (+ 8.2%)</div>
              <CProgress thin className="mt-2" precision={1} color="danger" value={30} />
            </CCol>
            <CCol className="mb-sm-2 mb-0">
              <div className="text-medium-emphasis">Equipos</div>
              <div className="fw-semibold">284 (+ 3.2%)</div>
              <CProgress thin className="mt-2" precision={1} color="primary" value={40} />
            </CCol>
          </CRow>
        </CCardFooter>
      </CCard>

      <CRow>
        <CCol xs={6}>
          <CCard className="mb-4">
            <CCardBody>
              <CRow>
                <CCol sm={6}>
                  <h4 id="traffic" className="card-title mb-0">
                    Distribución por Áreas
                  </h4>
                  <div className="small text-medium-emphasis">Enero - Julio 2023</div>
                </CCol>
                <CCol sm={6} className="d-none d-md-block">
                  <CButton color="primary" className="float-end">
                    <CIcon icon={cilCloudDownload} />
                  </CButton>
                </CCol>
              </CRow>
              <CChartDoughnut
                style={{ height: '300px', marginTop: '40px' }}
                data={{
                  labels: ['Producción', 'Mantenimiento', 'Calidad', 'Administración', 'Seguridad'],
                  datasets: [
                    {
                      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                      data: [random(50, 200), random(50, 200), random(50, 200), random(50, 200), random(50, 200)],
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    }
                  },
                  maintainAspectRatio: false,
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h4 className="card-title mb-0">Actividad reciente</h4>
              <div className="small text-medium-emphasis mb-3">Últimos registros</div>
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
                  <CTableRow>
                    <CTableDataCell>Bitácora</CTableDataCell>
                    <CTableDataCell>Mantenimiento preventivo realizado</CTableDataCell>
                    <CTableDataCell>10/07/2023</CTableDataCell>
                    <CTableDataCell>jperez</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell>Reunión</CTableDataCell>
                    <CTableDataCell>Planificación semanal</CTableDataCell>
                    <CTableDataCell>09/07/2023</CTableDataCell>
                    <CTableDataCell>mgomez</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell>Force</CTableDataCell>
                    <CTableDataCell>Activación de sistema</CTableDataCell>
                    <CTableDataCell>08/07/2023</CTableDataCell>
                    <CTableDataCell>alopez</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell>Bitácora</CTableDataCell>
                    <CTableDataCell>Reporte de incidencia</CTableDataCell>
                    <CTableDataCell>08/07/2023</CTableDataCell>
                    <CTableDataCell>rrodriguez</CTableDataCell>
                  </CTableRow>
                  <CTableRow>
                    <CTableDataCell>Cartelera</CTableDataCell>
                    <CTableDataCell>Comunicado de seguridad</CTableDataCell>
                    <CTableDataCell>07/07/2023</CTableDataCell>
                    <CTableDataCell>mgomez</CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard