import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import "./LoginPage.css";
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
            className="login-button"
            onClick={() => navigate("")}
          >
            <FaUserInjured /> Patient Login
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