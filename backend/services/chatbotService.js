const { supabase } = require('../supabaseClient');
const axios = require("axios")


const generateChatbotResponse = async (userMessage, profile) => {
    const { major, career_interests, classification, location_preferences } = profile;

    //prompt
    const prompt = `
    You are UpliftED, an AI assistant for helping HBCU students find internships, scholarships, and professional development opportunities. 
    Only respond to questions related to careers or education. If the user's message is casual or unrelated, respond briefly and guide them back to relevant topics.
    Provide accurate and up to date information to users. Its 2025 so make sure everything is up to date. Be short, helpful, and to the point. If you don't know, say so politely.

    ---
    User Message: "${userMessage}"
    
    Context:
    User Profile:
    - Major: ${major}
    - Career Interests: ${career_interests}
    - Classification: ${classification}
    - Preferred Locations: ${location_preferences}
    
    
    `;

    const response = await axios.post("http://localhost:11434/api/generate", {
        model: "mistral",
        prompt,
        stream: false
    });
    return response.data.response

}


module.exports = { generateChatbotResponse }