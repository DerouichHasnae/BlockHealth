import React, { useEffect, useState } from "react";
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

          // Initialize Availability
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

          // Initialize Prescription
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

          // Initialize ClinicalObservation
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

          // Initialize DoctorRegistration
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
        }
      } else {
        setError("Veuillez installer l'extension MetaMask");
      }
    };

    init();
  }, []);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!availabilityContract || !prescriptionContract || !observationContract || !doctorContract || !hhNumber) return;

      try {
        // Fetch appointments
        const appointmentsData = await availabilityContract.methods
          .getReservationsByPatient(hhNumber)
          .call();
        setAppointments(appointmentsData);

        // Fetch doctor names for each appointment
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

        // Fetch prescriptions
        const prescriptionsData = await prescriptionContract.methods
          .getPrescriptions(hhNumber)
          .call();
        setPrescriptions(prescriptionsData);

        // Fetch clinical observations
        const observationsData = await observationContract.methods
          .getObservations(hhNumber)
          .call();
        setObservations(observationsData);
      } catch (error) {
        console.error("Erreur récupération des données patient :", error);
        setError("Échec du chargement des données");
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

  return (
    <div className="appointments-container">
      <h1 className="appointments-title">Mes Rendez-vous</h1>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="appointments-section">
        <h2>Rendez-vous</h2>
        {appointments.length > 0 ? (
          <ul className="appointments-list">
            {appointments.map((appointment, index) => (
              <li key={index} className="appointment-item">
                <p><strong>Date et Heure :</strong> {formatDateTime(appointment.timestampDebut)}</p>
                <p><strong>Statut :</strong> {getStatus(appointment.status)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun rendez-vous trouvé.</p>
        )}
      </div>

      <div className="prescriptions-section">
        <h2>Prescriptions</h2>
        {prescriptions.length > 0 ? (
          <ul className="prescriptions-list">
            {prescriptions.map((prescription, index) => (
              <li key={index} className="prescription-item">
                <p><strong>Date :</strong> {formatDateTime(prescription.timestamp)}</p>
                <p><strong>Médicament :</strong> {prescription.medication}</p>
                <p><strong>Prises par jour :</strong> {prescription.dosesPerDay}</p>
                <p><strong>Horaires :</strong> {prescription.intakeTimes.join(", ")}</p>
                <p><strong>Durée :</strong> {prescription.durationDays} jours</p>
                <p><strong>Médecin :</strong> {prescription.doctorHhNumber}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucune prescription trouvée.</p>
        )}
      </div>

      <div className="observations-section">
        <h2>Observations Cliniques</h2>
        {observations.length > 0 ? (
          <ul className="observations-list">
            {observations.map((observation, index) => (
              <li key={index} className="observation-item">
                <p><strong>Date :</strong> {formatDateTime(observation.timestamp)}</p>
                <p><strong>Description :</strong> {observation.description}</p>
                <p><strong>Médecin :</strong> {observation.doctorHhNumber}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucune observation clinique trouvée.</p>
        )}
      </div>

      <button
        onClick={() => navigate(`/patient/${hhNumber}`)}
        className="back-button"
      >
        Retour au Tableau de Bord
      </button>
    </div>
  );
};

export default PatientAppointments;