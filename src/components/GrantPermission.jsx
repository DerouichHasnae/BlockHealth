import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import "../CSS/GrantPermission.css"; // Import du fichier CSS
function GrantPermission() {
  const { hhNumber } = useParams();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [doctorHhNumber, setDoctorHhNumber] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = PatientRegistration.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            PatientRegistration.abi,
            deployedNetwork.address
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Failed to initialize web3 or contract:", error);
        }
      }
    };

    initWeb3();
  }, []);

  const handleGrantPermission = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  
      // 🔹 Appel à getPatientDetails pour récupérer le nom
      const patientDetails = await contract.methods.getPatientDetails(hhNumber).call();
      const patientName = patientDetails[1]; // index 1 = name (cf ordre dans le contrat)
  
      // 🔹 Appel à grantPermission avec le vrai nom
      await contract.methods
        .grantPermission(hhNumber, doctorHhNumber, patientName)
        .send({ from: accounts[0] });
  
      setStatus("Permission granted successfully!");
    } catch (error) {
      console.error("Error granting permission:", error);
      setStatus("Failed to grant permission.");
    }
  };
  

  return (
    <div className="grant-permission-container">
      <h2>Grant Access to Doctor</h2>
      <input
        type="text"
        placeholder="Enter Doctor HH Number"
        value={doctorHhNumber}
        onChange={(e) => setDoctorHhNumber(e.target.value)}
      />
      <button onClick={handleGrantPermission}>Grant Permission</button>
      <p>{status}</p>
    </div>
  );
}

export default GrantPermission;
