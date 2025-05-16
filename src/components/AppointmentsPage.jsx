import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Web3 from "web3";
import AvailabilityABI from "../build/contracts/Availability.json";
import DoctorRegistrationABI from "../build/contracts/DoctorRegistration.json";
import PatientRegistrationABI from "../build/contracts/PatientRegistration.json";
import "../CSS/AppointmentsPage.css";

const AppointmentsPage = () => {
  const { hhNumber } = useParams(); // hhNumber du médecin
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [reservations, setReservations] = useState([]);
  const [creneaux, setCreneaux] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [specialization, setSpecialization] = useState("");

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
        console.log("Connected account:", accounts[0]);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = AvailabilityABI.networks[networkId];
        if (!deployedNetwork) {
          setError("Contrat Availability non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }

        const contractInstance = new web3Instance.eth.Contract(
          AvailabilityABI.abi,
          deployedNetwork.address
        );
        setContract(contractInstance);
        console.log("Contract address:", deployedNetwork.address);

        const deployedDoctorRegistration = DoctorRegistrationABI.networks[networkId];
        if (!deployedDoctorRegistration) {
          setError("Contrat DoctorRegistration non déployé sur ce réseau");
          setIsLoading(false);
          return;
        }
        const doctorInstance = new web3Instance.eth.Contract(
          DoctorRegistrationABI.abi,
          deployedDoctorRegistration.address
        );

        const doctorDetails = await doctorInstance.methods.getDoctorDetails(hhNumber).call();
        console.log("Doctor details:", doctorDetails);
        if (doctorDetails._walletAddress.toLowerCase() !== accounts[0].toLowerCase()) {
          setError("Vous n'êtes pas le propriétaire de ce hhNumber");
          setIsLoading(false);
          return;
        }

        const doctorSpecialization = doctorDetails._specialization.toLowerCase();
        setSpecialization(doctorSpecialization);

        const creneauxData = await contractInstance.methods
          .getDisponibilites(doctorSpecialization)
          .call();
        const normalizedCreneaux = creneauxData.map((c) => ({
          date: Number(c.date),
          jourSemaine: Number(c.jourSemaine),
          debut: Number(c.debut),
          fin: Number(c.fin),
          dureeConsultation: Number(c.dureeConsultation),
        }));
        setCreneaux(normalizedCreneaux);
        console.log("Creneaux:", normalizedCreneaux);
      } catch (err) {
        console.error("Erreur initialisation Web3 :", err);
        setError(`Erreur lors de l'initialisation : ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    initWeb3AndContract();
  }, [hhNumber]);

  useEffect(() => {
    if (contract && account && specialization) {
      fetchReservations(contract);
    }
  }, [contract, account, specialization]);

  const fetchReservations = async (contractInstance) => {
    console.log("Fetching reservations for hhNumber:", hhNumber, "from account:", account);
    try {
      const reservationsData = await contractInstance.methods
        .getReservations(specialization)
        .call({ from: account });
      console.log("Raw reservations data:", reservationsData);

      const normalizedReservations = reservationsData.map((r) => ({
        creneauIndex: Number(r.creneauIndex),
        timestampDebut: Number(r.timestampDebut),
        patient: r.patient,
        patientHhNumber: r.patientHhNumber,
        status: Number(r.status) // 0: PENDING, 1: CONFIRMED, 2: CANCELLED
      }));

      console.log("Normalized reservations:", normalizedReservations);
      setReservations(normalizedReservations);
    } catch (err) {
      console.error("Erreur récupération réservations :", err);
      setError(`Erreur lors de la récupération des réservations : ${err.message}`);
    }
  };

  const confirmReservation = async (timestampDebut) => {
    try {
      await contract.methods
        .confirmReservation(specialization, timestampDebut)
        .send({ from: account });
      alert("Réservation confirmée avec succès !");
      fetchReservations(contract); // Rafraîchir les réservations
    } catch (err) {
      console.error("Erreur confirmation :", err);
      alert("Erreur lors de la confirmation : " + err.message);
    }
  };

  const cancelReservation = async (timestampDebut) => {
    try {
      await contract.methods
        .cancelReservation(specialization, timestampDebut)
        .send({ from: account });
      alert("Réservation annulée avec succès !");
      fetchReservations(contract); // Rafraîchir les réservations
    } catch (err) {
      console.error("Erreur annulation :", err);
      alert("Erreur lors de l'annulation : " + err.message);
    }
  };

  const viewPatientDetails = async (patientHhNumber) => {
    try {
      const networkId = await web3.eth.net.getId();
      const patientInstance = new web3.eth.Contract(
        PatientRegistrationABI.abi,
        PatientRegistrationABI.networks[networkId].address
      );
      const patientDetails = await patientInstance.methods.getPatientDetails(patientHhNumber).call();
      // Vérifier la permission du médecin
      const isPermitted = await patientInstance.methods
        .isPermissionGranted(patientHhNumber, hhNumber)
        .call();
      if (!isPermitted) {
        alert("Vous n'avez pas la permission d'accéder aux détails de ce patient.");
        return;
      }
      // Rediriger avec les détails du patient
      navigate(`/patient/${patientHhNumber}/view`, { state: { patientDetails } });
    } catch (err) {
      console.error("Erreur récupération détails patient :", err);
      alert("Erreur lors de la récupération des détails : " + err.message);
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

  const getCreneauDetails = (creneauIndex) => {
    return creneaux[creneauIndex] || {};
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return "En attente";
      case 1: return "Confirmé";
      case 2: return "Annulé";
      default: return "Inconnu";
    }
  };

  return (
    <div className="appointments-container">
      <h2 className="appointments-title">Réservations pour {hhNumber}</h2>

      {isLoading && <p className="loading-message">Chargement des réservations...</p>}
      {error && <p className="error-message">{error}</p>}

      {!isLoading && !error && reservations.length === 0 ? (
        <p className="no-reservations">Aucune réservation pour le moment.</p>
      ) : (
        <div className="appointments-list">
          <h3 className="appointments-subtitle">Liste des réservations :</h3>
          <ul>
            {reservations
              .sort((a, b) => a.timestampDebut - b.timestampDebut)
              .map((reservation, index) => {
                const creneau = getCreneauDetails(reservation.creneauIndex);
                const timestampFin =
                  reservation.timestampDebut + (creneau.dureeConsultation || 900);

                return (
                  <li key={index} className="appointment-item">
                    <strong>
                      {formatDate(reservation.timestampDebut)} -{" "}
                      {formatTime(reservation.timestampDebut)} à {formatTime(timestampFin)}
                    </strong>
                    <br />
                    Patient : {reservation.patientHhNumber || "hhNumber non disponible"}
                    <br />
                    Statut : {getStatusLabel(reservation.status)}
                    <br />
                    Créneau : {creneau.jourSemaine !== undefined ? (
                      `(${["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][creneau.jourSemaine]} ${formatDate(creneau.debut)} ${formatTime(creneau.debut)}-${formatTime(creneau.fin)})`
                    ) : (
                      "Détails du créneau non disponibles"
                    )}
                    <br />
                    {reservation.status === 0 && (
                      <div className="action-buttons">
                        <button
                          onClick={() => confirmReservation(reservation.timestampDebut)}
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => cancelReservation(reservation.timestampDebut)}
                          className="bg-red-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => viewPatientDetails(reservation.patientHhNumber)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Voir
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;