import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Web3 from "web3";
import PatientRegistrationABI from "../build/contracts/PatientRegistration.json";
import "../CSS/PatientView.css";

const PatientView = () => {
  const { hhNumber } = useParams(); // hhNumber du patient
  const { state } = useLocation();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [patientContract, setPatientContract] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [doctorHhNumber, setDoctorHhNumber] = useState(""); // hhNumber du médecin connecté

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
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
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

        // Supposons que le hhNumber du médecin est passé via localStorage
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

  const handleDefinePrescription = () => {
    navigate(`/patient/${hhNumber}/prescription`, { state: { doctorHhNumber } });
  };

  return (
    <div className="patient-view-container">
      <h2 className="patient-view-title">Détails du Patient {hhNumber}</h2>

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
          onClick={handleDefinePrescription}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Définir les médicaments
        </button>
        <button
          onClick={() => navigate(`/appointments/${doctorHhNumber}`)}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Retour aux Réservations
        </button>
      </div>
    </div>
  );
};

export default PatientView;