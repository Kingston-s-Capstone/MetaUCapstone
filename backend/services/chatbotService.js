const { supabase } = require('../supabaseClient');
const axios = require("axios")

const allOpportunities = async (table) => {

    const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("date_posted", { ascending: false });
    
    if (error) {
        console.error(`Error fetching ${table}:`, error)
    }

    return data || []
}

const generateChatbotResponse = async (userMessage, profile) => {
    const { major, career_interests, classification, location_preferences } = profile;

    //get all opportunities
    const allInternships = await allOpportunities("internships");
    const allScholarships = await allOpportunities("scholarships");
    const allPD = await allOpportunities("professional_development");

    const allOpps = [
        ...allInternships.map(intern => `Internship: ${intern.title} at ${intern.organization}`),
        ...allScholarships.map(scholar => `Scholarship: ${scholar.title} - Amount ${scholar.amount}`),
        ...allPD.map(pd => `Professional Development: ${pd.title} - ${pd.description}`)
    ]

    //prompt
    const prompt = `
    You are a helpful assistant that helps HBCU and other students find relevant internships, scholarships and professional development opportunities.
    Only answer questions related to career or education. If the user's question is outside of that domain, politely decline.
    
    User Message: "${userMessage}"
    
    User Profile:
    - Major: ${major}
    - Career Interests: ${career_interests}
    - Classification: ${classification}
    -Preferred Locations: ${location_preferences}
    
    All Opportunities in the database:
    ${allOpps.join("\n")}
    
    Respond based on this data before going online. If you look online only use credible sources pertaining to internships, scholarships and professional development opportunities.
    Keep your tone professional, friendly and helpful. Keep your responses concise with a description explaining why you gave those results.
    `;

    const response = await axios.post("http://localhost:11434/api/generate", {
        model: "mistral",
        prompt,
        stream: false
    });

    return response.data.repsonse

}

module.exports = { generateChatbotResponse }