import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { FiHome, FiUser, FiUsers, FiCalendar, FiClock } from "react-icons/fi";
import NavBar_Logout from "./NavBar_Logout";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import Availability from "./Availability";
import ViewDoctorProfile from "./ViewDoctorProfile";
import PatientList from "./PatientList";
import AppointmentsPage from "./AppointmentsPage";
import "../CSS/DoctorDashBoard.css";

const DoctorDashBoardPage = () => {
  const { hhNumber, specialization } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [storedHhNumber, setStoredHhNumber] = useState(hhNumber || localStorage.getItem("hhNumber"));
  const [menuOpen, setMenuOpen] = useState(false); // État pour le menu orbital

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);

      if (location.pathname.startsWith("/availability/")) {
        setIsLoading(false);
        return;
      }

      if (!hhNumber || hhNumber === "undefined") {
        setError("Identifiant du médecin invalide");
        setIsLoading(false);
        navigate("/error");
        return;
      }

      if (!window.ethereum) {
        setError("Veuillez installer l'extension MetaMask");
        setIsLoading(false);
        return;
      }

      try {
        const web3Instance = new Web3(window.ethereum);
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = DoctorRegistration.networks[networkId];
        if (!deployedNetwork) {
          throw new Error("Contrat DoctorRegistration non déployé sur ce réseau");
        }
        const contractInstance = new web3Instance.eth.Contract(
          DoctorRegistration.abi,
          deployedNetwork.address
        );
        setContract(contractInstance);

        const result = await contractInstance.methods.getDoctorDetails(hhNumber).call();
        setDoctorDetails(result);
        setStoredHhNumber(hhNumber);
        localStorage.setItem("hhNumber", hhNumber);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de Web3 ou de la récupération des détails du docteur :", error);
        setError("Médecin non enregistré ou erreur de connexion au contrat");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [hhNumber, navigate, location.pathname]);

  useEffect(() => {
    const pathname = location.pathname;
    const effectiveHhNumber = hhNumber || storedHhNumber;
    if (pathname === `/doctor/${effectiveHhNumber}`) {
      setActiveSection("dashboard");
    } else if (pathname === `/doctor/${effectiveHhNumber}/viewdoctorprofile`) {
      setActiveSection("profile");
    } else if (pathname === `/doctor/${effectiveHhNumber}/patientlist`) {
      setActiveSection("patients");
    } else if (pathname.startsWith(`/availability/`)) {
      setActiveSection("availability");
    } else if (pathname === `/doctor/${effectiveHhNumber}/appointments`) {
      setActiveSection("appointments");
    }
  }, [location.pathname, hhNumber, storedHhNumber]);

  const renderActiveSection = () => {
    if (isLoading) {
      return <p className="dashboard-loading">Chargement des détails...</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }

    switch (activeSection) {
      case "profile":
        return <ViewDoctorProfile hhNumber={hhNumber || storedHhNumber} />;
      case "patients":
        return <PatientList hhNumber={hhNumber || storedHhNumber} />;
      case "availability":
        return (
          <Availability
            specialization={specialization || (doctorDetails ? doctorDetails[6].toLowerCase() : "cardiologie")}
            hhNumber={storedHhNumber}
          />
        );
      case "appointments":
        return <AppointmentsPage hhNumber={hhNumber || storedHhNumber} />;
      case "dashboard":
      default:
        return (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Activités Récentes</h3>
              <p>Vos interactions médicales récentes apparaîtront ici.</p>
            </div>
            <div className="dashboard-card">
              <h3>Résumé des Patients</h3>
              <p>Les informations sur vos patients seront affichées ici.</p>
            </div>
            <div className="dashboard-card">
              <h3>Rendez-vous à Venir</h3>
              <p>Vos rendez-vous programmés apparaîtront ici.</p>
            </div>
          </div>
        );
    }
  };

  const isNavigationDisabled = !storedHhNumber || storedHhNumber === "undefined" || isLoading || error;

  return (
    <div className="dashboard-container">
      <button className="sidebar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <FiHome className="icon" />
      </button>
      <aside className={`dashboard-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title"></h3>
          <br />
          <br />
          <br />
        </div>
        <ul className="sidebar-menu">
          <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/doctor/${storedHhNumber}`}
              className={`menu-link ${activeSection === "dashboard" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("dashboard");
                navigate(`/doctor/${storedHhNumber}`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiHome /></span>
              Dashboard
            </Link>

          </li>
          
          <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/doctor/${storedHhNumber}/viewdoctorprofile`}
              className={`menu-link ${activeSection === "profile" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("profile");
                navigate(`/doctor/${storedHhNumber}/viewdoctorprofile`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiUser /></span>
              My Profile
            </Link>
          </li>
         
        
          <li className="menu-item">
            <Link
              to={isLoading || error ? "#" : `/availability/${doctorDetails ? doctorDetails[6].toLowerCase() : "cardiologie"}`}
              className={`menu-link ${activeSection === "availability" ? "active" : ""} ${isLoading || error ? "disabled" : ""}`}
              onClick={(e) => {
                if (isLoading || error) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("availability");
                navigate(`/availability/${doctorDetails ? doctorDetails[6].toLowerCase() : "cardiologie"}`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiCalendar /></span>
              Mes disponibilités
            </Link>
          </li>
            <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/doctor/${storedHhNumber}/patientlist`}
              className={`menu-link ${activeSection === "patients" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("patients");
                navigate(`/doctor/${storedHhNumber}/patientlist`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiUsers /></span>
              Liste Patients
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/doctor/${storedHhNumber}/appointments`}
              className={`menu-link ${activeSection === "appointments" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("appointments");
                navigate(`/doctor/${storedHhNumber}/appointments`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiClock /></span>
             Reservation des rendez-vous
            </Link>
          </li>
        </ul>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Tableau de Bord Médecin</h1>
          {doctorDetails && !error ? (
            <p className="dashboard-welcome">
              Bienvenue, <span className="doctor-name">Dr. {doctorDetails[1]}</span> !
            </p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <p className="dashboard-loading">Chargement des détails...</p>
          )}
        </header>
        <div className="dynamic-section">{renderActiveSection()}</div>
      </main>
    </div>
  );
};

export default DoctorDashBoardPage;