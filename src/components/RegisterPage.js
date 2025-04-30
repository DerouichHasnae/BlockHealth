import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { FaUserMd, FaUserInjured, FaStethoscope } from "react-icons/fa";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <NavBar />
      <div className="register-container">
        <div className="register-content">
          {/* Titre avec icône */}
          <div className="register-header">
            <FaStethoscope className="register-icon" />
            <h1 className="register-title">Inscription</h1>
          </div>
          
          {/* Bouton Doctor avec icône */}
          <button
            className="register-button"
            onClick={() => navigate("/doctor_registration")}
          >
            <FaUserMd className="button-icon" />
            <span>Doctor Registration</span>
          </button>
          
          {/* Bouton Patient avec icône */}
          <button
            className="register-button"
            onClick={() => navigate("/patient_registration")}
          >
            <FaUserInjured className="button-icon" />
            <span>Patient Registration</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;