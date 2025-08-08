import { createBrowserRouter,  } from 'react-router-dom'
import Signin from './components/Signin';
import Signup from './components/Signup';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';
import Internships from './pages/Internships';
import Scholarships from './pages/Scholarships';
import SavedOpportunities from './pages/Saved';
import ProfessionalDevelopment from './pages/ProfessionalDevelopment';

export const router = (setIsChatOpen) => createBrowserRouter([
    {  path: "/", element: <Signup /> },
    { path: "/signup", element: <Signup />},
    { path: "/signin", element: <Signin />},
    { path: "/dashboard", element: ( <PrivateRoute><Navigation onToggleChat={() => setIsChatOpen((prev) => !prev)} /></PrivateRoute>
        ),
        children: [
            { path: "/dashboard", element: <Dashboard /> }
        ]
    },
    { path: "/profilepage", element: ( <PrivateRoute><Navigation onToggleChat={() => setIsChatOpen((prev) => !prev)}/></PrivateRoute>
        ),
        children: [
            { path: "/profilepage", element: <ProfilePage /> }
        ]
    },
    { path: "/internshippage", element: ( <PrivateRoute><Navigation onToggleChat={() => setIsChatOpen((prev) => !prev)}/></PrivateRoute>
        ),
        children: [
            { path: "/internshippage", element: <Internships /> }
        ]
    },
    { path: "/scholarshippage", element: ( <PrivateRoute><Navigation onToggleChat={() => setIsChatOpen((prev) => !prev)}/></PrivateRoute>
        ),
        children: [
            { path: "/scholarshippage", element: <Scholarships /> }
        ]
    },
    { path: "/saved", element: ( <PrivateRoute><Navigation onToggleChat={() => setIsChatOpen((prev) => !prev)}/></PrivateRoute>
        ),
        children: [
            { path: "/saved", element: <SavedOpportunities /> }
        ]
    },
    { path: "/professional-development", element: ( <PrivateRoute><Navigation onToggleChat={() => setIsChatOpen((prev) => !prev)}/></PrivateRoute>
        ),
        children: [
            { path: "/professional-development", element: <ProfessionalDevelopment /> }
        ]
    },
])