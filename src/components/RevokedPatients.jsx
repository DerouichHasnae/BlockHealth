import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import NavBar_Logout from "./NavBar_Logout";
import "../CSS/ViewPatientList.css"; // Import du fichier CSS

function RevokedPatients() {
  const { hhNumber } = useParams(); // Récupère le numéro du médecin depuis l'URL
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [revokedPatients, setRevokedPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.requestAccounts();
        setAccount(accounts[0]);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = PatientRegistration.networks[networkId];

        const contractInstance = new web3Instance.eth.Contract(
          PatientRegistration.abi,
          deployedNetwork.address
        );
        setContract(contractInstance);

        // Récupérer la liste des patients révoqués
        const revokedList = await contractInstance.methods
          .getRevokedPatients(hhNumber)
          .call();
        setRevokedPatients(revokedList);
      }
    };

    init();
  }, [hhNumber]);

  const handleRestore = async (patientHhNumber) => {
    try {
      await contract.methods
        .restoreAccess(hhNumber, patientHhNumber) // Récupérer l'accès
        .send({ from: account });

      // Mettre à jour la liste localement après restauration
      const updatedRevokedList = revokedPatients.filter(
        (p) => p.patient_number !== patientHhNumber
      );
      setRevokedPatients(updatedRevokedList);

      alert("Access restored successfully.");
    } catch (error) {
      console.error("Error restoring access:", error);
      alert("Failed to restore access.");
    }
  };

  return (
    <div className="view-patient-container">
      <NavBar_Logout />
      <div className="view-patient-content">
        <h2 className="title">Revoked Patients</h2>
        {revokedPatients.length === 0 ? (
          <p className="no-patients">No patients have been revoked yet.</p>
        ) : (
          <table className="patient-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {revokedPatients.map((patient, index) => (
                <tr key={index}>
                  <td>{patient.patient_name}</td>
                  <td>
                    <button
                      className="btn-restore"
                      onClick={() => handleRestore(patient.patient_number)}
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default RevokedPatients;
