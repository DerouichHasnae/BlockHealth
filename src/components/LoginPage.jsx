import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import NavBar from "./NavBar";
import "../CSS/LoginPage.css";
import { FaUserMd, FaUserInjured } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // null, "doctor", or "patient"
  const [hhNumber, sethhNumber] = useState("");
  const [password, setPassword] = useState("");
  const [hhNumberError, sethhNumberError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (hhNumberError || !hhNumber || !password) {
      setErrorMessage("Veuillez remplir tous les champs correctement.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask n'est pas installé.");
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();

      if (role === "doctor") {
        const deployedNetwork = DoctorRegistration.networks[networkId];
        if (!deployedNetwork) {
          throw new Error("Contrat DoctorRegistration non déployé sur ce réseau.");
        }

        const contract = new web3.eth.Contract(
          DoctorRegistration.abi,
          deployedNetwork.address
        );

        const isRegistered = await contract.methods
          .isRegisteredDoctor(hhNumber)
          .call();
        if (!isRegistered) {
          throw new Error("Médecin non enregistré.");
        }

        const isValidPassword = await contract.methods
          .validatePassword(hhNumber, password)
          .call();
        if (!isValidPassword) {
          throw new Error("Mot de passe incorrect.");
        }

        const doctor = await contract.methods
          .getDoctorDetails(hhNumber)
          .call();
        navigate(`/doctor/${hhNumber}`);
      } else if (role === "patient") {
        const deployedNetwork = PatientRegistration.networks[networkId];
        if (!deployedNetwork) {
          throw new Error("Contrat PatientRegistration non déployé sur ce réseau.");
        }

        const contract = new web3.eth.Contract(
          PatientRegistration.abi,
          deployedNetwork.address
        );

        const isRegistered = await contract.methods
          .isRegisteredPatient(hhNumber)
          .call();
        if (!isRegistered) {
          throw new Error("Patient non enregistré.");
        }

        const isValidPassword = await contract.methods
          .validatePassword(hhNumber, password)
          .call();
        if (!isValidPassword) {
          throw new Error("Mot de passe incorrect.");
        }

        const patient = await contract.methods
          .getPatientDetails(hhNumber)
          .call();
        navigate(`/patient/${hhNumber}`);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setErrorMessage(error.message || "Une erreur est survenue lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRole(null);
    sethhNumber("");
    setPassword("");
    sethhNumberError("");
    setErrorMessage("");
  };

  return (

    <div className="login-container">
        
 
      <div className="login-content">
        <h1 className="login-title">Portail Médical</h1>
        {!role ? (
          <>
            <p className="login-subtitle">Sélectionnez votre méthode de connexion</p>
            <div className="login-buttons-container">
              <button
                className="login-button"
                onClick={() => setRole("doctor")}
              >
                <FaUserMd className="button-icon" /> Connexion Médecin
              </button>
              <button
                className="login-button"
                onClick={() => setRole("patient")}
              >
                <FaUserInjured className="button-icon" /> Connexion Patient
              </button>
            </div>
            <p className="login-footer">
              Accès sécurisé à votre tableau de bord médical
            </p>
          </>
        ) : (
          <form className="login-form" onSubmit={handleLogin}>
            <h2 className="login-form-title">
              {role === "doctor" ? "Connexion Médecin" : "Connexion Patient"}
            </h2>
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="hhNumber">Numéro HH</label>
              <input
                id="hhNumber"
                name="hhNumber"
                type="text"
                required
                value={hhNumber}
                onChange={handlehhNumberChange}
                maxLength={6}
                placeholder="Entrez votre numéro HH"
                className={hhNumberError ? "input-error" : ""}
              />
              {hhNumberError && (
                <p className="error-message">{hhNumberError}</p>
              )}
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="button-group">
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </button>
              <button
                type="button"
                className="login-button cancel-button"
                onClick={resetForm}
                disabled={isLoading}
              >
                Retour
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;