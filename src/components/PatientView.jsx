import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Web3 from "web3";
import PatientRegistrationABI from "../build/contracts/PatientRegistration.json";
import ClinicalObservationABI from "../build/contracts/ClinicalObservation.json";
import PrescriptionABI from "../build/contracts/Prescription.json";
import "../CSS/PatientView.css";

const PatientView = () => {
  const { hhNumber } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [patientContract, setPatientContract] = useState(null);
  const [observationContract, setObservationContract] = useState(null);
  const [prescriptionContract, setPrescriptionContract] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [doctorHhNumber, setDoctorHhNumber] = useState("");
  const [account, setAccount] = useState("");
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [observation, setObservation] = useState("");
  const [observationError, setObservationError] = useState("");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medication, setMedication] = useState("");
  const [dosesPerDay, setDosesPerDay] = useState(1);
  const [intakeTimes, setIntakeTimes] = useState([]);
  const [durationDays, setDurationDays] = useState(1);
  const [prescriptionError, setPrescriptionError] = useState("");

  const medications = [
    "Paracétamol",
    "Ibuprofène",
    "Amoxicilline",
    "Oméprazole",
    "Atorvastatine",
    "Metformine",
    "Salbutamol",
  ];

  const timeOptions = ["Matin", "Midi", "Soir", "Nuit"];

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

        const deployedPatientRegistration = PatientRegistrationABI.networks[networkId];
        if (!deployedPatientRegistration) {
          setError("Contrat PatientRegistration non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }
        const patientInstance = new web3Instance.eth.Contract(
          PatientRegistrationABI.abi,
          deployedPatientRegistration.address
        );
        setPatientContract(patientInstance);

        const deployedObservation = ClinicalObservationABI.networks[networkId];
        if (!deployedObservation) {
          setError("Contrat ClinicalObservation non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }
        const observationInstance = new web3Instance.eth.Contract(
          ClinicalObservationABI.abi,
          deployedObservation.address
        );
        setObservationContract(observationInstance);

        const deployedPrescription = PrescriptionABI.networks[networkId];
        if (!deployedPrescription) {
          setError("Contrat Prescription non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }
        const prescriptionInstance = new web3Instance.eth.Contract(
          PrescriptionABI.abi,
          deployedPrescription.address
        );
        setPrescriptionContract(prescriptionInstance);

        const storedDoctorHhNumber = localStorage.getItem("doctorHhNumber") || "123456";
        setDoctorHhNumber(storedDoctorHhNumber);
      } catch (err) {
        console.error("Erreur initialisation Web3 :", err);
        setError(`Erreur lors de l'initialisation : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initWeb3AndContract();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!patientContract || !hhNumber || !doctorHhNumber) return;

      try {
        const isPermitted = await patientContract.methods
          .isPermissionGranted(hhNumber, doctorHhNumber)
          .call();
        if (!isPermitted) {
          setError("Vous n'avez pas la permission d'accéder aux dossiers de ce patient.");
          setIsLoading(false);
          return;
        }

        const recordsData = await patientContract.methods
          .getMedicalRecords(hhNumber)
          .call();
        setRecords(recordsData);
      } catch (err) {
        console.error("Erreur récupération dossiers :", err);
        setError("Erreur lors de la récupération des dossiers médicaux");
      }
    };

    fetchRecords();
  }, [patientContract, hhNumber, doctorHhNumber]);

  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("fr-FR");
  };

  const getIpfsUrl = (ipfsHash) => {
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  };

  const handleAddObservation = async (e) => {
    e.preventDefault();
    if (!observationContract || !account) {
      setObservationError("Contrat ou compte non initialisé");
      return;
    }

    if (!observation.trim()) {
      setObservationError("L'observation clinique est requise");
      return;
    }

    try {
      await observationContract.methods
        .addObservation(hhNumber, doctorHhNumber, observation)
        .send({ from: account });
      alert("Observation clinique enregistrée avec succès !");
      setObservation("");
      setObservationError("");
      setShowObservationModal(false);
    } catch (err) {
      console.error("Erreur ajout observation :", err);
      setObservationError(`Erreur lors de l'enregistrement : ${err.message}`);
    }
  };

  const handleIntakeTimeChange = (time) => {
    if (intakeTimes.includes(time)) {
      setIntakeTimes(intakeTimes.filter((t) => t !== time));
    } else if (intakeTimes.length < dosesPerDay) {
      setIntakeTimes([...intakeTimes, time]);
    }
  };

  const handleAddPrescription = async (e) => {
    e.preventDefault();
    if (!prescriptionContract || !account) {
      setPrescriptionError("Contrat ou compte non initialisé");
      return;
    }

    if (!medication || intakeTimes.length === 0 || dosesPerDay < 1 || durationDays < 1) {
      setPrescriptionError("Veuillez remplir tous les champs correctement");
      return;
    }

    try {
      await prescriptionContract.methods
        .addPrescription(
          hhNumber,
          doctorHhNumber,
          medication,
          dosesPerDay,
          intakeTimes,
          durationDays
        )
        .send({ from: account });
      alert("Prescription enregistrée avec succès !");
      setMedication("");
      setDosesPerDay(1);
      setIntakeTimes([]);
      setDurationDays(1);
      setPrescriptionError("");
      setShowPrescriptionModal(false);
    } catch (err) {
      console.error("Erreur ajout prescription :", err);
      setPrescriptionError(`Erreur lors de l'enregistrement : ${err.message}`);
    }
  };

  return (
    <div className="pv-container">
      <h2 className="pv-title">Détails du Patient</h2>

      {isLoading && (
        <div className="pv-loading">
          <svg
            className="pv-loading-icon"
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
      {error && <p className="pv-error">{error}</p>}

      {state?.patientDetails && !error && (
        <div className="pv-details-card">
          <h3 className="pv-subtitle">Informations Personnelles</h3>
          <div className="pv-details-grid">
            <p><span className="pv-label">Nom :</span> {state.patientDetails.name}</p>
            <p><span className="pv-label">Date de Naissance :</span> {state.patientDetails.dateOfBirth}</p>
            <p><span className="pv-label">Genre :</span> {state.patientDetails.gender}</p>
            <p><span className="pv-label">Groupe Sanguin :</span> {state.patientDetails.bloodGroup}</p>
            <p><span className="pv-label">Adresse :</span> {state.patientDetails.homeAddress}</p>
            <p><span className="pv-label">Email :</span> {state.patientDetails.email}</p>
          </div>
        </div>
      )}

      {!error && (
        <div className="pv-records">
          <h3 className="pv-subtitle">Dossiers Médicaux</h3>
          {records.length > 0 ? (
            <div className="pv-records-list">
              {records.map((record, index) => (
                <div key={index} className="pv-record-card" role="listitem">
                  <p><span className="pv-label">Date :</span> {formatDate(record.timestamp)}</p>
                  <p><span className="pv-label">Description :</span> {record.description}</p>
                  <p>
                    <span className="pv-label">Fichier :</span>{" "}
                    <a
                      href={getIpfsUrl(record.ipfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pv-record-link"
                      aria-label={`Voir le fichier médical du ${formatDate(record.timestamp)}`}
                    >
                      Voir le Fichier
                    </a>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="pv-no-records">
              <svg
                className="pv-empty-icon"
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
              <p>Aucun dossier médical trouvé.</p>
            </div>
          )}
        </div>
      )}

      <div className="pv-actions">
        <button
          onClick={() => setShowPrescriptionModal(true)}
          className="pv-button pv-btn-prescription"
          aria-label="Définir une prescription"
        >
          <svg
            className="pv-btn-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"></path>
            <path d="M12 6v6"></path>
            <path d="M9 9h6"></path>
          </svg>
          Définir les Médicaments
        </button>
        <button
          onClick={() => setShowObservationModal(true)}
          className="pv-button pv-btn-observation"
          aria-label="Ajouter une observation clinique"
        >
          <svg
            className="pv-btn-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          Ajouter une Observation
        </button>
        <button
          onClick={() => navigate(`/appointments/${doctorHhNumber}`)}
          className="pv-button pv-btn-back"
          aria-label="Retour aux réservations"
        >
          <svg
            className="pv-btn-icon"
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
          Retour aux Réservations
        </button>
      </div>

      {showObservationModal && (
        <div className="pv-modal-overlay" role="dialog" aria-labelledby="observation-modal-title">
          <div className="pv-modal-content">
            <h3 id="observation-modal-title" className="pv-modal-title">Ajouter une Observation Clinique</h3>
            {observationError && <p className="pv-error">{observationError}</p>}
            <form onSubmit={handleAddObservation}>
              <div className="pv-form-group">
                <label htmlFor="observation" className="pv-form-label">Observation :</label>
                <textarea
                  id="observation"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="pv-form-input pv-textarea"
                  rows="6"
                  required
                  aria-required="true"
                />
              </div>
              <div className="pv-modal-buttons">
                <button type="submit" className="pv-button pv-btn-save" aria-label="Enregistrer l'observation">
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowObservationModal(false);
                    setObservation("");
                    setObservationError("");
                  }}
                  className="pv-button pv-btn-cancel"
                  aria-label="Annuler"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrescriptionModal && (
        <div className="pv-modal-overlay" role="dialog" aria-labelledby="prescription-modal-title">
          <div className="pv-modal-content">
            <h3 id="prescription-modal-title" className="pv-modal-title">Définir une Prescription</h3>
            {prescriptionError && <p className="pv-error">{prescriptionError}</p>}
            <form onSubmit={handleAddPrescription}>
              <div className="pv-form-group">
                <label htmlFor="medication" className="pv-form-label">Médicament :</label>
                <select
                  id="medication"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className="pv-form-input"
                  required
                  aria-required="true"
                >
                  <option value="">Sélectionner un médicament</option>
                  {medications.map((med, index) => (
                    <option key={index} value={med}>{med}</option>
                  ))}
                </select>
              </div>
              <div className="pv-form-group">
                <label htmlFor="dosesPerDay" className="pv-form-label">Nombre de prises par jour :</label>
                <input
                  id="dosesPerDay"
                  type="number"
                  min="1"
                  max="4"
                  value={dosesPerDay}
                  onChange={(e) => setDosesPerDay(Number(e.target.value))}
                  className="pv-form-input"
                  required
                  aria-required="true"
                />
              </div>
              <div className="pv-form-group">
                <label className="pv-form-label">Horaires de prise :</label>
                <div className="pv-checkbox-group">
                  {timeOptions.map((time, index) => (
                    <label key={index} className="pv-checkbox-label">
                      <input
                        type="checkbox"
                        checked={intakeTimes.includes(time)}
                        onChange={() => handleIntakeTimeChange(time)}
                        disabled={
                          !intakeTimes.includes(time) && intakeTimes.length >= dosesPerDay
                        }
                        aria-label={`Sélectionner ${time} comme horaire de prise`}
                      />
                      {time}
                    </label>
                  ))}
                </div>
              </div>
              <div className="pv-form-group">
                <label htmlFor="durationDays" className="pv-form-label">Durée du traitement (jours) :</label>
                <input
                  id="durationDays"
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="pv-form-input"
                  required
                  aria-required="true"
                />
              </div>
              <div className="pv-modal-buttons">
                <button type="submit" className="pv-button pv-btn-save" aria-label="Enregistrer la prescription">
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setMedication("");
                    setDosesPerDay(1);
                    setIntakeTimes([]);
                    setDurationDays(1);
                    setPrescriptionError("");
                  }}
                  className="pv-button pv-btn-cancel"
                  aria-label="Annuler"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientView;