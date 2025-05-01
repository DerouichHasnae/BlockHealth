import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import { FaUserMd, FaUserInjured, FaStethoscope } from "react-icons/fa";
import "../CSS/RegisterPage.css";

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
          className="bg-teal-500 text-white font-bold py-2 px-4 rounded w-full transition duration-300 ease-in-out transform hover:scale-110 hover:bg-gray-600" // Added transform and grey color for hover
          onClick={() => {
            navigate("/patient_registration");
          }}
        >
          Patient Registration
        </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;