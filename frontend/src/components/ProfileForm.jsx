import React, { useState } from 'react'
import { updateProfile, getProfile } from '../utilities/data'
import "../components/ProfileForm.css"


const ProfileForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        school: '',
        major: '',
        classification: '',
        career_interests: '',
        location_preferences: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(formData);
            alert('Profile updated')
        } catch (err) {
            console.error('Failed to update profile', err)
        }
    }

    const classifications = [
        "Freshman",
        "Sophomore",
        "Junior",
        "Senior",
        "Fifth-Year Senior",
        "Graduate Student (Master's)",
        "Doctoral Student (PhD)",
        "Professional Student (JD, MD, etc.)",
        "Other"
    ];

    const careerInterests = [
        "Software Engineer",
        "Data Science & Analytics",
        "AI & Machine Learning",
        "Cybersecurity",
        "Product & Project Management",
        "Electrical & Computer Engineering",
        "Mechanical & Civil Engineering",
        "Biomedical & Chemical Engineering",
        "Healthcare & Nursing",
        "Mental Health & Counseling",
        "Public Health & Health Admin",
        "Business & Finance",
        "Marketing & Advertising",
        "Entrepreneurship & Startups",
        "Consulting & Strategy",
        "Education & Teaching",
        "Law, Policy & Government",
        "Social Work & Community Advocacy",
        "Design: UI/UX & Graphic",
        "Journalism, PR & Communications",
        "Film, Media & Entertainment",
        "Operations & Supply Chain",
        "Environmental & Sustainability",
        "Architecture & Urban Planning",
        "Human Resources & Talent",
        "Research & Academia"
    ];


    return (
        <form onSubmit={handleSubmit} className="profileForm">
            <label>
                Name:
            </label>
            <input 
                type="text"
                name="name"
                placeholder= "Name"
                value={formData.name}
                onChange={handleChange}
                required
            />
            
            <label>
                Institution:
            </label>
            <input 
                type="text"
                name="school"
                placeholder= "College or University"
                value={formData.school}
                onChange={handleChange}
                required
            />

        <label>
            Major:
        </label>
            <select name="major" value={formData.major} onChange={handleChange} required>
                <option value="" disabled>Select your major</option>
                <optgroup label="Business">
                    <option>Accounting</option>
                    <option>Business Administration</option>
                    <option>Finance</option>
                    <option>Marketing</option>
                    <option>Economics</option>
                    <option>Entrepreneurship</option>
                    <option>Management Information Systems</option>
                    <option>International Business</option>
                    <option>Supply Chain Management</option>
                    <option>Human Resources Management</option>
                </optgroup>
                <optgroup label="Engineering">
                    <option>Computer Engineering</option>
                    <option>Electrical Engineering</option>
                    <option>Mechanical Engineering</option>
                    <option>Civil Engineering</option>
                    <option>Biomedical Engineering</option>
                    <option>Chemical Engineering</option>
                    <option>Environmental Engineering</option>
                    <option>Industrial Engineering</option>
                    <option>Software Engineering</option>
                    <option>Computer Science</option>
                    <option>Aerospace Engineering</option>
                </optgroup>
                <optgroup label="Sciences">
                    <option>Biology</option>
                    <option>Chemistry</option>
                    <option>Physics</option>
                    <option>Mathematics</option>
                    <option>Statistics</option>
                    <option>Environmental Science</option>
                    <option>Neuroscience</option>
                    <option>Biochemistry</option>
                    <option>Marine Biology</option>
                    <option>Data Science</option>
                </optgroup>
                <optgroup label="Healthcare">
                    <option>Nursing</option>
                    <option>Health Sciences</option>
                    <option>Kinesiology</option>
                    <option>Public Health</option>
                    <option>Pre-Med</option>
                </optgroup>
                <optgroup label="Communications & Journalism">
                    <option>Communication Studies</option>
                    <option>Journalism</option>
                    <option>Public Relations</option>
                    <option>Advertising</option>
                    <option>Broadcast Journalism</option>
                    <option>Media Studies</option>
                    <option>Digital Media</option>
                    <option>Film and Television</option>
                    <option>Strategic Communication</option>
                </optgroup>
                <optgroup label="Social Sciences & Humanities">
                    <option>Political Science</option>
                    <option>Sociology</option>
                    <option>Psychology</option>
                    <option>Anthropology</option>
                    <option>History</option>
                    <option>Philosophy</option>
                    <option>International Relations</option>
                    <option>African American Studies</option>
                </optgroup>
                <optgroup label="Education">
                    <option>Education</option>
                    <option>Early Childhood Education</option>
                </optgroup>
                <optgroup label="Public Service & Legal Studies">
                    <option>Social Work</option>
                    <option>Criminal Justice</option>
                    <option>Pre-Law</option>
                </optgroup>
                </select>

            <label>
                Classification:
            </label>
            <select
                name="classification"
                value={formData.classification}
                onChange={handleChange}
            >
            <option value="" disabled>Select your classification</option>
            {classifications.map((level) => (
                <option key={level} value={level}>
                    {level}
                </option>
            ))}
            </select>

            <label>
                Career Interest:
            </label>
            <select
                name="career_interests"
                value={formData.career_interests}
                onChange={handleChange}
            >
                <option value="" disabled>Select your career interests</option>
                {careerInterests.map((level) => (
                    <option key={level} value={level}>
                        {level}
                    </option>
                ))}
            </select>
            
            <label>
                Location Preferences:
            </label>
            <input 
                type="text"
                name="location_preferences"
                placeholder= "Location Preferences"
                value={formData.location_preferences}
                onChange={handleChange}
                required
            />

            <button className='profileFormButton' type='submit'>Update Profile</button>
        </form>
    )
}

export default ProfileForm