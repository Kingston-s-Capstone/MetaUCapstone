import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from "./Router.jsx"
import { AuthContextProvider } from './context/AuthContext.jsx'
import { ToastContainer } from "react-toastify"
import ChatBot from './components/ChatBot.jsx'

function AppRoot() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <StrictMode>
      <AuthContextProvider>
        <RouterProvider router={router(setIsChatOpen)} />
      </AuthContextProvider>
      <ToastContainer position="bottom-right" autoClose={10000} />
      <ChatBot isOpen={isChatOpen} onClose={()=> setIsChatOpen(false)} />
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(
  <AppRoot />
)
