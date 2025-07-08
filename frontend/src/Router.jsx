import { createBrowserRouter,  } from 'react-router-dom'
import Signin from './components/SignIn';
import Signup from './components/SignUp';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';
import Internships from './pages/Internships';

export const router = createBrowserRouter([
    {  path: "/", element: <Signup /> },
    { path: "/signup", element: <Signup />},
    { path: "/signin", element: <Signin />},
    { path: "/dashboard", element: ( <PrivateRoute><Navigation /></PrivateRoute>
        ),
        children: [
            { path: "/dashboard", element: <Dashboard /> }
        ]
    },
    { path: "/profilepage", element: ( <PrivateRoute><Navigation /></PrivateRoute>
        ),
        children: [
            { path: "/profilepage", element: <ProfilePage /> }
        ]
    },
    { path: "/internshippage", element: ( <PrivateRoute><Navigation /></PrivateRoute>
        ),
        children: [
            { path: "/internshippage", element: <Internships /> }
        ]
    },
])