import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Web3 from "web3";
import AvailabilityABI from "../build/contracts/Availability.json";
import DoctorRegistrationABI from "../build/contracts/DoctorRegistration.json";
import PatientRegistrationABI from "../build/contracts/PatientRegistration.json";
import "../CSS/AppointmentsPage.css";

const AppointmentsPage = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [reservations, setReservations] = useState([]);
  const [creneaux, setCreneaux] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [specialization, setSpecialization] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const initWeb3AndContract = async () => {
      setIsLoading(true);
      setError("");

      if (!window.ethereum) {
        setError("Veuillez installer MetaMask !");
        setIsLoading(false);
        return;
      }

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = AvailabilityABI.networks[networkId];
        if (!deployedNetwork) {
          setError("Contrat Availability non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }

        const contractInstance = new web3Instance.eth.Contract(
          AvailabilityABI.abi,
          deployedNetwork.address
        );
        setContract(contractInstance);

        const deployedDoctorRegistration = DoctorRegistrationABI.networks[networkId];
        if (!deployedDoctorRegistration) {
          setError("Contrat DoctorRegistration non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }
        const doctorInstance = new web3Instance.eth.Contract(
          DoctorRegistrationABI.abi,
          deployedDoctorRegistration.address
        );

        const doctorDetails = await doctorInstance.methods.getDoctorDetails(hhNumber).call();
        if (doctorDetails._walletAddress.toLowerCase() !== accounts[0].toLowerCase()) {
          setError("Vous n'êtes pas le propriétaire de ce hhNumber");
          setIsLoading(false);
          return;
        }

        const doctorSpecialization = doctorDetails._specialization.toLowerCase();
        setSpecialization(doctorSpecialization);

        const creneauxData = await contractInstance.methods
          .getDisponibilites(doctorSpecialization)
          .call();
        const normalizedCreneaux = creneauxData.map((c) => ({
          date: Number(c.date),
          jourSemaine: Number(c.jourSemaine),
          debut: Number(c.debut),
          fin: Number(c.fin),
          dureeConsultation: Number(c.dureeConsultation),
        }));
        setCreneaux(normalizedCreneaux);
      } catch (err) {
        console.error("Erreur initialisation Web3 :", err);
        setError(`Erreur lors de l'initialisation : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initWeb3AndContract();
  }, [hhNumber]);

  useEffect(() => {
    if (contract && account && specialization) {
      fetchReservations(contract);
    }
  }, [contract, account, specialization]);

  const fetchReservations = async (contractInstance) => {
    try {
      const reservationsData = await contractInstance.methods
        .getReservations(specialization)
        .call({ from: account });

      const normalizedReservations = reservationsData.map((r) => ({
        creneauIndex: Number(r.creneauIndex),
        timestampDebut: Number(r.timestampDebut),
        patient: r.patient,
        patientHhNumber: r.patientHhNumber,
        status: Number(r.status),
      }));

      setReservations(normalizedReservations);
    } catch (err) {
      console.error("Erreur récupération réservations :", err);
      setError(`Erreur lors de la récupération des réservations : ${err.message}`);
    }
  };

  const confirmReservation = async (timestampDebut) => {
    try {
      await contract.methods
        .confirmReservation(specialization, timestampDebut)
        .send({ from: account });
      alert("Réservation confirmée avec succès !");
      fetchReservations(contract);
    } catch (err) {
      console.error("Erreur confirmation :", err);
      alert("Erreur lors de la confirmation : " + err.message);
    }
  };

  const cancelReservation = async (timestampDebut) => {
    try {
      await contract.methods
        .cancelReservation(specialization, timestampDebut)
        .send({ from: account });
      alert("Réservation annulée avec succès !");
      fetchReservations(contract);
    } catch (err) {
      console.error("Erreur annulation :", err);
      alert("Erreur lors de l'annulation : " + err.message);
    }
  };

  const viewPatientDetails = async (patientHhNumber) => {
    try {
      const networkId = await web3.eth.net.getId();
      const patientInstance = new web3.eth.Contract(
        PatientRegistrationABI.abi,
        PatientRegistrationABI.networks[networkId].address
      );
      const patientDetails = await patientInstance.methods.getPatientDetails(patientHhNumber).call();
      const isPermitted = await patientInstance.methods
        .isPermissionGranted(patientHhNumber, hhNumber)
        .call();
      if (!isPermitted) {
        alert("Vous n'avez pas la permission d'accéder aux détails de ce patient.");
        return;
      }
      navigate(`/patient/${patientHhNumber}/view`, { state: { patientDetails } });
    } catch (err) {
      console.error("Erreur récupération détails patient :", err);
      alert("Erreur lors de la récupération des détails : " + err.message);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("fr-FR");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  };

  const getCreneauDetails = (creneauIndex) => {
    return creneaux[creneauIndex] || {};
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return "En attente";
      case 1:
        return "Confirmé";
      case 2:
        return "Annulé";
      default:
        return "Inconnu";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 0:
        return "ap-status-pending";
      case 1:
        return "ap-status-confirmed";
      case 2:
        return "ap-status-cancelled";
      default:
        return "";
    }
  };

  const filteredReservations = reservations.filter((reservation) =>
    reservation.patientHhNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ap-container">
      <h2 className="ap-title">Réservations</h2>

      {isLoading && (
        <div className="ap-loading">
          <svg
            className="ap-loading-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Chargement des réservations...
        </div>
      )}
      {error && <p className="ap-error">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="ap-search-section">
            <div className="ap-search-wrapper">
              <input
                type="text"
                placeholder="Rechercher par HH Number du patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ap-search-input"
                aria-label="Rechercher des réservations par HH Number"
              />
              <svg
                className="ap-search-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>

          <div className="ap-list">
            <h3 className="ap-subtitle">Liste des réservations</h3>
            {filteredReservations.length === 0 ? (
              <div className="ap-no-reservations">
                <svg
                  className="ap-empty-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p>Aucune réservation trouvée.</p>
              </div>
            ) : (
              <div className="ap-reservations">
                {filteredReservations
                  .sort((a, b) => a.timestampDebut - b.timestampDebut)
                  .map((reservation, index) => {
                    const creneau = getCreneauDetails(reservation.creneauIndex);
                    const timestampFin =
                      reservation.timestampDebut + (creneau.dureeConsultation || 900);

                    return (
                      <div
                        key={index}
                        className={`ap-reservation-card ${index % 2 === 0 ? "ap-even" : "ap-odd"}`}
                        role="listitem"
                        aria-label={`Réservation pour ${reservation.patientHhNumber}`}
                      >
                        <div className="ap-reservation-details">
                          <p className="ap-reservation-time">
                            <strong>
                              {formatDate(reservation.timestampDebut)} -{" "}
                              {formatTime(reservation.timestampDebut)} à {formatTime(timestampFin)}
                            </strong>
                          </p>
                          <p>
                            <span className="ap-label">Patient :</span>{" "}
                            {reservation.patientHhNumber || "hhNumber non disponible"}
                          </p>
                          <p>
                            <span className="ap-label">Statut :</span>{" "}
                            <span className={`ap-status-badge ${getStatusClass(reservation.status)}`}>
                              {getStatusLabel(reservation.status)}
                            </span>
                          </p>
                          <p>
                            <span className="ap-label">Créneau :</span>{" "}
                            {creneau.jourSemaine !== undefined ? (
                              `(${
                                ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][
                                  creneau.jourSemaine
                                ]
                              } ${formatDate(creneau.debut)} ${formatTime(creneau.debut)}-${formatTime(
                                creneau.fin
                              )})`
                            ) : (
                              "Détails du créneau non disponibles"
                            )}
                          </p>
                        </div>
                        <div className="ap-reservation-actions">
                          {reservation.status === 0 && (
                            <>
                              <button
                                onClick={() => confirmReservation(reservation.timestampDebut)}
                                className="ap-button ap-btn-confirm"
                                aria-label={`Confirmer la réservation pour ${reservation.patientHhNumber}`}
                              >
                                Confirmer
                              </button>
                              <button
                                onClick={() => cancelReservation(reservation.timestampDebut)}
                                className="ap-button ap-btn-cancel"
                                aria-label={`Annuler la réservation pour ${reservation.patientHhNumber}`}
                              >
                                Annuler
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => viewPatientDetails(reservation.patientHhNumber)}
                            className="ap-button ap-btn-view"
                            aria-label={`Voir les détails du patient ${reservation.patientHhNumber}`}
                          >
                            Voir
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentsPage;