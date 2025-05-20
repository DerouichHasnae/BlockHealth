import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Web3 from "web3";
import PrescriptionABI from "../build/contracts/Prescription.json";
import "../CSS/PrescriptionForm.css";

const PrescriptionForm = () => {
  const { hhNumber } = useParams(); // hhNumber du patient
  const { state } = useLocation();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [medication, setMedication] = useState("");
  const [dosesPerDay, setDosesPerDay] = useState(1);
  const [intakeTimes, setIntakeTimes] = useState([]);
  const [durationDays, setDurationDays] = useState(1);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
        const deployedNetwork = PrescriptionABI.networks[networkId];
        if (!deployedNetwork) {
          setError("Contrat Prescription non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }

        const contractInstance = new web3Instance.eth.Contract(
          PrescriptionABI.abi,
          deployedNetwork.address
        );
        setContract(contractInstance);
      } catch (err) {
        console.error("Erreur initialisation Web3 :", err);
        setError(`Erreur lors de l'initialisation : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initWeb3AndContract();
  }, []);

  const handleIntakeTimeChange = (time) => {
    if (intakeTimes.includes(time)) {
      setIntakeTimes(intakeTimes.filter((t) => t !== time));
    } else if (intakeTimes.length < dosesPerDay) {
      setIntakeTimes([...intakeTimes, time]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contract || !account) {
      setError("Contrat ou compte non initialisé");
      return;
    }

    if (!medication || intakeTimes.length === 0 || dosesPerDay < 1 || durationDays < 1) {
      setError("Veuillez remplir tous les champs correctement");
      return;
    }

    try {
      await contract.methods
        .addPrescription(
          hhNumber,
          state?.doctorHhNumber || "123456", // À remplacer par la méthode réelle
          medication,
          dosesPerDay,
          intakeTimes,
          durationDays
        )
        .send({ from: account });
      alert("Prescription enregistrée avec succès !");
      navigate(`/patient/${hhNumber}/viewprofile`, { state });
    } catch (err) {
      console.error("Erreur ajout prescription :", err);
      setError(`Erreur lors de l'enregistrement : ${err.message}`);
    }
  };

  return (
    <div className="prescription-form-container">
      <h2 className="prescription-form-title">Définir une Prescription pour {hhNumber}</h2>

      {isLoading && <p className="loading-message">Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="prescription-form">
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

        <div className="form-buttons">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Enregistrer
          </button>
          <button
            type="button"
            onClick={() => navigate(`/patient/${hhNumber}/viewprofile`, { state })}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;