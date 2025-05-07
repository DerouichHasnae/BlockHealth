import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import AvailabilityABI from "../build/contracts/Availability.json";
import "../CSS/Availability.css";

function Availability() {
  const { hhNumber } = useParams();
  const [date, setDate] = useState("");
  const [jourSemaine, setJourSemaine] = useState("1");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [creneaux, setCreneaux] = useState([]);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3 = new Web3(window.ethereum);
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = AvailabilityABI.networks[networkId];
          const contractInstance = new web3.eth.Contract(
            AvailabilityABI.abi,
            deployedNetwork && deployedNetwork.address
          );
          setContract(contractInstance);

          fetchCreneaux(contractInstance);
        } catch (error) {
          console.error("Error initializing Web3:", error);
        }
      } else {
        console.log("Please install MetaMask!");
      }
    };

    initWeb3();
  }, [hhNumber]);

  const fetchCreneaux = async (contractInstance) => {
    if (!contractInstance) return;
    
    try {
      const result = await contractInstance.methods.getDisponibilites(hhNumber).call();
      const creneauxNormalises = result.map(c => ({
        date: Number(c.date),
        jourSemaine: Number(c.jourSemaine),
        debut: Number(c.debut),
        fin: Number(c.fin),
        patient: c.patient
      }));
      setCreneaux(creneauxNormalises);
    } catch (error) {
      console.error("Erreur récupération créneaux:", error);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    
    // Calcul automatique du jour de la semaine
    if (selectedDate) {
      const dateObj = new Date(selectedDate);
      const dayOfWeek = dateObj.getDay(); // 0 (dimanche) à 6 (samedi)
      setJourSemaine(dayOfWeek.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contract || !account || !date) {
      alert("Veuillez remplir tous les champs et connecter MetaMask");
      return;
    }

    try {
      // Convertir la date en timestamp (à minuit)
      const dateTimestamp = Math.floor(new Date(date).getTime() / 1000);
      
      // Convertir heures en timestamp complet
      const [hDeb, mDeb] = heureDebut.split(":").map(Number);
      const [hFin, mFin] = heureFin.split(":").map(Number);

      const dateDebut = new Date(date);
      const dateFin = new Date(date);
      dateDebut.setHours(hDeb, mDeb, 0, 0);
      dateFin.setHours(hFin, mFin, 0, 0);

      const timestampDebut = Math.floor(dateDebut.getTime() / 1000);
      const timestampFin = Math.floor(dateFin.getTime() / 1000);

      await contract.methods
        .ajouterCreneau(
          hhNumber,
          dateTimestamp,
          parseInt(jourSemaine),
          timestampDebut,
          timestampFin
        )
        .send({ from: account });

      // Attendre la confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      await fetchCreneaux(contract);

      // Réinitialiser le formulaire
      setDate("");
      setHeureDebut("");
      setHeureFin("");
    } catch (error) {
      console.error("Erreur ajout créneau :", error);
      alert(`Erreur lors de la création: ${error.message}`);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const joursSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  return (
    <div className="availability-container">
      <h2 className="availability-title">Définir vos disponibilités - {hhNumber}</h2>
      
      <form onSubmit={handleSubmit} className="availability-form">
        <div>
          <label>Date (YYYY-MM-DD) :</label>
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            required
          />
        </div>
        
        <div>
          <label>Jour de la semaine :</label>
          <select 
            value={jourSemaine} 
            onChange={(e) => setJourSemaine(e.target.value)}
            disabled
          >
            {joursSemaine.map((jour, index) => (
              <option key={index} value={index}>{jour}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label>Heure début :</label>
          <input
            type="time"
            value={heureDebut}
            onChange={(e) => setHeureDebut(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label>Heure fin :</label>
          <input
            type="time"
            value={heureFin}
            onChange={(e) => setHeureFin(e.target.value)}
            required
          />
        </div>
        
        <button type="submit">Créer le créneau</button>
      </form>

      <div className="availability-creneaux-section">
        <h3 className="availability-creneaux-title">Créneaux disponibles :</h3>
        <ul className="availability-creneaux-list">
          {creneaux.length === 0 ? (
            <li className="no-creneaux">Aucun créneau disponible.</li>
          ) : (
            creneaux
              .sort((a, b) => a.debut - b.debut)
              .map((creneau, index) => (
                <li key={index}>
                  <strong>{joursSemaine[creneau.jourSemaine]} {formatDate(creneau.date)}</strong>
                  <br />
                  {`${formatTime(creneau.debut)} - ${formatTime(creneau.fin)}`}
                  {creneau.patient !== "0x0000000000000000000000000000000000000000" && 
                    <span className="reserved"> (Réservé)</span>}
                </li>
              ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default Availability;