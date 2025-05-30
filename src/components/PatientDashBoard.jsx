import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import "../CSS/PatientDashboard.css";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import Availability from "../build/contracts/Availability.json";
import { FiUser, FiFileText, FiHome, FiBell, FiCalendar, FiX } from "react-icons/fi";
import ViewProfile from "./ViewProfile";
import ViewPatientRecords from "./ViewPatientRecords";
import UploadRecord from "./UploadRecord";
import GrantPermission from "./GrantPermission";
import DoctorList from "./DoctorList";
import PatientAppointments from "./PatientAppointments";

const PatientDashBoard = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storedHhNumber, setStoredHhNumber] = useState(hhNumber || localStorage.getItem("hhNumber"));
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [availabilityContract, setAvailabilityContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);

      if (!hhNumber || hhNumber === "undefined") {
        setError("Identifiant du patient invalide");
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
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length === 0) {
          await window.ethereum.request({ method: "eth_requestAccounts" });
        }

        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = PatientRegistration.networks[networkId];
        if (!deployedNetwork) {
          throw new Error("Contrat PatientRegistration non déployé sur ce réseau");
        }
        const contractInstance = new web3Instance.eth.Contract(
          PatientRegistration.abi,
          deployedNetwork.address
        );
        setContract(contractInstance);

        const result = await contractInstance.methods.getPatientDetails(hhNumber).call();
        setPatientDetails(result);
        setStoredHhNumber(hhNumber);
        localStorage.setItem("hhNumber", hhNumber);

        const availabilityNetwork = Availability.networks[networkId];
        if (!availabilityNetwork) {
          throw new Error("Contrat Availability non déployé sur ce réseau");
        }
        const availabilityContractInstance = new web3Instance.eth.Contract(
          Availability.abi,
          availabilityNetwork.address
        );
        setAvailabilityContract(availabilityContractInstance);

        const reservationsData = await availabilityContractInstance.methods
          .getReservationsByPatient(hhNumber)
          .call();
        setReservations(reservationsData);
        console.log("Réservations initiales :", reservationsData);
      } catch (error) {
        console.error("Erreur d'initialisation ou récupération :", error);
        setError("Patient non enregistré ou erreur de connexion au contrat");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [hhNumber, navigate]);

  useEffect(() => {
    const pathname = location.pathname;
    const effectiveHhNumber = hhNumber || storedHhNumber;
    if (pathname === `/patient/${effectiveHhNumber}`) {
      setActiveSection("dashboard");
    } else if (pathname === `/patient/${effectiveHhNumber}/viewprofile`) {
      setActiveSection("profile");
    } else if (pathname === `/patient/${effectiveHhNumber}/viewrecords`) {
      setActiveSection("records");
    } else if (pathname === `/patient/${effectiveHhNumber}/uploadrecord`) {
      setActiveSection("uploadRecord");
    } else if (pathname === `/patient/${effectiveHhNumber}/grantpermission`) {
      setActiveSection("grantPermission");
    } else if (pathname === `/doctors/${effectiveHhNumber}`) {
      setActiveSection("doctorList");
    } else if (pathname === `/patient/${effectiveHhNumber}/appointments`) {
      setActiveSection("appointments");
    }
  }, [location.pathname, hhNumber, storedHhNumber]);

  useEffect(() => {
    const fetchReservations = async () => {
      if (!availabilityContract || !hhNumber) return;
      try {
        const reservationsData = await availabilityContract.methods
          .getReservationsByPatient(hhNumber)
          .call();
        setReservations(reservationsData);
        console.log("Réservations mises à jour :", reservationsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des réservations :", error);
      }
    };

    const interval = setInterval(fetchReservations, 2 * 1000); // Réduit à 2 secondes
    fetchReservations();

    return () => clearInterval(interval);
  }, [availabilityContract, hhNumber]);

  useEffect(() => {
    const checkReminders = () => {
      const newNotifications = [];

      console.log("Vérification des rappels, réservations actuelles :", reservations);

      reservations.forEach((res, index) => {
        const appointmentDate = new Date(Number(res.timestampDebut) * 1000).toLocaleString("fr-FR", {
          dateStyle: "medium",
          timeStyle: "short",
        });
        newNotifications.push(
          `N’oubliez pas votre rendez-vous le ${appointmentDate}.`
        );
        console.log(`Notification ajoutée : N’oubliez pas votre rendez-vous le ${appointmentDate}.`);
      });

      setNotifications(newNotifications);
      console.log("Notifications mises à jour :", newNotifications);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60 * 1000);
    return () => clearInterval(interval);
  }, [reservations]);

  const handleNotificationClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const renderActiveSection = () => {
    if (isLoading) {
      return <p className="dashboard-loading">Chargement des détails...</p>;
    }
    if (error) {
      return <p className="error-message">{error}</p>;
    }

    switch (activeSection) {
      case "profile":
        return <ViewProfile hhNumber={hhNumber || storedHhNumber} />;
      case "records":
        return <ViewPatientRecords hhNumber={hhNumber || storedHhNumber} />;
      case "uploadRecord":
        return <UploadRecord hhNumber={hhNumber || storedHhNumber} />;
      case "grantPermission":
        return <GrantPermission hhNumber={hhNumber || storedHhNumber} />;
      case "doctorList":
        return <DoctorList hhNumber={hhNumber || storedHhNumber} />;
      case "appointments":
        return <PatientAppointments hhNumber={hhNumber || storedHhNumber} />;
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

  const isNavigationDisabled = !storedHhNumber || storedHhNumber === "undefined" || isLoading || error;

  return (
    <div className="dashboard-container">
      <button className="sidebar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <FiHome className="icon" />
      </button>
      <aside className={`dashboard-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title"></h2>
        </div>
        <br />
        <br />
        <ul className="sidebar-menu">
          <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/patient/${storedHhNumber}`}
              className={`menu-link ${activeSection === "dashboard" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("dashboard");
                navigate(`/patient/${storedHhNumber}`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiHome /></span> Tableau de Bord
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/patient/${storedHhNumber}/viewprofile`}
              className={`menu-link ${activeSection === "profile" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("profile");
                navigate(`/patient/${storedHhNumber}/viewprofile`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiUser /></span> Mon Profil
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/patient/${storedHhNumber}/viewrecords`}
              className={`menu-link ${activeSection === "records" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("records");
                navigate(`/patient/${storedHhNumber}/viewrecords`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiFileText /></span> Dossiers Médicaux
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/patient/${storedHhNumber}/uploadrecord`}
              className={`menu-link ${activeSection === "uploadRecord" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("uploadRecord");
                navigate(`/patient/${storedHhNumber}/uploadrecord`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiFileText /></span> Télécharger Dossier
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/patient/${storedHhNumber}/grantpermission`}
              className={`menu-link ${activeSection === "grantPermission" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("grantPermission");
                navigate(`/patient/${storedHhNumber}/grantpermission`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiUser /></span> Accorder Permission
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/doctors/${storedHhNumber}`}
              className={`menu-link ${activeSection === "doctorList" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("doctorList");
                navigate(`/doctors/${storedHhNumber}`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiCalendar /></span> Prendre Rendez-vous
            </Link>
          </li>
          <li className="menu-item">
            <Link
              to={isNavigationDisabled ? "#" : `/patient/${storedHhNumber}/appointments`}
              className={`menu-link ${activeSection === "appointments" ? "active" : ""} ${isNavigationDisabled ? "disabled" : ""}`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                setActiveSection("appointments");
                navigate(`/patient/${storedHhNumber}/appointments`);
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiCalendar /></span> Mes Rendez-vous
            </Link>
          </li>
          <li className="menu-item">
            <div
              className={`menu-link ${isNavigationDisabled ? "disabled" : ""} ${
                notifications.length > 0 ? "has-notifications" : ""
              }`}
              onClick={(e) => {
                if (isNavigationDisabled) {
                  e.preventDefault();
                  return;
                }
                handleNotificationClick();
                setMenuOpen(false);
              }}
            >
              <span className="menu-icon"><FiBell /></span> Notifications
              {notifications.length > 0 && (
                <span className="notification-badge">{notifications.length}</span>
              )}
            </div>
          </li>
        </ul>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Tableau de Bord Patient</h1>
          {patientDetails && !error ? (
            <p className="dashboard-welcome">
              Bienvenue, <span className="patient-name">{patientDetails.name} !</span>
            </p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <p className="dashboard-loading">Chargement du profil...</p>
          )}
        </header>
        <div className="dynamic-section">{renderActiveSection()}</div>
        {showPopup && (
          <div className="popup-overlay" onClick={closePopup}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <button className="popup-close" onClick={closePopup}>
                <FiX />
              </button>
              <h3>Rappel de Rendez-vous</h3>
              {notifications.length > 0 ? (
                <ul>
                  {notifications.map((msg, index) => (
                    <li key={index} className="notification-item">
                      {msg}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucune notification pour le moment.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientDashBoard;