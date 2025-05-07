import React, { useState, useEffect } from "react";
import Web3 from "web3";
import AppointmentManager from "../build/contracts/AppointmentManager.json";
import { format } from "date-fns";
import "../CSS/DoctorAvailability.css";

const DoctorAvailability = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [duration, setDuration] = useState(30);
  const [contract, setContract] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [status, setStatus] = useState({ message: "", type: "" });

  const initContract = async () => {
    if (!window.ethereum) return;
    const web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = AppointmentManager.networks[networkId];
    const instance = new web3.eth.Contract(AppointmentManager.abi, deployedNetwork.address);
    setContract(instance);
    return instance;
  };

  const generateTimeSlots = () => {
    const slots = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
  
    const start = new Date(selectedDate);
    start.setHours(startHour, startMinute, 0, 0);
    
    // Arrondir à l'intervalle de 15 minutes
    const roundedMinutes = Math.floor(start.getMinutes() / 15) * 15;
    start.setMinutes(roundedMinutes, 0, 0);
  
    const end = new Date(selectedDate);
    end.setHours(endHour, endMinute, 0, 0);
  
    while (start < end) {
      const timestamp = Math.floor(start.getTime() / 1000);
      slots.push(timestamp);
      start.setMinutes(start.getMinutes() + 15); // Intervalle fixe de 15 min
    }
  
    return slots;
  };

  const handleAddAvailability = async () => {
    if (!selectedDate || !startTime || !endTime) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const slots = generateTimeSlots();
    if (slots.length === 0) {
      alert("Aucun créneau généré. Vérifiez les horaires.");
      return;
    }

    const instance = contract || (await initContract());
    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    try {
      for (const slot of slots) {
        await instance.methods.addAvailability(slot).send({ from: accounts[0] });
      }
      setStatus({ message: "Créneaux ajoutés avec succès", type: "success" });
      await fetchAvailabilities(instance);
    } catch (error) {
      console.error(error);
      setStatus({ message: "Erreur lors de l'ajout", type: "error" });
    }
  };
  const fetchAvailabilities = async () => {
    try {
      const instance = contract || (await initContract());
      const now = Math.floor(Date.now() / 1000);
      const future = now + 30 * 24 * 60 * 60; // 30 jours
  
      // Aligner les requêtes sur des intervalles de 15 minutes
      const alignedNow = Math.floor(now / 900) * 900;
      const alignedFuture = Math.ceil(future / 900) * 900;
  
      const result = await instance.methods
        .getAvailabilitiesBetween(alignedNow, alignedFuture)
        .call();
      
      setAvailabilities(result.map(ts => Number(ts)));
    } catch (error) {
      console.error("Erreur:", error);
      setStatus({
        message: "Échec - Voir la console",
        type: "error"
      });
    }
  };
  const handleRemoveAvailability = async (timestamp) => {
    const instance = contract || (await initContract());
    const accounts = await window.ethereum.request({ method: "eth_accounts" });

    try {
      await instance.methods.removeAvailability(timestamp).send({ from: accounts[0] });
      setStatus({ message: "Créneau supprimé", type: "success" });
      await fetchAvailabilities(instance);
    } catch (error) {
      console.error("Erreur suppression:", error);
      setStatus({ message: "Erreur lors de la suppression", type: "error" });
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return format(date, "dd/MM/yyyy HH:mm");
  };

  useEffect(() => {
    const initialize = async () => {
      const instance = await initContract();
      await fetchAvailabilities(instance);
    };
    initialize();
  }, []);

  return (
    <div className="doctor-dashboard">
      <h2>Gestion des disponibilités</h2>

      <div className="availability-form">
        <h3>Programmer des créneaux</h3>

        <div className="form-group">
          <label>Date :</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={format(new Date(), "yyyy-MM-dd")}
          />
        </div>

        <div className="time-range">
          <div className="form-group">
            <label>Heure de début :</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Heure de fin :</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Durée par créneau :</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
            </select>
          </div>
        </div>

        <button onClick={handleAddAvailability} className="submit-btn">
          Ajouter les créneaux
        </button>

        {status.message && (
          <div className={`status-message ${status.type}`}>{status.message}</div>
        )}
      </div>

      <div className="scheduled-availabilities">
        <h3>Disponibilités programmées</h3>
        {availabilities.length === 0 ? (
          <p>Aucune disponibilité</p>
        ) : (
          <div className="availability-grid">
            {availabilities
              .sort((a, b) => a - b)
              .map((ts) => (
                <div key={ts} className="availability-card">
                  <span>{formatDateTime(ts)}</span>
                  <button onClick={() => handleRemoveAvailability(ts)} className="cancel-btn">
                    Annuler
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorAvailability;
