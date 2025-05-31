import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Web3 from "web3";
import PrescriptionABI from "../build/contracts/Prescription.json";
import ClinicalObservationABI from "../build/contracts/ClinicalObservation.json";
import "../CSS/PatientDetails.css";

const PatientDetails = () => {
  const { doctorHhNumber, patientHhNumber } = useParams();
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
        const prescriptionData = await prescriptionContract.methods
          .getPrescriptionsByDoctor(patientHhNumber, doctorHhNumber)
          .call();
        setPrescriptions(prescriptionData);

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
    <div className="pd-container">
      <h2 className="pd-title">Détails du Patient</h2>

      {isLoading && (
        <div className="pd-loading">
          <svg
            className="pd-loading-icon"
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
          Chargement...
        </div>
      )}
      {error && <p className="pd-error" aria-live="polite">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="pd-prescriptions-section">
            <h3 className="pd-subtitle">Prescriptions</h3>
            {prescriptions.length > 0 ? (
              <div className="pd-prescription-list" role="list">
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="pd-prescription-card" role="listitem">
                    <p><span className="pd-label">Médicament :</span> {prescription.medication}</p>
                    <p><span className="pd-label">Doses par jour :</span> {prescription.dosesPerDay}</p>
                    <p><span className="pd-label">Horaires :</span> {prescription.intakeTimes.join(", ")}</p>
                    <p><span className="pd-label">Durée (jours) :</span> {prescription.durationDays}</p>
                    <p><span className="pd-label">Date :</span> {formatDate(prescription.timestamp)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pd-no-data">
                <svg
                  className="pd-empty-icon"
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
                <p>Aucune prescription trouvée.</p>
              </div>
            )}
          </div>

          <div className="pd-observations-section">
            <h3 className="pd-subtitle">Observations Cliniques</h3>
            {observations.length > 0 ? (
              <div className="pd-observation-list" role="list">
                {observations.map((observation, index) => (
                  <div key={index} className="pd-observation-card" role="listitem">
                    <p><span className="pd-label">Description :</span> {observation.description}</p>
                    <p><span className="pd-label">Date :</span> {formatDate(observation.timestamp)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pd-no-data">
                <svg
                  className="pd-empty-icon"
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
                <p>Aucune observation clinique trouvée.</p>
              </div>
            )}
          </div>

          <div className="pd-actions">
            <button
              onClick={handleBack}
              className="pd-button pd-btn-back"
              aria-label="Retour à la liste des patients"
            >
              <svg
                className="pd-btn-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Retour à la Liste
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientDetails;