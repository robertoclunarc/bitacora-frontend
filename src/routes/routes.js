import React from 'react'

const Dashboard = React.lazy(() => import('../views/dashboard/Dashboard'))
const PerfilUsuario = React.lazy(() => import('../views/perfil/PerfilUsuario'))
/*
// Areas
const Areas = React.lazy(() => import('../views/configuracion/areas/Areas'))
const AreaForm = React.lazy(() => import('../views/configuracion/areas/AreaForm'))

// Equipos
const Equipos = React.lazy(() => import('../views/configuracion/equipos/Equipos'))
const EquipoForm = React.lazy(() => import('../views/configuracion/equipos/EquipoForm'))

// Usuarios
const Usuarios = React.lazy(() => import('../views/configuracion/usuarios/Usuarios'))
const UsuarioForm = React.lazy(() => import('../views/configuracion/usuarios/UsuarioForm'))

// Bitácoras
const Bitacoras = React.lazy(() => import('../views/bitacoras/Bitacoras'))
const BitacoraForm = React.lazy(() => import('../views/bitacoras/BitacoraForm'))

// Reuniones
const Reuniones = React.lazy(() => import('../views/reuniones/Reuniones'))
const ReunionForm = React.lazy(() => import('../views/reuniones/ReunionForm'))

// Carteleras
const Carteleras = React.lazy(() => import('../views/carteleras/Carteleras'))
const CarteleraForm = React.lazy(() => import('../views/carteleras/CarteleraForm'))

// Force
const ForceRegistros = React.lazy(() => import('../views/force/registros/ForceRegistros'))
const ForceForm = React.lazy(() => import('../views/force/registros/ForceForm'))
const SistemasForce = React.lazy(() => import('../views/force/sistemas/SistemasForce'))
const SenalesForce = React.lazy(() => import('../views/force/senales/SenalesForce'))
*/
const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/perfil', name: 'Perfil de Usuario', element: PerfilUsuario },
  /*
  // Configuración
  { path: '/configuracion/areas', name: 'Áreas', element: Areas },
  { path: '/configuracion/areas/nuevo', name: 'Nueva Área', element: AreaForm },
  { path: '/configuracion/areas/:id', name: 'Editar Área', element: AreaForm },
  
  { path: '/configuracion/equipos', name: 'Equipos', element: Equipos },
  { path: '/configuracion/equipos/nuevo', name: 'Nuevo Equipo', element: EquipoForm },
  { path: '/configuracion/equipos/:id', name: 'Editar Equipo', element: EquipoForm },
  
  { path: '/configuracion/usuarios', name: 'Usuarios', element: Usuarios },
  { path: '/configuracion/usuarios/nuevo', name: 'Nuevo Usuario', element: UsuarioForm },
  { path: '/configuracion/usuarios/:id', name: 'Editar Usuario', element: UsuarioForm },
  
  // Registro
  { path: '/bitacoras', name: 'Bitácoras', element: Bitacoras },
  { path: '/bitacoras/nuevo', name: 'Nueva Bitácora', element: BitacoraForm },
  { path: '/bitacoras/:id', name: 'Editar Bitácora', element: BitacoraForm },
  
  { path: '/reuniones', name: 'Reuniones', element: Reuniones },
  { path: '/reuniones/nuevo', name: 'Nueva Reunión', element: ReunionForm },
  { path: '/reuniones/:id', name: 'Editar Reunión', element: ReunionForm },
  
  { path: '/carteleras', name: 'Carteleras', element: Carteleras },
  { path: '/carteleras/nuevo', name: 'Nueva Cartelera', element: CarteleraForm },
  { path: '/carteleras/:id', name: 'Editar Cartelera', element: CarteleraForm },
  
  // Force
  { path: '/force/registros', name: 'Registros Force', element: ForceRegistros },
  { path: '/force/registros/nuevo', name: 'Nuevo Force', element: ForceForm },
  { path: '/force/registros/:id', name: 'Editar Force', element: ForceForm },
  { path: '/force/sistemas', name: 'Sistemas Force', element: SistemasForce },
  { path: '/force/senales', name: 'Señales Force', element: SenalesForce },*/
]

export default routes