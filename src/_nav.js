//import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  //cilBell,
  //cilCalculator,
  cilCalendar,
  //cilChartPie,
  cilClipboard,
  //cilCursor,
  //cilDescription,
  //cilDrop,
  //cilExternalLink,
  cilNotes,
  //cilPencil,
  cilPuzzle,
  cilSettings,
  cilSpeedometer,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
const navItems = [
    {
      component: CNavItem,
      name: 'Dashboard',
      to: '/dashboard',
      icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
      badge: {
        color: 'info',
        text: 'NEW',
      },
    },
    {
      component: CNavTitle,
      name: 'Registros',
    },
    {
      component: CNavItem,
      name: 'Bitácoras',
      to: '/bitacoras',      
      icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Reuniones',
      to: '/reuniones',
      icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Carteleras',
      to: '/carteleras',
      icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />,
    },
    {
      component: CNavItem,
      name: 'Registros Force',
      to: 'force/registros',
      icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    },
    {
      component: CNavTitle,
      name: 'Administración',
    },
    {
      component: CNavGroup,
      name: 'Force',
      to: '/force',
      icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
      items: [
        
        {
          component: CNavItem,
          name: 'Sistemas',
          to: '/force/sistemas',
        },
        {
          component: CNavItem,
          name: 'Señales',
          to: '/force/senales',
        },
      ],
    },
    {
      component: CNavGroup,
      name: 'Configuración',
      icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Áreas',
          to: '/configuracion/areas',
        },
        {
          component: CNavItem,
          name: 'Equipos',
          to: '/configuracion/equipos',
        },
        {
          component: CNavItem,
          name: 'Usuarios',
          to: '/configuracion/usuarios',
        },
      ],
    },
    ];
  
  export default navItems;