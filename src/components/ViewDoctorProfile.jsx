import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import "../CSS/ViewDoctorProfile.css";
import med from "../data/images/image.png";

const ViewDoctorProfile = ({ setActiveSection }) => {
  const { hhNumber } = useParams();
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        if (!window.ethereum) {
          throw new Error("Veuillez installer MetaMask");
        }

        await window.ethereum.request({ method: "eth_requestAccounts" });

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
        console.error("Erreur lors de la récupération des détails :", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [hhNumber]);

  if (isLoading) {
    return (
      <div className="doctor-profile-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="doctor-profile-error">
        <div className="error-icon">!</div>
        <p className="error-message">{error}</p>
        <button
          onClick={() => setActiveSection("dashboard")}
          className="return-button"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  // Organiser les détails en groupes de 3 pour l'affichage
  const detailsGroups = [];
  if (doctorDetails) {
    const allDetails = [
      { label: "Nom/Prénom", value: doctorDetails[1] },
      { label: "Date de naissance", value: doctorDetails[3] },
      { label: "Genre", value: doctorDetails[4] },
      { label: "Hôpital", value: doctorDetails[2] },
      { label: "Spécialisation", value: doctorDetails[6] },
      { label: "Service", value: doctorDetails[7] },
      { label: "Poste", value: doctorDetails[8] },
      { label: "Expérience", value: doctorDetails[9] },
      { label: "Email", value: doctorDetails[5] },
      { label: "Numéro HH", value: hhNumber }
    ];

    for (let i = 0; i < allDetails.length; i += 3) {
      detailsGroups.push(allDetails.slice(i, i + 3));
    }
  }

  return (
    <div className="doctor-profile-wrapper">
      <div className="doctor-profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            <img src={med} alt="Doctor" className="profile-avatar" />
            <div className="online-status"></div>
          </div>
          <h1 className="profile-name">{doctorDetails[1]}</h1>
          <p className="profile-specialization">{doctorDetails[6]}</p>
          <p className="profile-hospital">{doctorDetails[2]}</p>
        </div>

        <div className="profile-details-container">
          {detailsGroups.map((group, index) => (
            <div key={index} className="detail-row">
              {group.map((detail, idx) => (
                <div key={idx} className="detail-item">
                  <span className="detail-label">{detail.label}</span>
                  <span className="detail-value">{detail.value}</span>
                </div>
              ))}
              {/* Remplir avec des éléments vides si nécessaire pour compléter la ligne */}
              {group.length < 3 &&
                Array.from({ length: 3 - group.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="detail-item empty"></div>
                ))}
            </div>
          ))}
        </div>

        <div className="profile-actions">
          <button
            onClick={() => setActiveSection("dashboard")}
            className="close-button"
          >
            Fermer le profil
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDoctorProfile;