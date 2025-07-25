import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../SupaBaseClient";
import socket from "../utilities/socket";
import { toast } from "react-toastify";


const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    const [session, setSession] = useState(undefined)

    //Insert user profile if it doesn't exist
    const insertProfile = async (user) => {
        if (!user) return;

        const { data: existing, error: fetchError } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();

        if (!existing) {
            const { error: insertError } = await supabase
                .from("profiles")
                .insert([{ user_id: user.id, email: user.email }])

            if (insertError) {
                console.error("Error inserting profile:", insertError)
            }
        }
    }

    //Sign up
    const signUpNewUser = async ( email, password ) => {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });  
        if (error) {
            console.error("There was a problem signing up:", error);
            return { success: false, error}
        }

        const { data: userData } = await supabase.auth.getUser();
        await insertProfile(userData);

        return { success: true, data }
    }

    //Sign in
    const signInUser = async ( email, password ) => {
        try {
            const {data, error} = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            })
            if (error) {
                console.error("Sign in error occured: ", error);
                return { succes: false, error: error.message }
            }
            console.log("sign-in success: ", data)
            return { success: true, data}
        }  catch(error) {
            console.error("An error occured: ", error)
        }
    }

    //Sign in with Google
    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/profilepage`
            },
        });
        if (error) {
            console.error("Google sign-in error", error.message);
            return { success: false, error: error.message };
        }
        return { success: true, data }
    }

    useEffect(() => {
        supabase.auth.getSession().then(({data: { session } }) => {
            setSession(session)

            if (session?.user) {
                insertProfile(session.user)
            }
            
            if (session?.access_token) {
                socket.connect();

                socket.on("connect", () => {
                console.log("Connected to Socket.IO", socket.id);
                });

                socket.on("connect_error", (err) => {
                console.error("Socket connection error:", err.message);
                });

                socket.emit("register", session.access_token)

            }
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)

            if (session?.user) {
                insertProfile(session.user)
            }

            if (session?.access_token) {
                socket.connect();
                socket.emit("register", session.access_token);

            }
        })
    }, []);

    useEffect(() => {
        socket.on("new_notification", (notification) => {
            console.log("New notification received:", notification)

            toast.info(`New Notification: ${notification.message}`, {
                onClick: () => {
                    window.location.href = notification.url
                }
            })
        })

        return () => {
            socket.off("new_notification")
        };
    }, []);

    // Sign out
    const signOut = () => {
        const { error } = supabase.auth.signOut();
        if(error) {
            console.error("There was an error:", error)
        }
    }
    return (
        <AuthContext.Provider value={{ session, signUpNewUser, signInUser, signOut, signInWithGoogle }}>
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}