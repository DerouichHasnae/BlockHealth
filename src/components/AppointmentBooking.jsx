import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import AvailabilityABI from "../build/contracts/Availability.json";
import DoctorRegistrationABI from "../build/contracts/DoctorRegistration.json";
import DoctorRegistryABI from "../build/contracts/DoctorRegistry.json";
import "../CSS/Appointment.css";

const AppointmentBooking = () => {
  const { hhNumber } = useParams();
  const [web3, setWeb3] = useState(null);
  const [availabilityContract, setAvailabilityContract] = useState(null);
  const [doctorRegistryContract, setDoctorRegistryContract] = useState(null);
  const [account, setAccount] = useState("");
  const [creneaux, setCreneaux] = useState([]);
  const [selectedMedecin, setSelectedMedecin] = useState("");
  const [selectedSpecialite, setSelectedSpecialite] = useState("");
  const [medecins, setMedecins] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialisation Web3 et contrats
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3Instance.eth.net.getId();
          
          // Initialiser le contrat Availability
          const availabilityDeployed = AvailabilityABI.networks[networkId];
          setAvailabilityContract(new web3Instance.eth.Contract(
            AvailabilityABI.abi,
            availabilityDeployed?.address
          ));

          // Initialiser le contrat DoctorRegistry
          const doctorRegistryDeployed = DoctorRegistryABI.networks[networkId];
          const doctorRegistry = new web3Instance.eth.Contract(
            DoctorRegistryABI.abi,
            doctorRegistryDeployed?.address
          );
          setDoctorRegistryContract(doctorRegistry);

          // Charger les spécialités disponibles
          const specialties = await doctorRegistry.methods.getAllSpecialties().call();
          setSpecialites(specialties.map(spec => ({ 
            code: spec, 
            nom: translateSpecialty(spec) 
          })));

        } catch (error) {
          console.error("Initialization error:", error);
          setError("Erreur de connexion à la blockchain");
        }
      } else {
        setError("Veuillez installer MetaMask");
      }
    };

    init();
  }, []);

  const translateSpecialty = (specialty) => {
    const translations = {
      "Cardiology": "Cardiologie",
      "Neurology": "Neurologie",
      "Oncology": "Oncologie",
      "Gynecology": "Gynécologie",
      "Dermatology": "Dermatologie",
      "Ophthalmology": "Ophtalmologie",
      "Psychiatry": "Psychiatrie",
      "Radiology": "Radiologie"
    };
    return translations[specialty] || specialty;
  };

  const loadMedecins = async (specialite) => {
    if (!doctorRegistryContract || !specialite) return;
    
    setLoading(true);
    setError(null);
    try {
      // Récupérer les HHNumbers des médecins de cette spécialité
      const hhNumbers = await doctorRegistryContract.methods
        .getDoctorsBySpecialty(specialite)
        .call();

      // Récupérer les détails de chaque médecin
      const doctorsList = await Promise.all(
        hhNumbers.map(async hhNumber => {
          const [name, hospital] = await doctorRegistryContract.methods
            .getDoctorDetails(hhNumber)
            .call();
          return { hhNumber, name, hospital, specialization: specialite };
        })
      );

      setMedecins(doctorsList);
    } catch (error) {
      console.error("Error loading doctors:", error);
      setError("Erreur lors du chargement des médecins");
    } finally {
      setLoading(false);
    }
  };

  const fetchCreneauxDisponibles = async () => {
    if (!availabilityContract || !selectedMedecin) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await availabilityContract.methods
        .getDisponibilites(selectedMedecin)
        .call();
      
      const creneauxDisponibles = result
        .filter(c => c.patient === "0x0000000000000000000000000000000000000000")
        .map((c, index) => ({
          index,
          date: new Date(Number(c.date) * 1000),
          debut: new Date(Number(c.debut) * 1000),
          fin: new Date(Number(c.fin) * 1000),
          jourSemaine: Number(c.jourSemaine)
        }));
      
      setCreneaux(creneauxDisponibles);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setError("Erreur lors du chargement des créneaux");
    } finally {
      setLoading(false);
    }
  };

  const reserverCreneau = async (creneauIndex) => {
    if (!availabilityContract || !selectedMedecin || !account) return;

    setLoading(true);
    setError(null);
    try {
      await availabilityContract.methods
        .reserverCreneau(selectedMedecin, creneauIndex)
        .send({ from: account });

      await fetchCreneauxDisponibles();
      alert("Rendez-vous confirmé !");
    } catch (error) {
      console.error("Booking error:", error);
      setError("Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="appointment-container">
      <h2>Prendre un rendez-vous</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="selection-container">
        <div className="form-group">
          <label>Spécialité médicale :</label>
          <select
            value={selectedSpecialite}
            onChange={(e) => {
              setSelectedSpecialite(e.target.value);
              loadMedecins(e.target.value);
              setSelectedMedecin("");
              setCreneaux([]);
            }}
            disabled={loading}
          >
            <option value="">-- Choisir une spécialité --</option>
            {specialites.map((spec) => (
              <option key={spec.code} value={spec.code}>
                {spec.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Médecin :</label>
          <select
            value={selectedMedecin}
            onChange={(e) => setSelectedMedecin(e.target.value)}
            disabled={!selectedSpecialite || loading}
          >
            <option value="">-- Choisir un médecin --</option>
            {medecins.map((medecin) => (
              <option key={medecin.hhNumber} value={medecin.hhNumber}>
                {medecin.name} - {medecin.hospital} ({medecin.hhNumber})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchCreneauxDisponibles}
          disabled={!selectedMedecin || loading}
          className="btn-fetch"
        >
          {loading ? 'Chargement...' : 'Voir les disponibilités'}
        </button>
      </div>

      {creneaux.length > 0 && (
        <div className="creneaux-container">
          <h3>Créneaux disponibles :</h3>
          <ul>
            {creneaux.map((creneau, index) => (
              <li key={index} className="creneau-item">
                <div className="creneau-info">
                  <span className="creneau-date">{formatDate(creneau.date)}</span>
                  <span className="creneau-time">
                    {formatTime(creneau.debut)} - {formatTime(creneau.fin)}
                  </span>
                </div>
                <button
                  onClick={() => reserverCreneau(creneau.index)}
                  disabled={loading}
                  className="btn-reserve"
                >
                  Réserver
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedMedecin && creneaux.length === 0 && !loading && (
        <div className="no-slots">
          Aucun créneau disponible pour ce médecin.
        </div>
      )}
    </div>
  );
};

export default AppointmentBooking;