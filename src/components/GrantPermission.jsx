import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import "../CSS/GrantPermission.css";

function GrantPermission() {
  const { hhNumber } = useParams();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [doctorHhNumber, setDoctorHhNumber] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = PatientRegistration.networks[networkId];
          if (!deployedNetwork) {
            setStatus("Contrat non déployé sur ce réseau.");
            return;
          }
          const contractInstance = new web3Instance.eth.Contract(
            PatientRegistration.abi,
            deployedNetwork.address
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Failed to initialize web3 or contract:", error);
          setStatus("Échec de l'initialisation Web3.");
        }
      } else {
        setStatus("Veuillez installer MetaMask !");
      }
    };

    initWeb3();
  }, []);

  const handleGrantPermission = async () => {
    if (!contract || !doctorHhNumber) {
      setStatus("Veuillez entrer un HH Number valide.");
      return;
    }

    setIsLoading(true);
    setStatus("");

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      const patientDetails = await contract.methods.getPatientDetails(hhNumber).call();
      const patientName = patientDetails[1];

      await contract.methods
        .grantPermission(hhNumber, doctorHhNumber, patientName)
        .send({ from: accounts[0] });

      setStatus("Permission accordée avec succès !");
    } catch (error) {
      console.error("Error granting permission:", error);
      setStatus("Échec de l'octroi de la permission.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="gp-container">
      <h2 className="gp-title">Accorder l'Accès au Médecin</h2>

      {isLoading && (
        <div className="gp-loading">
          <svg
            className="gp-loading-icon"
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
          Traitement en cours...
        </div>
      )}

      <div className="gp-input-wrapper">
        <input
          type="text"
          placeholder="Entrez le HH Number du Médecin"
          value={doctorHhNumber}
          onChange={(e) => setDoctorHhNumber(e.target.value)}
          className="gp-input"
          aria-label="HH Number du Médecin"
        />
        <svg
          className="gp-input-icon"
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

      <button
        onClick={handleGrantPermission}
        className="gp-button"
        disabled={isLoading}
        aria-label="Accorder la permission"
      >
        <svg
          className="gp-btn-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 1v22M5 7l7 7 7-7"></path>
        </svg>
        Accorder la Permission
      </button>

      {status && (
        <p
          className={`gp-status ${status.includes("succès") ? "gp-status-success" : "gp-status-error"}`}
          aria-live="polite"
        >
          {status}
        </p>
      )}
    </div>
  );
}

export default GrantPermission;