// src/components/DoctorList.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const DoctorList = () => {
  const { hhNumber } = useParams(); // Récupérer hhNumber
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const navigate = useNavigate();

  const handleSpecialtyChange = (e) => {
    const spec = e.target.value;
    setSelectedSpecialty(spec);
    if (spec && hhNumber) {
      navigate(`/medecins/${spec}/${hhNumber}`);
    } else {
      alert("hhNumber manquant. Veuillez vous connecter.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Sélectionner une spécialité</h1>
      <select
        className="border p-2 w-full mb-6"
        value={selectedSpecialty}
        onChange={handleSpecialtyChange}
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