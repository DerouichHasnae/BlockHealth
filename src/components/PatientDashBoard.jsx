// src/components/PatientDashBoard.jsx
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/PatientDashboard.css";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import { FiUser, FiFileText, FiHome, FiBell, FiCalendar } from "react-icons/fi";

const PatientDashBoard = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();

  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const viewRecord = () => {
    navigate(`/patient/${hhNumber}/viewrecords`);
    setActiveTab("records");
  };

  const viewProfile = () => {
    navigate(`/patient/${hhNumber}/viewprofile`);
    setActiveTab("profile");
  };

  const goToDashboard = () => {
    navigate(`/patient/${hhNumber}`);
    setActiveTab("dashboard");
  };

  const selectSpecialty = () => {
    navigate(`/doctors/${hhNumber}`); // Nouvelle redirection
    setActiveTab("appointments");
  };

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!contract || !hhNumber) return;

      try {
        const result = await contract.methods.getPatientDetails(hhNumber).call();
        setPatientDetails(result);
      } catch (error) {
        console.error("Error fetching patient details:", error);
        setError("Failed to load patient details");
      }
    };

    fetchPatientDetails();
  }, [contract, hhNumber]);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length === 0) {
            await window.ethereum.request({ method: "eth_requestAccounts" });
          }

          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = PatientRegistration.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            PatientRegistration.abi,
            deployedNetwork?.address
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Error initializing Web3:", error);
          setError("Error connecting to blockchain");
        }
      } else {
        setError("Please install MetaMask extension");
      }
    };

    init();
  }, [hhNumber]);

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>e-Health Records</h2>
        <ul>
          <li
            onClick={goToDashboard}
            className={activeTab === "dashboard" ? "active" : ""}
          >
            <FiHome className="icon" /> Dashboard
          </li>
          <li
            onClick={viewProfile}
            className={activeTab === "profile" ? "active" : ""}
          >
            <FiUser className="icon" /> My Profile
          </li>
          <li
            onClick={viewRecord}
            className={activeTab === "records" ? "active" : ""}
          >
            <FiFileText className="icon" /> Medical Records
          </li>
          <li onClick={() => navigate(`/patient/${hhNumber}/uploadrecord`)}>
            <FiFileText className="icon" /> Upload Records
          </li>
          <li onClick={() => navigate(`/patient/${hhNumber}/grantpermission`)}>
            <FiUser className="icon" /> Grant Permission
          </li>
          <li
            onClick={selectSpecialty} // Modifier pour sélectionner une spécialité
            className={activeTab === "appointments" ? "active" : ""}
          >
            <FiCalendar className="icon" /> Appointments
          </li>
          <li>
            <FiBell className="icon" /> Notifications
          </li>
        </ul>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <h1>Patient Dashboard</h1>
          {patientDetails ? (
            <p className="dashboard-welcome">
              Welcome back, <span className="patient-name">{patientDetails.name}!</span>
            </p>
          ) : (
            <p className="dashboard-loading">Loading profile...</p>
          )}
        </header>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Recent Activities</h3>
            <p>Your recent medical interactions will appear here.</p>
          </div>
          <div className="dashboard-card">
            <h3>Health Summary</h3>
            <p>Key health metrics and summary will be displayed here.</p>
          </div>
          <div className="dashboard-card">
            <h3>Upcoming Appointments</h3>
            <p>Your scheduled appointments will appear here.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PatientDashBoard;