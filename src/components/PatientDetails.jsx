import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Web3 from "web3";
import PrescriptionABI from "../build/contracts/Prescription.json";
import ClinicalObservationABI from "../build/contracts/ClinicalObservation.json";
import "../CSS/PatientDetails.css";

const PatientDetails = () => {
  const { doctorHhNumber, patientHhNumber } = useParams(); // doctorHhNumber et patientHhNumber
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [prescriptionContract, setPrescriptionContract] = useState(null);
  const [observationContract, setObservationContract] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [observations, setObservations] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initWeb3AndContracts = async () => {
      setIsLoading(true);
      setError("");

      if (!window.ethereum) {
        setError("Veuillez installer MetaMask !");
        setIsLoading(false);
        return;
      }

      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();

        // Initialiser Prescription
        const prescriptionNetwork = PrescriptionABI.networks[networkId];
        if (!prescriptionNetwork) {
          setError("Contrat Prescription non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }
        const prescriptionInstance = new web3Instance.eth.Contract(
          PrescriptionABI.abi,
          prescriptionNetwork.address
        );
        setPrescriptionContract(prescriptionInstance);

        // Initialiser ClinicalObservation
        const observationNetwork = ClinicalObservationABI.networks[networkId];
        if (!observationNetwork) {
          setError("Contrat ClinicalObservation non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }
        const observationInstance = new web3Instance.eth.Contract(
          ClinicalObservationABI.abi,
          observationNetwork.address
        );
        setObservationContract(observationInstance);
      } catch (err) {
        console.error("Erreur initialisation Web3 :", err);
        setError(`Erreur lors de l'initialisation : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initWeb3AndContracts();
  }, []);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!prescriptionContract || !observationContract || !patientHhNumber || !doctorHhNumber) return;

      try {
        // Récupérer les prescriptions du patient pour ce médecin
        const prescriptionData = await prescriptionContract.methods
          .getPrescriptionsByDoctor(patientHhNumber, doctorHhNumber)
          .call();
        setPrescriptions(prescriptionData);

        // Récupérer les observations cliniques du patient pour ce médecin
        const observationData = await observationContract.methods
          .getObservationsByDoctor(patientHhNumber, doctorHhNumber)
          .call();
        setObservations(observationData);
      } catch (err) {
        console.error("Erreur récupération données patient :", err);
        setError("Erreur lors de la récupération des prescriptions ou observations");
      }
    };

    fetchPatientData();
  }, [prescriptionContract, observationContract, patientHhNumber, doctorHhNumber]);

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("fr-FR");
  };

  const handleBack = () => {
    navigate(`/doctor/${doctorHhNumber}/patientlist`);
  };

  return (
    <div className="patient-details-container">
      <h2 className="patient-details-title">Détails du Patient </h2>

      {isLoading && <p className="loading-message">Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="prescriptions-section">
            <h3>Prescriptions</h3>
            {prescriptions.length > 0 ? (
              <ul className="prescription-list">
                {prescriptions.map((prescription, index) => (
                  <li key={index} className="prescription-item">
                    <p><strong>Médicament :</strong> {prescription.medication}</p>
                    <p><strong>Doses par jour :</strong> {prescription.dosesPerDay}</p>
                    <p><strong>Horaires :</strong> {prescription.intakeTimes.join(", ")}</p>
                    <p><strong>Durée (jours) :</strong> {prescription.durationDays}</p>
                    <p><strong>Date :</strong> {formatDate(prescription.timestamp)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune prescription trouvée.</p>
            )}
          </div>

          <div className="observations-section">
            <h3>Observations Cliniques</h3>
            {observations.length > 0 ? (
              <ul className="observation-list">
                {observations.map((observation, index) => (
                  <li key={index} className="observation-item">
                    <p><strong>Description :</strong> {observation.description}</p>
                    <p><strong>Date :</strong> {formatDate(observation.timestamp)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune observation clinique trouvée.</p>
            )}
          </div>

          <div className="action-buttons">
            <button onClick={handleBack} className="back-button">
              Retour à la liste
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDetails;