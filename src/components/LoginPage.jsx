import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import "../CSS/LoginPage.css";
import { FaUserMd, FaUserInjured } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="login-container">
      <NavBar />
      <div className="login-content">
        <h1 className="login-title">Medical Portal</h1>
        <p className="login-subtitle">Select your login method</p>
        
        <div className="login-buttons-container">
          <button
            className="login-button"
            onClick={() => navigate("/doctor_login")}
          >
            <FaUserMd /> Doctor Login
          </button>
          <button
          className="bg-teal-500 text-white font-bold py-2 px-4 rounded w-full transition duration-300 ease-in-out transform hover:scale-110 hover:bg-gray-600"
          onClick={() => {
            navigate("/patient_login");
          }}
        >
          Patient Login
          </button>
        </div>
        
        <p className="login-footer">
          Secure access to your medical dashboard
        </p>
      </div>
    </div>
  );
};

export default LoginPage;