import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useParams, useNavigate } from "react-router-dom";
import "../CSS/ViewProfile.css";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import defaultAvatar from "../data/images/pat.jpeg"; // Default avatar image

const ViewProfile = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = PatientRegistration.networks[networkId];
          if (!deployedNetwork) {
            throw new Error("Contrat non déployé sur ce réseau");
          }
          const contractInstance = new web3Instance.eth.Contract(
            PatientRegistration.abi,
            deployedNetwork.address
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Erreur d'initialisation de Web3 :", error);
          setError("Erreur de connexion à la blockchain");
        }
      } else {
        setError("Veuillez installer l'extension MetaMask");
      }
    };

    init();
  }, []);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!contract || !hhNumber) return;

      try {
        const result = await contract.methods.getPatientDetails(hhNumber).call();
        setPatientDetails(result);
      } catch (error) {
        console.error("Erreur lors du chargement des détails du patient :", error);
        setError("Erreur de chargement des données du patient");
      }
    };

    fetchPatientDetails();
  }, [contract, hhNumber]);

  const handleClose = () => {
    navigate(`/patient/${hhNumber}`); // Navigate back to dashboard
  };

  if (error) {
    return (
      <div className="profile-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1 className="profile-title">Profil Patient</h1>
        {patientDetails ? (
          <div className="profile-content">
            <img
              src={defaultAvatar}
              alt="Patient Avatar"
              className="profile-avatar"
            />
            <div className="profile-details">
              <div className="profile-detail">
                <span className="profile-detail-label">Nom :</span>
                <span className="profile-detail-value">{patientDetails.name}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-label">Date de naissance :</span>
                <span className="profile-detail-value">{patientDetails.dateOfBirth}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-label">Genre :</span>
                <span className="profile-detail-value">{patientDetails.gender}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-label">Groupe sanguin :</span>
                <span className="profile-detail-value">{patientDetails.bloodGroup}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-label">Adresse :</span>
                <span className="profile-detail-value">{patientDetails.homeAddress}</span>
              </div>
              <div className="profile-detail">
                <span className="profile-detail-label">Email :</span>
                <span className="profile-detail-value">{patientDetails.email}</span>
              </div>
            </div>
            <div className="profile-button-container">
              <button className="profile-close-btn" onClick={handleClose}>
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <p className="profile-loading">Chargement des données du patient...</p>
        )}
      </div>
    </div>
  );
};

export default ViewProfile;