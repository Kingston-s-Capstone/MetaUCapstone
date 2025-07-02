import { createBrowserRouter,  } from 'react-router-dom'
import App from "./App";
import Signin from './components/SignIn';
import Signup from './components/SignUp';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';
import Navigation from './components/Navigation';

export const router = createBrowserRouter([
    {  
        path: "/", element: <Navigation />,
        children: [
            { path: "/dashboard", element: <PrivateRoute><Dashboard /></PrivateRoute>},
            { path: "/profilepage", element: <PrivateRoute><ProfilePage /></PrivateRoute>}
        ],
    },
    { path: "/signup", element: <Signup />},
    { path: "/signin", element: <Signin />},
])