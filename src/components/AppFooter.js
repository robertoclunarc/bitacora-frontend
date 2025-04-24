import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <span className="ms-1">&copy; 2025 Sistema Bitácora.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="http://10.50.188.48/intranet" target="_blank" rel="noopener noreferrer">
          Matesi/Briqven
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)