import React from "react";
import { useState, useEffect } from "react";
import "./Signup.css"
import { Link, useNavigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const Signup = () => {
    const { signUpNewUser, signInWithGoogle } = UserAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState("");

    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await signUpNewUser(email, password)
            if(result.success) {
                navigate("/dashboard")
            }
        } catch (err) {
            setError("An error occured", err);
        }   finally {
            setLoading(false)
        }
    }

    const handleSignInWithGoogle = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                setError("Google sign-in failed");
                console.error(error)
            }
        } catch (err) {
            setError("An unexpected error occurred");
            console.error(err);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="signup">
            <form className="signupForm" onSubmit={handleSignUp}>
                <h2>Sign Up Today!</h2>
                <p>Already have an account? <Link to="/signin">Sign in</Link></p>
                <div className="formInputs">
                    <input onChange={(e) => setEmail(e.target.value)} className="input1" type="email" placeholder="Enter email" />
                    <input onChange={(e) => setPassword(e.target.value)}className="input2" type="password" placeholder="Create a password" />
                    <button className="signupButton" type="submit" disabled={loading}>Sign Up</button>
                    {error && <p>{error}</p>}
                </div>
                <div className="googleOAuth">
                    <button type="button" className="googleSignInButton" onClick={handleSignInWithGoogle}> Continue with Google </button>
                </div>
            </form>
        </div>
    )
}

export default Signup