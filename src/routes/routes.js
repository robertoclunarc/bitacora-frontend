import React from 'react'
//import AdminRoute from '../components/auth/AdminRoute';


const Dashboard = React.lazy(() => import('../views/dashboard/Dashboard'))
const PerfilUsuario = React.lazy(() => import('../views/perfil/PerfilUsuario'))

// Areas
const Areas = React.lazy(() => import('../views/configuracion/areas'))


// Equipos
const Equipos = React.lazy(() => import('../views/configuracion/equipos'))

// Componentes para administración (importados directamente)
const UsuariosComponent = React.lazy(() => import('../views/configuracion/usuarios'))

// Componentes protegidos (envueltos con AdminRoute)
// Usuarios
//const Usuarios = () => <AdminRoute><UsuariosComponent /></AdminRoute>

// Bitácoras
const Bitacoras = React.lazy(() => import('../views/pages/register/bitacoras'))

// Reuniones
const Reuniones = React.lazy(() => import('../views/pages/register/reuniones'))


// Carteleras
const Carteleras = React.lazy(() => import('../views/pages/register/carteleras'))

// Force
const SistemasForce = React.lazy(() => import('../views/force/sistemas'))
const SenalesForce = React.lazy(() => import('../views/force/senales'))
const ForceRegistros = React.lazy(() => import('../views/pages/register/forces'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/perfil', name: 'Perfil de Usuario', element: PerfilUsuario },
  // Configuración
  { path: '/configuracion/usuarios', name: 'Gestión de Usuarios', element: UsuariosComponent },
  { path: '/configuracion/areas', name: 'Gestión de Areas', element: Areas },
  { path: '/configuracion/equipos', name: 'Gestión de Equipos', element: Equipos },
  // Force
  { path: '/force/sistemas', name: 'Gestión de Sistemas', element: SistemasForce },
  { path: '/force/senales', name: 'Gestión de Señales', element: SenalesForce },
  //registros
  { path: '/force/registros', name: 'Registros Force', element: ForceRegistros },
  { path: '/reuniones', name: 'Reuniones', element: Reuniones },
  { path: '/bitacoras', name: 'Gestión de Bitácoras', element: Bitacoras },
  { path: '/carteleras', name: 'Gestión de Carteleras', element: Carteleras },
  
]

export default routes