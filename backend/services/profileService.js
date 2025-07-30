const { supabase } = require("../supabaseClient");

const fetchProfileData = async (userId) => {
    const { data, error } = await supabase
        .from("profiles")
        .select("major, career_interests, classification, location_preferences")
        .eq("user_id", userId)
        .single();

    if (error) {
        console.error("Failed to fetch profile", error);
        throw new Error("Unable to load profile");
    }

    return data;
};

module.exports = { fetchProfileData }