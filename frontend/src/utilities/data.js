import axios from "axios"

const backend = import.meta.env.VITE_SERVER_URL
const API = axios.created({
    baseURL: backend || 'http://localhost:4000/api'
});

//Profiles
export const getProfile = () => API.get('/profiles/me');
export const updateProfile = ( updates) => API.put('/profiles/me', updates)

//Internships
export const getInternships = () => API.get('/internships');
export const addInternship = () => async (internshipData) => {
    const res = await API.post('/internships/userInput', internshipData);
    return res;
}

export default API