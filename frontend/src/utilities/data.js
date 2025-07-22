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

//Scholarships
export const getScholarships = () => API.get('/scholarships');

//Recommendations
export const getRecommendations = async (user_id) => {
    const res = await API.get(`/recommendations/${user_id}`)
    return res.data;
}

//Save opportunites
export const saveInternship = (user_id, internship_id) => API.post('/internships/save', { user_id, internship_id });

export const saveScholarship = (user_id, scholarship_id) => API.post('/scholarships/save', { user_id, scholarship_id});

//Unsave
export const unsaveInternship = (user_id, internship_id) => API.delete('/internships/unsave', {data: { user_id, internship_id }})
export const unsaveScholarship = (user_id, scholarship_id) => API.delete('/scholarships/unsave', {data: { user_id, scholarship_id }})

//Get saved
export const getSavedInternships = (user_id) => API.get(`/internships/saved/${user_id}`);
export const getSavedScholarships = (user_id) => API.get(`/scholarships/saved/${user_id}`)


//Notifications
export const markNotificationAsRead = async (notificationId) => {
    const res = await API.patch(`/notifications/${notificationId}/read`);
    return res.data
}
export const getUserNotifications = () => API.get('/notifications', `${user_id}`)

export default API