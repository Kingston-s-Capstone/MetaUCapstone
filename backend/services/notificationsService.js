//handles interaction with supabase
const supabase =  require("../supabaseClient");

//Create notification
exports.create = async ({ user_id, type, title, message, url}) => {
    const { data, error } = await supabase
        .from("notifications")
        .insert([{ user_id, type, title, message, url }])
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
}

//Get notifications by user
exports.getByUserId = async (user_id) => {
    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: flase })
    if (error) throw Error(error.message)
    return data
};

//mark as read 
exports.markAsRead = async (id) => {
    const { data, error } = await supabase
        .from("notifications")
        .update({ status: "read" })
        .eq("id", id)
        .select()
        .single()
    if (error) throw new Error(error.message);
    return data
}