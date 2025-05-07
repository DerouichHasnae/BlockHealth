import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import DoctorAvailabilityContract from "../build/contracts/DoctorAvailability.json";
import "../CSS/DoctorAvailability.css";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const DoctorAvailabilityPage = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [availability, setAvailability] = useState({});
  const [message, setMessage] = useState("");
  const [savedAvailability, setSavedAvailability] = useState([]);
  const { hhNumber } = useParams(); // Récupération du hhNumber depuis l'URL

  const timeOptions = [];
  for (let h = 8; h <= 17; h++) {
    timeOptions.push(`${String(h).padStart(2, "0")}:00`);
    timeOptions.push(`${String(h).padStart(2, "0")}:30`);
  }

  const formatDate = (date) => {
    const d = new Date(date);
    const yy = String(d.getFullYear()).slice(2);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}/${mm}/${dd}`;
  };

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.requestAccounts();
          setAccount(accounts[0]);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = DoctorAvailabilityContract.networks[networkId];

          if (!deployedNetwork) {
            setMessage("Smart contract not deployed on the current network.");
            return;
          }

          const instance = new web3Instance.eth.Contract(
            DoctorAvailabilityContract.abi,
            deployedNetwork.address
          );
          setContract(instance);

          // Vérifie si hhNumber est valide avant de faire la récupération
          if (hhNumber) {
            const result = await instance.methods.getAvailabilityForDoctor(hhNumber).call();
            if (result && Array.isArray(result)) {
              setSavedAvailability(result);
            } else {
              setSavedAvailability([]);
            }
          } else {
            setMessage("Invalid doctor identifier (hhNumber).");
          }

        } catch (err) {
          console.error("Erreur lors de l'initialisation :", err);
          setMessage("Erreur de connexion au smart contract.");
        }
      } else {
        setMessage("Veuillez installer MetaMask.");
      }
    };

    init();
  }, [hhNumber]);

  const handleTimeChange = (day, type, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!contract || !account || !hhNumber) return;

    try {
      for (const day of days) {
        const entry = availability[day];
        if (entry && entry.start && entry.end && entry.date) {
          await contract.methods
            .setAvailability(hhNumber, day, entry.date, entry.start, entry.end)
            .send({ from: account });
        }
      }

      const updated = await contract.methods.getAvailabilityForDoctor(hhNumber).call();
      setSavedAvailability(updated);
      setMessage("Disponibilité enregistrée avec succès.");
    } catch (err) {
      console.error(err);
      setMessage("Échec de l'enregistrement de la disponibilité.");
    }
  };

  return (
    <div className="availability-container">
      <h2>Définir mes disponibilités hebdomadaires</h2>
      {message && <p className="message">{message}</p>}

      {days.map((day) => (
        <div key={day} className="day-form">
          <h4>{day}</h4>
          <label>Date: </label>
          <input
            type="date"
            value={availability[day]?.date || ""}
            onChange={(e) => handleTimeChange(day, "date", e.target.value)}
          />

          <label>Heure de début: </label>
          <select
            value={availability[day]?.start || ""}
            onChange={(e) => handleTimeChange(day, "start", e.target.value)}
          >
            <option value="">-- Sélectionner --</option>
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label style={{ marginLeft: "10px" }}>Heure de fin: </label>
          <select
            value={availability[day]?.end || ""}
            onChange={(e) => handleTimeChange(day, "end", e.target.value)}
          >
            <option value="">-- Sélectionner --</option>
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button className="save-btn" onClick={handleSubmit}>
        Enregistrer les disponibilités
      </button>

      <div className="saved-section">
        <h3>Disponibilités enregistrées</h3>
        {savedAvailability.length > 0 ? (
          savedAvailability.map((item, idx) => (
            <p key={idx}>
              <strong>{item.day}</strong> ({item.date}): {item.startTime} - {item.endTime}
            </p>
          ))
        ) : (
          <p>Aucune disponibilité enregistrée</p>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailabilityPage;