import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Web3 from "web3";
import PatientRegistrationABI from "../build/contracts/PatientRegistration.json";
import PrescriptionABI from "../build/contracts/Prescription.json";
import ClinicalObservationABI from "../build/contracts/ClinicalObservation.json";
import "../CSS/list.css";

const PatientList = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [patientContract, setPatientContract] = useState(null);
  const [prescriptionContract, setPrescriptionContract] = useState(null);
  const [observationContract, setObservationContract] = useState(null);
  const [activePatients, setActivePatients] = useState([]);
  const [revokedPatients, setRevokedPatients] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showRevoked, setShowRevoked] = useState(false);

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

        const patientNetwork = PatientRegistrationABI.networks[networkId];
        if (!patientNetwork) {
          setError("Contrat PatientRegistration non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }
        const patientInstance = new web3Instance.eth.Contract(
          PatientRegistrationABI.abi,
          patientNetwork.address
        );
        setPatientContract(patientInstance);

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
    const fetchPatients = async () => {
      if (!patientContract || !prescriptionContract || !observationContract || !hhNumber) return;

      try {
        const prescriptionPatients = await prescriptionContract.methods
          .getPatientsByDoctor(hhNumber)
          .call();

        const observationPatients = await observationContract.methods
          .getPatientsByDoctor(hhNumber)
          .call();

        const relevantPatientHhNumbers = [...new Set([...prescriptionPatients, ...observationPatients])];

        const activePatientList = await patientContract.methods
          .getPatientList(hhNumber)
          .call();

        const revokedPatientList = await patientContract.methods
          .getRevokedPatients(hhNumber)
          .call();

        const filteredActivePatients = await Promise.all(
          activePatientList.map(async (patient) => {
            if (relevantPatientHhNumbers.includes(patient.patient_number)) {
              return {
                hhNumber: patient.patient_number,
                name: patient.patient_name || patient.patient_number,
              };
            }
            return null;
          })
        );

        const filteredRevokedPatients = await Promise.all(
          revokedPatientList.map(async (patient) => {
            if (relevantPatientHhNumbers.includes(patient.patient_number)) {
              return {
                hhNumber: patient.patient_number,
                name: patient.patient_name || patient.patient_number,
              };
            }
            return null;
          })
        );

        setActivePatients(filteredActivePatients.filter((p) => p !== null));
        setRevokedPatients(filteredRevokedPatients.filter((p) => p !== null));
      } catch (err) {
        console.error("Erreur récupération patients :", err);
        setError("Erreur lors de la récupération de la liste des patients");
      }
    };

    fetchPatients();
  }, [patientContract, prescriptionContract, observationContract, hhNumber]);

  const handleViewPatient = (patientHhNumber) => {
    navigate(`/doctor/${hhNumber}/patient/${patientHhNumber}/details`);
  };

  const handleDeletePatient = async (patientHhNumber) => {
    if (!web3 || !patientContract) {
      setError("Web3 ou contrat non initialisé");
      return;
    }

    try {
      const accounts = await web3.eth.getAccounts();
      await patientContract.methods
        .revokeAccess(hhNumber, patientHhNumber)
        .send({ from: accounts[0] });

      setActivePatients((prev) => prev.filter((p) => p.hhNumber !== patientHhNumber));
      const patient = activePatients.find((p) => p.hhNumber === patientHhNumber);
      if (patient) {
        setRevokedPatients((prev) => [...prev, patient]);
      }
    } catch (err) {
      console.error("Erreur suppression patient :", err);
      setError("Erreur lors de la suppression du patient");
    }
  };

  const handleRestorePatient = async (patientHhNumber) => {
    if (!web3 || !patientContract) {
      setError("Web3 ou contrat non initialisé");
      return;
    }

    try {
      const accounts = await web3.eth.getAccounts();
      await patientContract.methods
        .restoreAccess(hhNumber, patientHhNumber)
        .send({ from: accounts[0] });

      setRevokedPatients((prev) => prev.filter((p) => p.hhNumber !== patientHhNumber));
      const patient = revokedPatients.find((p) => p.hhNumber === patientHhNumber);
      if (patient) {
        setActivePatients((prev) => [...prev, patient]);
      }
    } catch (err) {
      console.error("Erreur restauration patient :", err);
      setError("Erreur lors de la restauration du patient");
    }
  };

  const toggleRevokedPatients = () => {
    setShowRevoked((prev) => !prev);
  };

  return (
    <div className="pl-container">
      <div className="pl-header">
        <h2 className="pl-title">Liste des Patients</h2>
        <button
          onClick={toggleRevokedPatients}
          className="pl-button pl-btn-toggle"
          aria-label={showRevoked ? "Masquer les patients révoqués" : "Afficher les patients révoqués"}
        >
          <svg
            className="pl-btn-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <path d="M20 8v6M23 11h-6"></path>
          </svg>
          {showRevoked ? "Masquer Révoqués" : "Afficher Révoqués"}
        </button>
      </div>

      {isLoading && (
        <div className="pl-loading">
          <svg
            className="pl-loading-icon"
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
      {error && <p className="pl-error" aria-live="polite">{error}</p>}

      {!isLoading && !error && (
        <>
          <div className="pl-section">
            <h3 className="pl-subtitle">Patients Actifs</h3>
            {activePatients.length > 0 ? (
              <div className="pl-patient-list" role="list">
                {activePatients.map((patient, index) => (
                  <div key={index} className="pl-patient-card" role="listitem">
                    <div className="pl-avatar">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="pl-patient-info">
                      <p className="pl-patient-name">{patient.name}</p>
                      <p className="pl-patient-hh">{patient.hhNumber}</p>
                    </div>
                    <div className="pl-patient-actions">
                      <button
                        onClick={() => handleViewPatient(patient.hhNumber)}
                        className="pl-button pl-btn-view"
                        aria-label={`Voir les détails de ${patient.name}`}
                      >
                        <svg
                          className="pl-btn-icon"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Voir
                      </button>
                      <button
                        onClick={() => handleDeletePatient(patient.hhNumber)}
                        className="pl-button pl-btn-delete"
                        aria-label={`Supprimer l'accès de ${patient.name}`}
                      >
                        <svg
                          className="pl-btn-icon"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="pl-no-data">
                <svg
                  className="pl-empty-icon"
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
                <p>Aucun patient actif trouvé.</p>
              </div>
            )}
          </div>

          {showRevoked && (
            <div className="pl-section">
              <h3 className="pl-subtitle">Patients Révoqués</h3>
              {revokedPatients.length > 0 ? (
                <div className="pl-patient-list" role="list">
                  {revokedPatients.map((patient, index) => (
                    <div key={index} className="pl-patient-card pl-revoked" role="listitem">
                      <div className="pl-avatar">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="pl-patient-info">
                        <p className="pl-patient-name">{patient.name}</p>
                        <p className="pl-patient-hh">{patient.hhNumber}</p>
                      </div>
                      <div className="pl-patient-actions">
                        <button
                          onClick={() => handleRestorePatient(patient.hhNumber)}
                          className="pl-button pl-btn-restore"
                          aria-label={`Restaurer l'accès de ${patient.name}`}
                        >
                          <svg
                            className="pl-btn-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M8 16H3v5"></path>
                          </svg>
                          Restaurer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pl-no-data">
                  <svg
                    className="pl-empty-icon"
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
                  <p>Aucun patient révoqué trouvé.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientList;