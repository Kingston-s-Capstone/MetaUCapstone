import axios from "axios"
import { supabase } from "../SupaBaseClient";

const backend = import.meta.env.VITE_SERVER_URL
const API = axios.create({
    baseURL: backend || 'http://localhost:4000/api'
});

// Token request for API calls
API.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session && session.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
    }

    return config;
}, (error) => {
    return Promise.reject(error)
})
//Profiles
export const getProfile = () => API.get('/profiles/me');
export const updateProfile = ( updates) => API.put('/profiles/me', updates)

//Internships
export const getInternships = () => API.get('/internships');
export const addInternship = () => async (internshipData) => {
    const res = await API.post('/internships/userInput', internshipData);
    return res;
}

//Recommendations
export const getRecommendations = async (user_id) => {
    const res = await API.get(`/recommendations/${user_id}`)
    return res.data;
}


export default API