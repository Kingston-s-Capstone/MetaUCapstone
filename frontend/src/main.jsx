import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from "./Router.jsx"
import { AuthContextProvider } from './context/AuthContext.jsx'
import { supabase } from './SupaBaseClient.js'
import { NovuProvider } from '@novu/notification-center'


const App = () => {
  const [subscriberId, setSubscriberId] = useState(null);
  const applicationIdentifier = import.meta.env.VITE_NOVU_APP_ID;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setSubscriberId(user.id)
      }
    };
    getUser();
  }, []);

  if (!subscriberId) return null

  return (
    <StrictMode>
      <AuthContextProvider>
        <NovuProvider
          subscriberId = {subscriberId}
          applicationIdentifier={applicationIdentifier}
        >
          <RouterProvider router={router} />
        </NovuProvider>
      </AuthContextProvider>
    </StrictMode>
  )
}




createRoot(document.getElementById('root')).render(
  <App />
)
