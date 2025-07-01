import { createBrowserRouter,  } from 'react-router-dom'
import App from "./App";
import Signin from './components/SignIn';
import Signup from './components/SignUp';
import Dashboard from './components/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';

export const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/signup", element: <Signup />},
    { path: "/signin", element: <Signin />},
    { path: "/dashboard", element: <PrivateRoute><Dashboard /></PrivateRoute>},
    { path: "/profilepage", element: <PrivateRoute><ProfilePage /></PrivateRoute>}
])