import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/PatientDashboard.css";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import { FiUser, FiFileText, FiHome, FiBell, FiCalendar } from "react-icons/fi";
import ViewProfile from "./ViewProfile";
import ViewPatientRecords from "./ViewPatientRecords";

const PatientDashBoard = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!contract || !hhNumber) return;

      try {
        const result = await contract.methods.getPatientDetails(hhNumber).call();
        setPatientDetails(result);
      } catch (error) {
        console.error("Erreur lors du chargement des détails du patient :", error);
        setError("Échec du chargement des détails du patient");
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
          console.error("Erreur d'initialisation de Web3 :", error);
          setError("Erreur de connexion à la blockchain");
        }
      } else {
        setError("Veuillez installer l'extension MetaMask");
      }
    };

    init();
  }, [hhNumber]);

  // Fonctions pour changer la section active ou naviguer
  const showDashboard = () => {
    setActiveSection("dashboard");
    setMenuOpen(false);
  };
  const showProfile = () => {
    setActiveSection("profile");
    setMenuOpen(false);
  };
  const showRecords = () => {
    setActiveSection("records");
    setMenuOpen(false);
  };
  const showUploadRecord = () => {
    console.log("showUploadRecord - hhNumber:", hhNumber);
    if (hhNumber) {
      navigate(`/patient/${hhNumber}/uploadrecord`);
      setMenuOpen(false);
    } else {
      setError("Identifiant patient manquant pour la redirection");
      console.error("showUploadRecord - hhNumber manquant");
    }
  };
  const showGrantPermission = () => {
    console.log("showGrantPermission - hhNumber:", hhNumber);
    if (hhNumber) {
      navigate(`/patient/${hhNumber}/grantpermission`);
      setMenuOpen(false);
    } else {
      setError("Identifiant patient manquant pour la redirection");
      console.error("showGrantPermission - hhNumber manquant");
    }
  };
  const showDoctorList = () => {
    console.log("showDoctorList - hhNumber:", hhNumber);
    if (hhNumber) {
      navigate(`/doctors/${hhNumber}`);
      setMenuOpen(false);
    } else {
      setError("Identifiant patient manquant pour la redirection");
      console.error("showDoctorList - hhNumber manquant");
    }
  };
  const showAppointments = () => {
    console.log("showAppointments - hhNumber:", hhNumber);
    if (hhNumber) {
      navigate(`/patient/${hhNumber}/appointments`);
      setMenuOpen(false);
    } else {
      setError("Identifiant patient manquant pour la redirection");
      console.error("showAppointments - hhNumber manquant");
    }
  };
  const showNotifications = () => {
    setActiveSection("notifications");
    setMenuOpen(false);
  };

  // Rendu conditionnel de la section active
  const renderActiveSection = () => {
    switch (activeSection) {
      case "profile":
        return <ViewProfile />;
      case "records":
        return <ViewPatientRecords />;
      case "notifications":
        return (
          <div className="notifications-section">
            <h3>Notifications</h3>
            <p>Aucune notification pour le moment.</p>
          </div>
        );
      case "dashboard":
      default:
        return (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Activités Récentes</h3>
              <p>Vos interactions médicales récentes apparaîtront ici.</p>
            </div>
            <div className="dashboard-card">
              <h3>Résumé de Santé</h3>
              <p>Les métriques clés de santé seront affichées ici.</p>
            </div>
            <div className="dashboard-card">
              <h3>Rendez-vous à Venir</h3>
              <p>Vos rendez-vous programmés apparaîtront ici.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <FiHome className="icon" />
        </button>
        <div className="menu-content">
          <h2>e-Health Records</h2>
          <ul>
            <li
              onClick={showDashboard}
              className={activeSection === "dashboard" ? "active" : ""}
            >
              <FiHome className="icon" /> Tableau de Bord
            </li>
            <li
              onClick={showProfile}
              className={activeSection === "profile" ? "active" : ""}
            >
              <FiUser className="icon" /> Mon Profil
            </li>
            <li
              onClick={showRecords}
              className={activeSection === "records" ? "active" : ""}
            >
              <FiFileText className="icon" /> Dossiers Médicaux
            </li>
            <li
              onClick={showUploadRecord}
              className={activeSection === "uploadRecord" ? "active" : ""}
            >
              <FiFileText className="icon" /> Télécharger Dossier
            </li>
            <li
              onClick={showGrantPermission}
              className={activeSection === "grantPermission" ? "active" : ""}
            >
              <FiUser className="icon" /> Accorder Permission
            </li>
            <li
              onClick={showDoctorList}
              className={activeSection === "doctorList" ? "active" : ""}
            >
              <FiCalendar className="icon" /> Prendre Rendez-vous
            </li>
            <li
              onClick={showAppointments}
              className={activeSection === "appointments" ? "active" : ""}
            >
              <FiCalendar className="icon" /> Mes Rendez-vous
            </li>
            <li
              onClick={showNotifications}
              className={activeSection === "notifications" ? "active" : ""}
            >
              <FiBell className="icon" /> Notifications
            </li>
          </ul>
        </div>
      </aside>

      <main className="main-content">
        <header className="dashboard-header">
          <h1>Tableau de Bord Patient</h1>
          {patientDetails ? (
            <p className="dashboard-welcome">
              Bienvenue, <span className="patient-name">{patientDetails.name} !</span>
            </p>
          ) : (
            <p className="dashboard-loading">Chargement du profil...</p>
          )}
        </header>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="dynamic-section">{renderActiveSection()}</div>
      </main>
    </div>
  );
};

export default PatientDashBoard;