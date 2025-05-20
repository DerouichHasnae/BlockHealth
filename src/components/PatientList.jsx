import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Web3 from "web3";
import PatientRegistrationABI from "../build/contracts/PatientRegistration.json";
import PrescriptionABI from "../build/contracts/Prescription.json";
import ClinicalObservationABI from "../build/contracts/ClinicalObservation.json";
import "../CSS/PatientList.css";

const PatientList = () => {
  const { hhNumber } = useParams(); // hhNumber du médecin
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [patientContract, setPatientContract] = useState(null);
  const [prescriptionContract, setPrescriptionContract] = useState(null);
  const [observationContract, setObservationContract] = useState(null);
  const [activePatients, setActivePatients] = useState([]);
  const [revokedPatients, setRevokedPatients] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showRevoked, setShowRevoked] = useState(false); // État pour afficher/masquer les patients révoqués

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

        // Initialiser PatientRegistration
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
    const fetchPatients = async () => {
      if (!patientContract || !prescriptionContract || !observationContract || !hhNumber) return;

      try {
        // Récupérer les patients avec prescriptions
        const prescriptionPatients = await prescriptionContract.methods
          .getPatientsByDoctor(hhNumber)
          .call();

        // Récupérer les patients avec observations
        const observationPatients = await observationContract.methods
          .getPatientsByDoctor(hhNumber)
          .call();

        // Fusionner et supprimer les doublons
        const relevantPatientHhNumbers = [...new Set([...prescriptionPatients, ...observationPatients])];

        // Récupérer les patients actifs
        const activePatientList = await patientContract.methods
          .getPatientList(hhNumber)
          .call();

        // Récupérer les patients révoqués
        const revokedPatientList = await patientContract.methods
          .getRevokedPatients(hhNumber)
          .call();

        // Filtrer les patients actifs ayant des prescriptions ou observations
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

        // Filtrer les patients révoqués ayant des prescriptions ou observations
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

        // Supprimer les entrées nulles et mettre à jour l'état
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

      // Mettre à jour la liste après suppression
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

      // Mettre à jour la liste après restauration
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
    setShowRevoked((prev) => !prev); // Basculer l'affichage des patients révoqués
  };

  return (
    <div className="patient-list-container">
      <div className="header-section">
        <h2 className="patient-list-title">Liste des Patients</h2>
        <button onClick={toggleRevokedPatients} className="restore-patient-button">
          {showRevoked ? "Masquer les patients révoqués" : "Restaurer un patient"}
        </button>
      </div>

      {isLoading && <p className="loading-message">Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && (
        <>
          {/* Patients Actifs */}
          <div className="patient-list-section">
            <h3 className="section-title">Patients Actifs</h3>
            {activePatients.length > 0 ? (
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Nom du Patient</th>
                    <th>Numéro HH</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activePatients.map((patient, index) => (
                    <tr key={index}>
                      <td>{patient.name}</td>
                      <td>{patient.hhNumber}</td>
                      <td>
                        <button
                          onClick={() => handleViewPatient(patient.hhNumber)}
                          className="view-button"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.hhNumber)}
                          className="delete-button"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Aucun patient actif trouvé.</p>
            )}
          </div>

          {/* Patients Révoqués (affiché conditionnellement) */}
          {showRevoked && (
            <div className="patient-list-section">
              <h3 className="section-title">Patients Révoqués</h3>
              {revokedPatients.length > 0 ? (
                <table className="patient-table">
                  <thead>
                    <tr>
                      <th>Nom du Patient</th>
                      <th>Numéro HH</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revokedPatients.map((patient, index) => (
                      <tr key={index}>
                        <td>{patient.name}</td>
                        <td>{patient.hhNumber}</td>
                        <td>
                          <button
                            onClick={() => handleRestorePatient(patient.hhNumber)}
                            className="restore-button"
                          >
                            Restaurer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucun patient révoqué trouvé.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientList;