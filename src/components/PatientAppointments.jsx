import React, { useEffect, useState, useRef } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/PatientAppointments.css";
import AvailabilityABI from "../build/contracts/Availability.json";
import PrescriptionABI from "../build/contracts/Prescription.json";
import ClinicalObservationABI from "../build/contracts/ClinicalObservation.json";
import DoctorRegistrationABI from "../build/contracts/DoctorRegistration.json";

const PatientAppointments = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();

  const [web3, setWeb3] = useState(null);
  const [availabilityContract, setAvailabilityContract] = useState(null);
  const [prescriptionContract, setPrescriptionContract] = useState(null);
  const [observationContract, setObservationContract] = useState(null);
  const [doctorContract, setDoctorContract] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [observations, setObservations] = useState([]);
  const [doctorNames, setDoctorNames] = useState({});
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);
  const [showObservationsModal, setShowObservationsModal] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length === 0) {
            await window.ethereum.request({ method: "eth_requestAccounts" });
          }

          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const networkId = await web3Instance.eth.net.getId();

          const availabilityNetwork = AvailabilityABI.networks[networkId];
          if (!availabilityNetwork) {
            setError("Contrat Availability non déployé sur ce réseau");
            return;
          }
          const availabilityInstance = new web3Instance.eth.Contract(
            AvailabilityABI.abi,
            availabilityNetwork.address
          );
          setAvailabilityContract(availabilityInstance);

          const prescriptionNetwork = PrescriptionABI.networks[networkId];
          if (!prescriptionNetwork) {
            setError("Contrat Prescription non déployé sur ce réseau");
            return;
          }
          const prescriptionInstance = new web3Instance.eth.Contract(
            PrescriptionABI.abi,
            prescriptionNetwork.address
          );
          setPrescriptionContract(prescriptionInstance);

          const observationNetwork = ClinicalObservationABI.networks[networkId];
          if (!observationNetwork) {
            setError("Contrat ClinicalObservation non déployé sur ce réseau");
            return;
          }
          const observationInstance = new web3Instance.eth.Contract(
            ClinicalObservationABI.abi,
            observationNetwork.address
          );
          setObservationContract(observationInstance);

          const doctorNetwork = DoctorRegistrationABI.networks[networkId];
          if (!doctorNetwork) {
            setError("Contrat DoctorRegistration non déployé sur ce réseau");
            return;
          }
          const doctorInstance = new web3Instance.eth.Contract(
            DoctorRegistrationABI.abi,
            doctorNetwork.address
          );
          setDoctorContract(doctorInstance);
        } catch (error) {
          console.error("Erreur initialisation Web3 :", error);
          setError("Erreur de connexion à la blockchain");
        } finally {
          setIsLoading(false);
        }
      } else {
        setError("Veuillez installer l'extension MetaMask");
        setIsLoading(false);
      }
    };

    init();
  }, []);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!availabilityContract || !prescriptionContract || !observationContract || !doctorContract || !hhNumber) return;

      setIsLoading(true);
      try {
        const appointmentsData = await availabilityContract.methods
          .getReservationsByPatient(hhNumber)
          .call();
        setAppointments(appointmentsData);

        const doctorNamesMap = {};
        for (const appointment of appointmentsData) {
          if (appointment.doctorHhNumber) {
            try {
              const doctorDetails = await doctorContract.methods
                .getDoctorDetails(appointment.doctorHhNumber)
                .call();
              doctorNamesMap[appointment.doctorHhNumber] = doctorDetails.doctorName || "Médecin inconnu";
            } catch (err) {
              console.error(`Erreur récupération nom médecin ${appointment.doctorHhNumber}:`, err);
              doctorNamesMap[appointment.doctorHhNumber] = "Médecin inconnu";
            }
          }
        }
        setDoctorNames(doctorNamesMap);

        const prescriptionsData = await prescriptionContract.methods
          .getPrescriptions(hhNumber)
          .call();
        setPrescriptions(prescriptionsData);

        const observationsData = await observationContract.methods
          .getObservations(hhNumber)
          .call();
        setObservations(observationsData);
      } catch (error) {
        console.error("Erreur récupération des données patient :", error);
        setError("Échec du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [availabilityContract, prescriptionContract, observationContract, doctorContract, hhNumber]);

  const formatDateTime = (timestamp) => {
    const timestampNum = Number(timestamp);
    if (isNaN(timestampNum) || timestampNum <= 0) {
      return "Date invalide";
    }
    const date = new Date(timestampNum * 1000);
    if (isNaN(date.getTime())) {
      return "Date invalide";
    }
    return `${date.toLocaleDateString("fr-FR")} ${date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const getStatus = (status) => {
    switch (Number(status)) {
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

  const handleCloseModal = (modalType) => {
    if (modalType === "prescriptions") {
      setShowPrescriptionsModal(false);
    } else if (modalType === "observations") {
      setShowObservationsModal(false);
    }
  };

  const handleKeyDown = (e, modalType) => {
    if (e.key === "Escape") {
      handleCloseModal(modalType);
    }
  };

  useEffect(() => {
    if (showPrescriptionsModal || showObservationsModal) {
      modalRef.current?.focus();
    }
  }, [showPrescriptionsModal, showObservationsModal]);

  return (
    <div className="patient-appointments-container">
      <h1 className="appointments-title">Mes Rendez-vous</h1>

      {isLoading && <div className="loading-spinner">Chargement...</div>}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="appointments-section">
        <h2 className="section-title">Rendez-vous</h2> <button
        onClick={() => navigate(`/patient/${hhNumber}`)}
        className="blockhealth-button back-button"
        aria-label="Retour au tableau de bord"
      >
        Retour au Tableau de Bord
      </button>
        {appointments.length > 0 ? (
          <ul className="appointments-list" role="list">
            {appointments.map((appointment, index) => (
              <li
                key={index}
                className="blockhealth-card appointment-item"
                role="listitem"
                aria-label={`Rendez-vous le ${formatDateTime(appointment.timestampDebut)}, statut ${getStatus(appointment.status)}`}
              >
                <p><strong>Date et Heure :</strong> {formatDateTime(appointment.timestampDebut)}</p>
                <p><strong>Statut :</strong> {getStatus(appointment.status)}</p>
                <p><strong>Médecin :</strong> {doctorNames[appointment.doctorHhNumber] || "Médecin inconnu"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-data-message">Aucun rendez-vous trouvé.</p>
        )}
      </div>

      <div className="prescriptions-section">
        <h2 className="section-title">Prescriptions</h2>
        <button
          className="blockhealth-button view-button"
          onClick={() => setShowPrescriptionsModal(true)}
          aria-label="Voir les prescriptions"
        >
          Voir Prescriptions
        </button>
        {showPrescriptionsModal && (
          <div
            className="modal-overlay"
            onClick={() => handleCloseModal("prescriptions")}
            onKeyDown={(e) => handleKeyDown(e, "prescriptions")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prescriptions-modal-title"
            tabIndex={-1}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              ref={modalRef}
            >
              <h3 id="prescriptions-modal-title" className="modal-title">Prescriptions</h3>
              {prescriptions.length > 0 ? (
                <ul className="prescriptions-list" role="list">
                  {prescriptions.map((prescription, index) => (
                    <li
                      key={index}
                      className="blockhealth-card prescription-item"
                      role="listitem"
                      aria-label={`Prescription datée du ${formatDateTime(prescription.timestamp)} pour ${prescription.medication}`}
                    >
                      <p><strong>Date :</strong> {formatDateTime(prescription.timestamp)}</p>
                      <p><strong>Médicament :</strong> {prescription.medication}</p>
                      <p><strong>Prises par jour :</strong> {prescription.dosesPerDay}</p>
                      <p><strong>Horaires :</strong> {prescription.intakeTimes.join(", ")}</p>
                      <p><strong>Durée :</strong> {prescription.durationDays} jours</p>
                      <p><strong>Médecin :</strong> {doctorNames[prescription.doctorHhNumber] || prescription.doctorHhNumber}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data-message">Aucune prescription trouvée.</p>
              )}
              <button
                className="blockhealth-button close-button"
                onClick={() => handleCloseModal("prescriptions")}
                aria-label="Fermer la fenêtre des prescriptions"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="observations-section">
        <h2 className="section-title">Observations Cliniques</h2>
        <button
          className="blockhealth-button view-button"
          onClick={() => setShowObservationsModal(true)}
          aria-label="Voir les observations cliniques"
        >
          Voir Observations 
        </button>
        {showObservationsModal && (
          <div
            className="modal-overlay"
            onClick={() => handleCloseModal("observations")}
            onKeyDown={(e) => handleKeyDown(e, "observations")}
            role="dialog"
            aria-modal="true"
            aria-labelledby="observations-modal-title"
            tabIndex={-1}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              ref={modalRef}
            >
              <h3 id="observations-modal-title" className="modal-title">Observations Cliniques</h3>
              {observations.length > 0 ? (
                <ul className="observations-list" role="list">
                  {observations.map((observation, index) => (
                    <li
                      key={index}
                      className="blockhealth-card observation-item"
                      role="listitem"
                      aria-label={`Observation clinique datée du ${formatDateTime(observation.timestamp)}`}
                    >
                      <p><strong>Date :</strong> {formatDateTime(observation.timestamp)}</p>
                      <p><strong>Description :</strong> {observation.description}</p>
                      <p><strong>Médecin :</strong> {doctorNames[observation.doctorHhNumber] || observation.doctorHhNumber}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data-message">Aucune observation clinique trouvée.</p>
              )}
              <button
                className="blockhealth-button close-button"
                onClick={() => handleCloseModal("observations")}
                aria-label="Fermer la fenêtre des observations cliniques"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>

     
    </div>
  );
};

export default PatientAppointments;