import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import AvailabilityABI from "../build/contracts/Availability.json";
import "../CSS/Availability.css";

const DoctorSpecialtyPage = () => {
  const { specialty, hhNumber } = useParams(); // Ajout de hhNumber
  const normalizedSpecialty = specialty ? specialty.toLowerCase() : "";
  const [web3, setWeb3] = useState(null);
  const [availabilityContract, setAvailabilityContract] = useState(null);
  const [disponibilites, setDisponibilites] = useState([]);
  const [userAddress, setUserAddress] = useState("");
  const [reservedSlots, setReservedSlots] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initWeb3AndContracts = async () => {
      setIsLoading(true);
      setError("");

      if (!window.ethereum) {
        setError("Veuillez installer MetaMask !");
        setIsLoading(false);
        return;
      }

      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setUserAddress(accounts[0]);

        const networkId = await web3Instance.eth.net.getId();
        console.log("Network ID:", networkId);

        const deployedAvailability = AvailabilityABI.networks[networkId];
        if (!deployedAvailability) {
          setError(`Contrat Availability non déployé sur le réseau ${networkId}`);
          setIsLoading(false);
          return;
        }
        console.log("Availability contract address:", deployedAvailability.address);

        const availabilityInstance = new web3Instance.eth.Contract(
          AvailabilityABI.abi,
          deployedAvailability.address
        );
        setAvailabilityContract(availabilityInstance);
      } catch (err) {
        console.error("Erreur initialisation Web3 :", err);
        setError(`Erreur lors de l'initialisation : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initWeb3AndContracts();
  }, []);

  useEffect(() => {
    const fetchDisponibilites = async () => {
      if (!availabilityContract || !normalizedSpecialty) return;

      try {
        console.log("Fetching créneaux for specialty:", normalizedSpecialty);
        const slots = await availabilityContract.methods
          .getDisponibilites(normalizedSpecialty)
          .call();
        console.log("Créneaux reçus:", slots);

        const normalizedSlots = slots
          .map((slot) => ({
            date: Number(slot.date),
            jourSemaine: Number(slot.jourSemaine),
            debut: Number(slot.debut),
            fin: Number(slot.fin),
            dureeConsultation: Number(slot.dureeConsultation),
          }))
          .filter((slot) => {
            const isValid =
              slot.debut < slot.fin &&
              slot.dureeConsultation > 0 &&
              slot.fin - slot.debut <= 12 * 3600 &&
              slot.debut >= slot.date &&
              slot.fin <= slot.date + 24 * 3600;
            if (!isValid) {
              console.log("Créneau invalide ignoré:", {
                date: slot.date,
                dateUTC: new Date(slot.date * 1000).toUTCString(),
                debut: slot.debut,
                debutUTC: new Date(slot.debut * 1000).toUTCString(),
                fin: slot.fin,
                finUTC: new Date(slot.fin * 1000).toUTCString(),
                dureeConsultation: slot.dureeConsultation,
              });
            }
            return isValid;
          });
        setDisponibilites(normalizedSlots);
      } catch (err) {
        console.error("Erreur récupération des disponibilités :", err);
        setError(`Erreur récupération des créneaux : ${err.message}`);
      }
    };

    fetchDisponibilites();
  }, [availabilityContract, normalizedSpecialty]);

  useEffect(() => {
    const checkReservations = async () => {
      if (!availabilityContract || disponibilites.length === 0) return;

      const newReservations = {};

      for (const cr of disponibilites) {
        const start = cr.debut;
        const end = cr.fin;
        const interval = cr.dureeConsultation;

        if (interval <= 0 || end <= start) {
          console.log("Sous-créneaux ignorés (intervalle invalide):", { start, end, interval });
          continue;
        }

        for (let t = start; t < end; t += interval) {
          const slotKey = `${normalizedSpecialty}_${t}`;
          const reserved = await availabilityContract.methods
            .isCreneauReserve(normalizedSpecialty, t)
            .call();
          console.log("Sous-créneau:", { timestamp: t, slotKey, reserved });
          newReservations[slotKey] = reserved;
        }
      }
      setReservedSlots(newReservations);
    };

    checkReservations();
  }, [availabilityContract, disponibilites, normalizedSpecialty]);

  const reserverCreneau = async (timestampDebut) => {
    if (!userAddress) {
      alert("Veuillez connecter votre portefeuille.");
      return;
    }
    if (!hhNumber) {
      alert("hhNumber du patient manquant dans l'URL.");
      return;
    }

    const timestampSec = timestampDebut;
    const slotKey = `${normalizedSpecialty}_${timestampSec}`;

    try {
      const isReserved = await availabilityContract.methods
        .isCreneauReserve(normalizedSpecialty, timestampSec)
        .call();

      if (isReserved) {
        alert("Ce créneau est déjà réservé.");
        return;
      }

      await availabilityContract.methods
        .reserverCreneau(normalizedSpecialty, timestampSec, hhNumber)
        .send({ from: userAddress });

      alert("Rendez-vous réservé avec succès !");
      setReservedSlots((prev) => ({ ...prev, [slotKey]: true }));
    } catch (err) {
      console.error("Erreur réservation :", err);
      alert("Erreur lors de la réservation : " + err.message);
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
      <h2 className="availability-title">Créneaux disponibles pour {specialty}</h2>
      <p className="availability-note">Remarque : Les heures sont en UTC.</p>

      {isLoading && <p className="loading-message">Chargement...</p>}
      {error && <p className="error-message">{error}</p>}

      {disponibilites.length > 0 ? (
        <div className="availability-creneaux-section">
          <h3 className="availability-creneaux-title">Créneaux disponibles</h3>
          {disponibilites.map((cr, idx) => {
            const start = cr.debut;
            const end = cr.fin;
            const interval = cr.dureeConsultation;
            const slots = [];

            if (interval <= 0 || end <= start) {
              console.log("Sous-créneaux invalides:", { start, end, interval });
              return null;
            }

            for (let t = start; t < end; t += interval) {
              slots.push({ debut: t, fin: t + interval });
            }

            console.log("Créneau affiché:", {
              date: formatDate(cr.date),
              dateTimestamp: cr.date,
              debut: cr.debut,
              debutUTC: new Date(cr.debut * 1000).toUTCString(),
              fin: cr.fin,
              finUTC: new Date(cr.fin * 1000).toUTCString(),
              dureeConsultation: cr.dureeConsultation,
            });

            return (
              <div key={idx} className="availability-creneaux-section">
                <h4 className="availability-creneaux-title">
                  {joursSemaine[cr.jourSemaine]} {formatDate(cr.date)} (Consultations de {cr.dureeConsultation / 60} min)
                </h4>
                <ul className="availability-creneaux-list">
                  {slots.map((slot, i) => {
                    const timestampSec = slot.debut;
                    const slotKey = `${normalizedSpecialty}_${timestampSec}`;
                    const isReserved = reservedSlots[slotKey];

                    console.log("Sous-créneau affiché:", {
                      debut: formatTime(slot.debut),
                      fin: formatTime(slot.fin),
                      timestamp: timestampSec,
                      slotKey,
                      reserved: isReserved,
                    });

                    return (
                      <li
                        key={i}
                        className={`availability-creneaux-list-item ${isReserved ? "reserved" : "available"}`}
                        onClick={() => !isReserved && reserverCreneau(slot.debut)}
                      >
                        {formatTime(slot.debut)} - {formatTime(slot.fin)}
                        {isReserved && <span> (Réservé)</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="no-creneaux">Aucun créneau disponible pour cette spécialité.</p>
      )}
    </div>
  );
};

export default DoctorSpecialtyPage;