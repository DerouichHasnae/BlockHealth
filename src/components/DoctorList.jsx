import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../CSS/DoctorList.css";

const DoctorList = ({ onSpecialtyChange }) => {
  const { hhNumber } = useParams();
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const navigate = useNavigate();

  const handleSpecialtyChange = (e) => {
    const spec = e.target.value;
    setSelectedSpecialty(spec);
    if (onSpecialtyChange) {
      onSpecialtyChange(spec); // Call the passed prop function
    } else if (spec && hhNumber) {
      navigate(`/medecins/${spec}/${hhNumber}`);
    } else {
      alert("hhNumber manquant. Veuillez vous connecter.");
    }
  };

  return (
    <div className="doctor-list-container">
      <h1 className="doctor-list-title">Sélectionner une spécialité</h1>
      <select
        className="select-input"
        value={selectedSpecialty}
        onChange={handleSpecialtyChange}
        aria-label="Sélectionner une spécialité médicale"
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
      </select>
    </div>
  );
};

export default DoctorList;