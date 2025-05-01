import React, { useState } from "react";
import Web3 from "web3";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import { useNavigate } from "react-router-dom";
import "../CSS/DoctorLogin.css";
import NavBar from "./NavBar";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [hhNumberError, sethhNumberError] = useState("");
  const [hhNumber, sethhNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlehhNumberChange = (e) => {
    const inputhhNumber = e.target.value;
    const phoneRegex = /^\d{6}$/;
    
    if (phoneRegex.test(inputhhNumber)) {
      sethhNumber(inputhhNumber);
      sethhNumberError("");
    } else {
      sethhNumber(inputhhNumber);
      sethhNumberError("Veuillez entrer un numéro HH à 6 chiffres.");
    }
  };

  const handleCheckRegistration = async () => {
    if (hhNumberError || !hhNumber || !password) {
      setErrorMessage("Veuillez remplir tous les champs correctement");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Vérifier si MetaMask est installé
      if (!window.ethereum) {
        throw new Error("tu n'a pas instaler metamask ");
      }

      // Demander l'accès au compte si nécessaire
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      //une instance de Web3 

      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();// adreese de reseau cory 
      const deployedNetwork = DoctorRegistration.networks[networkId];//addresse de contrart 
      
      if (!deployedNetwork) {
        throw new Error("Contrat non déployé sur ce réseau");
      }

      const contract = new web3.eth.Contract(
        DoctorRegistration.abi,
        deployedNetwork.address// addrese de contrat  
      );

      // Vérifier l'enregistrement
      const isRegisteredResult = await contract.methods
        .isRegisteredDoctor(hhNumber)
        .call();
      setIsRegistered(isRegisteredResult);

      if (!isRegisteredResult) {
        throw new Error("Médecin non enregistré");
      }

      // Valider le mot de passe
      const isValidPassword = await contract.methods
        .validatePassword(hhNumber, password)
        .call();

      if (!isValidPassword) {
        throw new Error("Mot de passe incorrect");
      }

      // Récupérer les détails du médecin
      const doctor = await contract.methods
        .getDoctorDetails(hhNumber)
        .call();
      setDoctorDetails(doctor);

      // Rediriger vers le dashboard
      navigate(`/doctor/${hhNumber}`);

    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setErrorMessage(error.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="doctor-login-container">
      <NavBar />
      <div className="login-form-wrapper">
        <h2 className="login-title">Connexion Médecin</h2>
        
        {errorMessage && (
          <div className="error-message mb-4 p-3 bg-red-100 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="hhNumber">
            Numéro de santé de l'hôpital
          </label>
          <input
            id="hhNumber"
            name="hhNumber"
            type="text"
            required
            className={`form-input ${hhNumberError && "error"}`}
            placeholder="Entrez votre numéro HH"
            value={hhNumber}
            onChange={handlehhNumberChange}
            maxLength={6}
          />
          {hhNumberError && (
            <p className="error-message">{hhNumberError}</p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Mot de passe
          </label>
          <input
            type="password"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="button-group">
          <button
            onClick={handleCheckRegistration}
            className="doctor-login-button"
            disabled={isLoading}
          >
            {isLoading ? "Connexion en cours..." : "Se connecter"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="doctor-login-button cancel-button"
            disabled={isLoading}
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;