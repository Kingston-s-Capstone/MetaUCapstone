import React from "react";
import ProfileForm from "../components/ProfileForm";
import "../components/ProfilePage.css"
import UpliftEDLogo from "../assets/UpliftED_logo.png"

const ProfilePage = () => {
    return (
        <main className="profilePage">
            <div className="profileForm">
                <h1>Enter User Information</h1>
                <ProfileForm />
            </div>
            <div className="logoSection">
                <img className="logo" src={UpliftEDLogo} alt="UpliftED Logo"/>
            </div>
        </main>
    )
}

export default ProfilePage