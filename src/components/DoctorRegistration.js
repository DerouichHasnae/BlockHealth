import React, { useState, useEffect } from "react";
import Web3 from "web3";
import DoctorRegistration from "../build/contracts/DoctorRegistration.json";
import { useNavigate } from "react-router-dom";
import "./DoctorRegistration.css";
import NavBar from "./NavBar";
import { 
  FaUserMd, 
  FaHospital, 
  FaMapMarkerAlt, 
  FaBirthdayCake, 
  FaTransgender, 
  FaEnvelope, 
  FaIdCard, 
  FaStethoscope, 
  FaProcedures, 
  FaUserTag, 
  FaBriefcase, 
  FaLock, 
  FaLockOpen,
  FaTimes,
  FaCheck
} from "react-icons/fa";

const DoctorRegistry = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalLocation, setHospitalLocation] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [hhNumber, sethhNumber] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [workExperience, setWorkExperience] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
          });
  
          if (accounts.length > 0) {
            setDoctorAddress(accounts[0]);
            setIsConnected(true);
          }
  
          const web3Instance = new Web3(window.ethereum);
          const networkId = await web3Instance.eth.net.getId();  // id reseau gan
          const deployedNetwork = DoctorRegistration.networks[networkId]; //add con
  
          if (!deployedNetwork) {
            alert("Le contrat n'est pas déployé sur ce réseau.");
            return;
          }
  
          const contractInstance = new web3Instance.eth.Contract(
            DoctorRegistration.abi,
            deployedNetwork.address
          );
  
          setWeb3(web3Instance);
          setContract(contractInstance);
  
          window.ethereum.on("accountsChanged", (newAccounts) => {
            setDoctorAddress(newAccounts[0] || "");
            setIsConnected(newAccounts.length > 0);
          });
  
        } catch (error) {
          console.error("Erreur de connexion :", error);
          alert("Erreur de connexion au réseau Ethereum.");
        }
      }
    };
  
    init();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!doctorName) newErrors.doctorName = "Le nom est requis";
    if (!hospitalName) newErrors.hospitalName = "Le nom de l'hôpital est requis";
    if (!hospitalLocation) newErrors.hospitalLocation = "La localisation est requise";
    if (!dateOfBirth) newErrors.dateOfBirth = "La date de naissance est requise";
    if (!gender) newErrors.gender = "Le genre est requis";
    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email invalide";
    }
    if (!hhNumber) {
      newErrors.hhNumber = "Le numéro HH est requis";
    } else if (!/^\d{6}$/.test(hhNumber)) {
      newErrors.hhNumber = "Doit contenir 6 chiffres";
    }
    if (!specialization) newErrors.specialization = "La spécialisation est requise";
    if (!department) newErrors.department = "Le service est requis";
    if (!designation) newErrors.designation = "La désignation est requise";
    if (!workExperience) newErrors.workExperience = "L'expérience est requise";
    if (!password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (password.length < 8) {
      newErrors.password = "Minimum 8 caractères";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirmation requise";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!window.ethereum) {
      alert("Veuillez installer MetaMask !");
      return;
    }
  
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length === 0) {
      alert("Veuillez vous connecter à MetaMask !");
      return;
    }
    const currentAccount = accounts[0];

    try {
      await contract.methods
        .registerDoctor(
          doctorName,
          hospitalName,
          dateOfBirth,
          gender,
          email,
          hhNumber,
          specialization,
          department,
          designation,
          workExperience,
          password
        )
        .send({ from: currentAccount });

      alert("Inscription réussie !");
      navigate("/");
    } catch (error) {
      console.error("Erreur :", error);
      alert("Échec de l'inscription.");
    }
  };

  const cancelOperation = () => {
    navigate("/");
  };

  return (
    <div className="doctor-registration-container">
      <NavBar />
      <div className="registration-card">
        <div className="registration-header">
          <h1 className="registration-title">
            <FaUserMd /> Inscription du Médecin
          </h1>
          {isConnected && (
            <p className="text-sm text-gray-600">
              Connecté avec: {doctorAddress.substring(0, 6)}...{doctorAddress.substring(doctorAddress.length - 4)}
            </p>
          )}
        </div>

        <form className="registration-form" onSubmit={handleRegister}>
          {/* Section Informations Personnelles */}
          <div className="form-section">
            <h2 className="section-title">
              <FaUserMd /> Informations Personnelles
            </h2>
            
            <div className="form-group">
              <label className="form-label" htmlFor="doctorName">
                <FaUserMd /> Nom/Prénom
              </label>
              <input
                id="doctorName"
                className={`form-input ${errors.doctorName ? 'error' : ''}`}
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Nom complet"
              />
              {errors.doctorName && <span className="error-message">{errors.doctorName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dateOfBirth">
                <FaBirthdayCake /> Date de naissance
              </label>
              <input
                id="dateOfBirth"
                className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gender">
                <FaTransgender /> Genre
              </label>
              <select
                id="gender"
                className={`form-input ${errors.gender ? 'error' : ''}`}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Sélectionner le sexe</option>
                <option value="Male">Homme</option>
                <option value="Female">Féminin</option>
              </select>
              {errors.gender && <span className="error-message">{errors.gender}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                <FaEnvelope /> Adresse email
              </label>
              <input
                id="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          {/* Section Informations Professionnelles */}
          <div className="form-section">
            <h2 className="section-title">
              <FaBriefcase /> Informations Professionnelles
            </h2>
            
            <div className="form-group">
              <label className="form-label" htmlFor="hospitalName">
                <FaHospital /> Nom de l'Hôpital
              </label>
              <input
                id="hospitalName"
                className={`form-input ${errors.hospitalName ? 'error' : ''}`}
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="Nom de l'hôpital"
              />
              {errors.hospitalName && <span className="error-message">{errors.hospitalName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hospitalLocation">
                <FaMapMarkerAlt /> Localisation de l'hôpital
              </label>
              <input
                id="hospitalLocation"
                className={`form-input ${errors.hospitalLocation ? 'error' : ''}`}
                type="text"
                value={hospitalLocation}
                onChange={(e) => setHospitalLocation(e.target.value)}
                placeholder="Adresse de l'hôpital"
              />
              {errors.hospitalLocation && <span className="error-message">{errors.hospitalLocation}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hhNumber">
                <FaIdCard /> Numéro HH
              </label>
              <input
                id="hhNumber"
                className={`form-input ${errors.hhNumber ? 'error' : ''}`}
                type="text"
                value={hhNumber}
                onChange={(e) => sethhNumber(e.target.value)}
                placeholder="123456"
                maxLength="6"
              />
              {errors.hhNumber && <span className="error-message">{errors.hhNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="specialization">
                <FaStethoscope /> Spécialisation
              </label>
              <select
                id="specialization"
                className={`form-input ${errors.specialization ? 'error' : ''}`}
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              >
                <option value="">Sélectionner spécialisation</option>
                <option value="Cardiology">Cardiologie</option>
                <option value="Neurology">Neurologie</option>
                <option value="Oncology">Oncologie</option>
                <option value="Gynecology">Gynécologie</option>
                <option value="Dermatology">Dermatologie</option>
                <option value="Ophthalmology">Ophtalmologie</option>
                <option value="Psychiatry">Psychiatrie</option>
                <option value="Radiology">Radiologie</option>
                <option value="Other">Autre</option>
              </select>
              {errors.specialization && <span className="error-message">{errors.specialization}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="department">
                <FaProcedures /> Service
              </label>
              <select
                id="department"
                className={`form-input ${errors.department ? 'error' : ''}`}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Sélectionner un service</option>
                <option value="Casualty">Blessures</option>
                <option value="Surgery">Chirurgie</option>
                <option value="Laboratory Services">Laboratoire</option>
                <option value="Other">Autre</option>
              </select>
              {errors.department && <span className="error-message">{errors.department}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="designation">
                <FaUserTag /> Désignation
              </label>
              <select
                id="designation"
                className={`form-input ${errors.designation ? 'error' : ''}`}
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              >
                <option value="">Sélectionner la désignation</option>
                <option value="Doctor">Docteur</option>
                <option value="Surgeon">Chirurgien</option>
                <option value="Nurse">Infirmier(ère)</option>
                <option value="Other">Autre</option>
              </select>
              {errors.designation && <span className="error-message">{errors.designation}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="workExperience">
                <FaBriefcase /> Expérience (années)
              </label>
              <input
                id="workExperience"
                className={`form-input ${errors.workExperience ? 'error' : ''}`}
                type="number"
                value={workExperience}
                onChange={(e) => setWorkExperience(e.target.value)}
                placeholder="5"
                min="0"
              />
              {errors.workExperience && <span className="error-message">{errors.workExperience}</span>}
            </div>
          </div>

          {/* Section Sécurité */}
          <div className="form-section">
            <h2 className="section-title">
              <FaLock /> Sécurité
            </h2>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                <FaLock /> Mot de passe
              </label>
              <input
                id="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                <FaLockOpen /> Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez votre mot de passe"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="primary-button"
            >
              <FaCheck /> S'inscrire
            </button>
            <button
              type="button"
              onClick={cancelOperation}
              className="secondary-button"
            >
              <FaTimes /> Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorRegistry;