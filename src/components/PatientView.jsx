import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Web3 from "web3";
import PatientRegistrationABI from "../build/contracts/PatientRegistration.json";
import ClinicalObservationABI from "../build/contracts/ClinicalObservation.json";
import PrescriptionABI from "../build/contracts/Prescription.json";
import "../CSS/PatientView.css";

const PatientView = () => {
  const { hhNumber } = useParams(); // hhNumber du patient
  const { state } = useLocation();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [patientContract, setPatientContract] = useState(null);
  const [observationContract, setObservationContract] = useState(null);
  const [prescriptionContract, setPrescriptionContract] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [doctorHhNumber, setDoctorHhNumber] = useState(""); // hhNumber du médecin connecté
  const [account, setAccount] = useState(""); // Compte MetaMask
  // États pour la modale d'observation
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [observation, setObservation] = useState("");
  const [observationError, setObservationError] = useState("");
  // États pour la modale de prescription
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [medication, setMedication] = useState("");
  const [dosesPerDay, setDosesPerDay] = useState(1);
  const [intakeTimes, setIntakeTimes] = useState([]);
  const [durationDays, setDurationDays] = useState(1);
  const [prescriptionError, setPrescriptionError] = useState("");

  // Liste de médicaments prédéfinis
  const medications = [
    "Paracétamol",
    "Ibuprofène",
    "Amoxicilline",
    "Oméprazole",
    "Atorvastatine",
    "Metformine",
    "Salbutamol",
  ];

  // Options pour les horaires de prise
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

        // Initialiser PatientRegistration
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

        // Initialiser ClinicalObservation
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

        // Initialiser Prescription
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

        // Récupérer le hhNumber du médecin
        const storedDoctorHhNumber = localStorage.getItem("doctorHhNumber") || "123456"; // À remplacer
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
        // Vérifier si le médecin a la permission
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
    <div className="patient-view-container">
      <h2 className="patient-view-title">Détails du Patient </h2>

      {isLoading && <p className="loading-message">Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      {state?.patientDetails && !error && (
        <div className="patient-details">
          <h3>Informations Personnelles</h3>
          <p><strong>Nom :</strong> {state.patientDetails.name}</p>
          <p><strong>Date de Naissance :</strong> {state.patientDetails.dateOfBirth}</p>
          <p><strong>Genre :</strong> {state.patientDetails.gender}</p>
          <p><strong>Groupe Sanguin :</strong> {state.patientDetails.bloodGroup}</p>
          <p><strong>Adresse :</strong> {state.patientDetails.homeAddress}</p>
          <p><strong>Email :</strong> {state.patientDetails.email}</p>
        </div>
      )}

      {!error && (
        <div className="patient-records">
          <h3>Dossiers Médicaux</h3>
          {records.length > 0 ? (
            <ul>
              {records.map((record, index) => (
                <li key={index} className="record-item">
                  <p><strong>Date :</strong> {formatDate(record.timestamp)}</p>
                  <p><strong>Description :</strong> {record.description}</p>
                  <p>
                    <strong>Fichier :</strong>{" "}
                    <a
                      href={getIpfsUrl(record.ipfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="record-link"
                    >
                      View File
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Aucun dossier médical trouvé.</p>
          )}
        </div>
      )}

      <div className="action-buttons">
        <button
          onClick={() => setShowPrescriptionModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Définir les médicaments
        </button>
        <button
          onClick={() => setShowObservationModal(true)}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2"
        >
          Ajouter une observation clinique
        </button>
        <button
          onClick={() => navigate(`/appointments/${doctorHhNumber}`)}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Retour aux Réservations
        </button>
      </div>

      {showObservationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Ajouter une Observation Clinique</h3>
            {observationError && <p className="error-message">{observationError}</p>}
            <form onSubmit={handleAddObservation}>
              <div className="form-group">
                <label htmlFor="observation">Observation :</label>
                <textarea
                  id="observation"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="form-input"
                  rows="5"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowObservationModal(false);
                    setObservation("");
                    setObservationError("");
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPrescriptionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Définir une Prescription</h3>
            {prescriptionError && <p className="error-message">{prescriptionError}</p>}
            <form onSubmit={handleAddPrescription}>
              <div className="form-group">
                <label htmlFor="medication">Médicament :</label>
                <select
                  id="medication"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Sélectionner un médicament</option>
                  {medications.map((med, index) => (
                    <option key={index} value={med}>{med}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="dosesPerDay">Nombre de prises par jour :</label>
                <input
                  id="dosesPerDay"
                  type="number"
                  min="1"
                  max="4"
                  value={dosesPerDay}
                  onChange={(e) => setDosesPerDay(Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Horaires de prise :</label>
                <div className="checkbox-group">
                  {timeOptions.map((time, index) => (
                    <label key={index} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={intakeTimes.includes(time)}
                        onChange={() => handleIntakeTimeChange(time)}
                        disabled={
                          !intakeTimes.includes(time) && intakeTimes.length >= dosesPerDay
                        }
                      />
                      {time}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="durationDays">Durée du traitement (jours) :</label>
                <input
                  id="durationDays"
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
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
                  className="bg-gray-500 text-white px-4 py-2 rounded"
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