import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import AvailabilityABI from "../build/contracts/Availability.json";
import DoctorRegistrationABI from "../build/contracts/DoctorRegistration.json";
import "../CSS/Availability.css";

function Availability() {
  const { specialization } = useParams();
  const normalizedSpecialization = specialization ? specialization.toLowerCase() : "";
  const [date, setDate] = useState("");
  const [jourSemaine, setJourSemaine] = useState("1");
  const [heureDebut, setHeureDebut] = useState("");
  const [heureFin, setHeureFin] = useState("");
  const [dureeConsultation, setDureeConsultation] = useState("15");
  const [creneaux, setCreneaux] = useState([]);
  const [contract, setContract] = useState(null);
  const [doctorContract, setDoctorContract] = useState(null);
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initWeb3 = async () => {
      setIsLoading(true);
      setError("");
      setSuccess("");

      if (!window.ethereum) {
        setError("Veuillez installer MetaMask !");
        setIsLoading(false);
        return;
      }

      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();

        const availabilityNetwork = AvailabilityABI.networks[networkId];
        if (!availabilityNetwork) {
          setError("Contrat Availability non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }
        const availabilityInstance = new web3.eth.Contract(
          AvailabilityABI.abi,
          availabilityNetwork.address
        );
        setContract(availabilityInstance);

        const doctorNetwork = DoctorRegistrationABI.networks[networkId];
        if (!doctorNetwork) {
          setError("Contrat DoctorRegistration non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }
        const doctorInstance = new web3.eth.Contract(
          DoctorRegistrationABI.abi,
          doctorNetwork.address
        );
        setDoctorContract(doctorInstance);

        const isAuthorized = await doctorInstance.methods
          .isDoctorInSpecialization(accounts[0], normalizedSpecialization)
          .call();
        if (!isAuthorized) {
          setError("Vous n'êtes pas autorisé pour cette spécialité");
          setIsLoading(false);
          return;
        }

        await fetchCreneaux(availabilityInstance);
      } catch (err) {
        console.error("Erreur initialisation Web3 :", err);
        setError(`Erreur : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initWeb3();
  }, [normalizedSpecialization]);

  const fetchCreneaux = async (contractInstance) => {
    if (!contractInstance) return;

    try {
      const result = await contractInstance.methods.getDisponibilites(normalizedSpecialization).call();
      const creneauxNormalises = result
        .map((c) => ({
          date: Number(c.date),
          jourSemaine: Number(c.jourSemaine),
          debut: Number(c.debut),
          fin: Number(c.fin),
          dureeConsultation: Number(c.dureeConsultation),
        }))
        .filter((c) => {
          const isValid =
            c.debut < c.fin &&
            c.dureeConsultation > 0 &&
            c.fin - c.debut <= 12 * 3600 &&
            c.debut >= c.date &&
            c.fin <= c.date + 24 * 3600;
          return isValid;
        });
      setCreneaux(creneauxNormalises);
    } catch (error) {
      console.error("Erreur récupération créneaux:", error);
      setError(`Erreur récupération créneaux : ${error.message}`);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);

    if (selectedDate) {
      const dateObj = new Date(selectedDate);
      const dayOfWeek = dateObj.getDay();
      setJourSemaine(dayOfWeek.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contract || !account || !date || !heureDebut || !heureFin || !dureeConsultation) {
      setError("Veuillez remplir tous les champs et connecter MetaMask");
      return;
    }

    try {
      const [year, month, day] = date.split("-").map(Number);
      const dateTimestamp = Math.floor(Date.UTC(year, month - 1, day) / 1000);

      for (const creneau of creneaux) {
        if (creneau.date === dateTimestamp) {
          setError("Un créneau existe déjà pour cette date");
          return;
        }
      }

      const [hDeb, mDeb] = heureDebut.split(":").map(Number);
      const [hFin, mFin] = heureFin.split(":").map(Number);

      const timestampDebut = Math.floor(Date.UTC(year, month - 1, day, hDeb, mDeb) / 1000);
      const timestampFin = Math.floor(Date.UTC(year, month - 1, day, hFin, mFin) / 1000);
      const dureeConsultationSec = parseInt(dureeConsultation) * 60;

      if (timestampDebut >= timestampFin) {
        setError("L'heure de fin doit être après l'heure de début");
        return;
      }
      if (dureeConsultationSec <= 0) {
        setError("La durée de consultation doit être positive");
        return;
      }
      if (timestampDebut < dateTimestamp || timestampFin > dateTimestamp + 24 * 3600) {
        setError("Les heures doivent être dans la même journée que la date sélectionnée");
        return;
      }

      await contract.methods
        .ajouterCreneau(
          normalizedSpecialization,
          dateTimestamp,
          parseInt(jourSemaine),
          timestampDebut,
          timestampFin,
          dureeConsultationSec
        )
        .send({ from: account });

      await fetchCreneaux(contract);

      setDate("");
      setHeureDebut("");
      setHeureFin("");
      setDureeConsultation("15");
      setError("");
      setSuccess("Créneau créé avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erreur ajout créneau :", error);
      setError(`Erreur lors de la création : ${error.message}`);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("fr-FR");
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  };

  const joursSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  return (
    <div className="availability-container">
      <h2 className="availability-title">Définir vos disponibilités - {specialization}</h2>
      <p className="availability-note">Remarque : Les heures sont en UTC.</p>

      {isLoading && <div className="loading-spinner">Chargement...</div>}
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="availability-form" aria-label="Formulaire de création de créneau">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="date">Date :</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={handleDateChange}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="jourSemaine">Jour de la semaine :</label>
            <select
              id="jourSemaine"
              value={jourSemaine}
              onChange={(e) => setJourSemaine(e.target.value)}
              disabled
              aria-disabled="true"
            >
              {joursSemaine.map((jour, index) => (
                <option key={index} value={index}>{jour}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="heureDebut">Heure début (UTC) :</label>
            <input
              id="heureDebut"
              type="time"
              value={heureDebut}
              onChange={(e) => setHeureDebut(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="heureFin">Heure fin (UTC) :</label>
            <input
              id="heureFin"
              type="time"
              value={heureFin}
              onChange={(e) => setHeureFin(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="dureeConsultation">Durée consultation (min) :</label>
            <input
              id="dureeConsultation"
              type="number"
              value={dureeConsultation}
              onChange={(e) => setDureeConsultation(e.target.value)}
              min="5"
              required
              aria-required="true"
            />
          </div>
        </div>

        <button type="submit" className="blockhealth-button">Créer le créneau</button>
      </form>

      <div className="availability-creneaux-section">
        <h3 className="availability-creneaux-title">Créneaux disponibles</h3>
        <ul className="availability-creneaux-list" role="list">
          {creneaux.length === 0 ? (
            <li className="no-creneaux blockhealth-card">Aucun créneau disponible.</li>
          ) : (
            creneaux
              .sort((a, b) => a.debut - b.debut)
              .map((creneau, index) => (
                <li
                  key={index}
                  className="blockhealth-card"
                  role="listitem"
                  aria-label={`Créneau le ${joursSemaine[creneau.jourSemaine]} ${formatDate(creneau.date)} de ${formatTime(creneau.debut)} à ${formatTime(creneau.fin)}`}
                >
                  <strong>{joursSemaine[creneau.jourSemaine]} {formatDate(creneau.date)}</strong>
                  <br />
                  {`${formatTime(creneau.debut)} - ${formatTime(creneau.fin)} (Consultations de ${creneau.dureeConsultation / 60} min)`}
                </li>
              ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default Availability;