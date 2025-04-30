import React, { useState, useEffect } from "react";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";
import "./ViewDoctorProfile.css";
import NavBar_Logout from "./NavBar_Logout";

const ViewDoctorProfile = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("tu n'a pas instaler metamask");
        }

        await window.ethereum.request({ method: 'eth_requestAccounts' });

       // On récupère l'adresse du contrat selon le réseau Ethereum utilisé
        
        const web3Instance = new Web3(window.ethereum);
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = DoctorRegistration.networks[networkId];
        
        
        if (!deployedNetwork) {
          throw new Error("Contrat non déployé sur ce réseau");
        }

        const contract = new web3Instance.eth.Contract(
          DoctorRegistration.abi,
          deployedNetwork.address
        );

        const result = await contract.methods.getDoctorDetails(hhNumber).call();
        setDoctorDetails(result);
        
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [hhNumber]);

  const handleBack = () => {
    navigate(`/doctor/${hhNumber}`);
  };

  if (isLoading) {
    return (
      <div className="doctor-profile-container">
        <NavBar_Logout />
        <div className="profile-card">
          <p>Chargement en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-profile-container">
        <NavBar_Logout />
        <div className="profile-card">
          <p className="error-message">{error}</p>
          <button onClick={handleBack} className="profile-button">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-container">
      <NavBar_Logout />
      <div className="profile-card">
        <h1 className="profile-title">Profil du Médecin</h1>
        
        {doctorDetails && (
          <div className="profile-details">
            <p className="detail-item">
              <span className="detail-label">Nom/Prénom:</span>
              <span className="detail-value">{doctorDetails[1]}</span>
            </p>
            <p className="detail-item">
              <span className="detail-label">Date de naissance:</span>
              <span className="detail-value">{doctorDetails[3]}</span>
            </p>
            <p className="detail-item">
              <span className="detail-label">Genre:</span>
              <span className="detail-value">{doctorDetails[4]}</span>
            </p>
            <p className="detail-item">
              <span className="detail-label">Hôpital:</span>
              <span className="detail-value">{doctorDetails[2]}</span>
            </p>
            <p className="detail-item">
              <span className="detail-label">Spécialisation:</span>
              <span className="detail-value">{doctorDetails[6]}</span>
            </p>
            <p className="detail-item">
              <span className="detail-label">Service:</span>
              <span className="detail-value">{doctorDetails[7]}</span>
            </p>
            <p className="detail-item">
              <span className="detail-label">Poste:</span>
              <span className="detail-value">{doctorDetails[8]}</span>
            </p>
            <p className="detail-item">
              <span className="detail-label">Expérience:</span>
              <span className="detail-value">{doctorDetails[9]}</span>
            </p>
            <p className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{doctorDetails[5]}</span>
            </p>
            <p className="detail-item">
              <span className="detail-label">Numéro HH:</span>
              <span className="detail-value">{hhNumber}</span>
            </p>
          </div>
        )}
        
        <div className="text-center">
          <button
            onClick={handleBack}
            className="profile-button"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDoctorProfile;