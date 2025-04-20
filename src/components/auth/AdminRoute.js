import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { CSpinner } from '@coreui/react'

const AdminRoute = () => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const userJson = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        
        if (!userJson || !token) {
          setIsAdmin(false)
          setLoading(false)
          return
        }
        
        const userData = JSON.parse(userJson)
        // Asumiendo que nivel 1 es administrador
        setIsAdmin(userData.nivel == 1) 
        setLoading(false)
      } catch (error) {
        console.error('Error al verificar permisos de administrador:', error)
        setIsAdmin(false)
        setLoading(false)
      }
    }
    
    checkAdminStatus()
    
    // También podemos verificar cuando cambie el usuario
    const handleStorageChange = () => {
      checkAdminStatus()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authChange', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authChange', handleStorageChange)
    }
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <CSpinner color="primary" />
        <span className="ms-2">Verificando permisos...</span>
      </div>
    )
  }

  // Si no es administrador, redirigir al dashboard
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />
}

export default AdminRoute