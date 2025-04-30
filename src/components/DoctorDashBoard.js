import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import { FiHome, FiUser, FiUsers, FiSettings, FiLogOut } from "react-icons/fi";
import NavBar_Logout from "./NavBar_Logout";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import "./DoctorDashBoard.css";

const DoctorDashBoardPage = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const handleNavigation = (path, menu) => {
    navigate(path);
    setActiveMenu(menu);
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = DoctorRegistration.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            DoctorRegistration.abi,
            deployedNetwork && deployedNetwork.address
          );
          setContract(contractInstance);

          const result = await contractInstance.methods.getDoctorDetails(hhNumber).call();
          setDoctorDetails(result);
        } catch (error) {
          console.error('Error initializing Web3 or fetching doctor details:', error);
          setError('Error initializing Web3 or fetching doctor details');
        }
      } else {
        console.error('Please install MetaMask extension');
        setError('Please install MetaMask extension');
      }
    };

    init();
  }, [hhNumber]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <h3 className="sidebar-title">Doctor Portal</h3>
        </div>
        
        <ul className="sidebar-menu">
          <li className="menu-item">
            <a 
              className={`menu-link ${activeMenu === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveMenu('dashboard')}
            >
              <span className="menu-icon"><FiHome /></span>
              Dashboard
            </a>
          </li>
          <li className="menu-item">
            <a 
              className={`menu-link ${activeMenu === 'profile' ? 'active' : ''}`}
              onClick={() => handleNavigation(`/doctor/${hhNumber}/viewdoctorprofile`, 'profile')}
            >
              <span className="menu-icon"><FiUser /></span>
              My Profile
            </a>
          </li>
          <li className="menu-item">
            <a 
              className={`menu-link ${activeMenu === 'patients' ? 'active' : ''}`}
              onClick={() => handleNavigation(`/doctor/${hhNumber}/patientlist`, 'patients')}
            >
              <span className="menu-icon"><FiUsers /></span>
              Patients
            </a>
          </li>
          <li className="menu-item">
            <a className="menu-link">
              <span className="menu-icon"><FiSettings /></span>
              Settings
            </a>
          </li>
          <li className="menu-item">
            <a className="menu-link">
              <span className="menu-icon"><FiLogOut /></span>
              Logout
            </a>
          </li>
        </ul>
      </div>

      {/* Contenu principal */}
      <div className="dashboard-main">
        <NavBar_Logout />
        
        <div className="welcome-card">
          {doctorDetails && (
            <>
              <h1 className="welcome-title">Welcome back, <span className="doctor-name">Dr. {doctorDetails[1]}</span></h1>
              <p className="welcome-text">Here's what's happening with your practice today.</p>
            </>
          )}
        </div>

      
      

     
   
      </div>
    </div>
  );
};

export default DoctorDashBoardPage;