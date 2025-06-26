import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import { RouterProvider } from 'react-router-dom'
import { router } from "./Router.jsx"
import { AuthContextProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <> 
    <h1>UpliftED</h1>
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
    </>
  </StrictMode>
)
