import React, { useEffect, useState } from "react";
import Web3 from "web3";
import DoctorRegistrationABI from "../build/contracts/DoctorRegistration.json";
import AvailabilityABI from "../build/contracts/Availability.json";

const DoctorList = () => {
  const [web3, setWeb3] = useState(null);
  const [doctorContract, setDoctorContract] = useState(null);
  const [availabilityContract, setAvailabilityContract] = useState(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [doctorList, setDoctorList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [disponibilites, setDisponibilites] = useState([]);

  useEffect(() => {
    const initWeb3AndContracts = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();

        const deployedDoctor = DoctorRegistrationABI.networks[networkId];
        const deployedAvailability = AvailabilityABI.networks[networkId];

        if (!deployedDoctor || !deployedAvailability) {
          alert("Contrats non déployés sur ce réseau");
          return;
        }

        const doctorInstance = new web3Instance.eth.Contract(
          DoctorRegistrationABI.abi,
          deployedDoctor.address
        );
        setDoctorContract(doctorInstance);

        const availabilityInstance = new web3Instance.eth.Contract(
          AvailabilityABI.abi,
          deployedAvailability.address
        );
        setAvailabilityContract(availabilityInstance);
      } else {
        alert("Veuillez installer MetaMask !");
      }
    };

    initWeb3AndContracts();
  }, []);

  const getAllDoctorHhNumbers = async () => {
    if (!doctorContract) return [];
    try {
      const hhList = await doctorContract.methods.getAllHhNumbers().call();
      return hhList;
    } catch (err) {
      console.error("Erreur récupération des HH Numbers :", err);
      return [];
    }
  };
  

  const handleSpecialtyChange = async (e) => {
    const spec = e.target.value;
    setSelectedSpecialty(spec);
    setSelectedDoctor(null);
    setDisponibilites([]);
    setDoctorList([]);

    if (!doctorContract) return;

    const doctorIds = await getAllDoctorHhNumbers();
    const matchingDoctors = [];

    for (const hh of doctorIds) {
      try {
        const details = await doctorContract.methods.getDoctorDetails(hh).call();
        if (details[6] === spec) {
          matchingDoctors.push({ hhNumber: hh, name: details[1] });
        }
      } catch (err) {
        console.error("Erreur récupération médecin:", err);
      }
    }

    setDoctorList(matchingDoctors);
  };

  const handleDoctorClick = async (doctor) => {
    setSelectedDoctor(doctor);
    if (!availabilityContract) return;

    try {
      const slots = await availabilityContract.methods
        .getDisponibilites(doctor.hhNumber)
        .call();
      setDisponibilites(slots);
    } catch (err) {
      console.error("Erreur récupération des disponibilités :", err);
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

      {doctorList.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Médecins disponibles :</h2>
          <ul className="mt-2 space-y-2">
            {doctorList.map((doc) => (
              <li
                key={doc.hhNumber}
                className="cursor-pointer text-blue-600 underline"
                onClick={() => handleDoctorClick(doc)}
              >
                {doc.name} ({doc.hhNumber})
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedDoctor && disponibilites.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg">Créneaux pour {selectedDoctor.name} :</h3>
          <ul className="mt-2">
            {disponibilites.map((cr, idx) => (
              <li key={idx}>
                🕒 {new Date(Number(cr.debut) * 1000).toLocaleString()} -{" "}
                {new Date(Number(cr.fin) * 1000).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DoctorList;
