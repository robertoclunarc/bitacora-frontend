import React from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderDivider,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilEnvelopeOpen, cilList, cilMenu, cilAccountLogout, cilUser, cilSettings } from '@coreui/icons'

const AppHeader = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid>
        <CHeaderToggler
          className="ps-1"
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderBrand className="mx-auto d-md-none" to="/">
          <h3>BITÁCORA</h3>
        </CHeaderBrand>
        <CHeaderNav className="d-none d-md-flex me-auto">
          <CNavItem>
            <CNavLink to="/dashboard" component={NavLink}>
              Dashboard
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">Bitácoras</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">Reuniones</CNavLink>
          </CNavItem>
        </CHeaderNav>
        <CHeaderNav>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilList} size="lg" />
            </CNavLink>
          </CNavItem>
          
        </CHeaderNav>
        <CHeaderNav className="ms-3">
          <CDropdown variant="nav-item">
            <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
              <div className="avatar avatar-md">
                <img
                  className="avatar-img"
                  src="../assets/images/desconocido.png"
                  alt="Usuario"
                />
              </div>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0" placement="bottom-end">
              <CDropdownItem href="#">
                <CIcon icon={cilUser} className="me-2" />
                Perfil
              </CDropdownItem>
              <CDropdownItem href="#">
                <CIcon icon={cilSettings} className="me-2" />
                Configuración
              </CDropdownItem>
              <CDropdownItem href="#">
                <CIcon icon={cilAccountLogout} className="me-2" />
                Cerrar sesión
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CHeaderNav>
      </CContainer>
      <CHeaderDivider />
      <CContainer fluid>
        <div className="breadcrumb-wrapper">
          {/* Breadcrumb logic would go here */}
          <h4 className="text-primary mb-0">Dashboard</h4>
        </div>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader