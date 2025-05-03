import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import NavBar_Logout from "./NavBar_Logout";
import "../CSS/ViewPatientList.css"; // Import du fichier CSS

function ViewPatientList() {
  const { hhNumber } = useParams();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [patients, setPatients] = useState([]);
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

        const patientList = await contractInstance.methods
          .getPatientList(hhNumber)
          .call();

        setPatients(patientList);
      }
    };

    init();
  }, [hhNumber]);

  const handleViewDetails = (patientHhNumber) => {
    navigate(`/doctor/viewpatient/${patientHhNumber}`);
  };
  const handleDelete = async (patientHhNumber) => {
    try {
      await contract.methods
        .revokeAccess(patientHhNumber) // Ou une méthode appropriée dans ton smart contract
        .send({ from: account });
  
      // Mettre à jour la liste localement après suppression
      const updatedList = patients.filter(
        (p) => p.patient_number !== patientHhNumber
      );
      setPatients(updatedList);
      alert("Access revoked successfully.");
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Failed to revoke access.");
    }
  };
  

  return (
    <div className="view-patient-container">
      <NavBar_Logout />
      <div className="view-patient-content">
        <h2 className="title">Patients Who Granted You Access</h2>
        {patients.length === 0 ? (
          <p className="no-patients">No patients have granted you access yet.</p>
        ) : (
          <table className="patient-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr key={index}>
                  <td>{patient.patient_name}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetails(patient.patient_number)}
                    >
                      View
                    </button>
                    <button className="btn-delete">
                      Delete
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

export default ViewPatientList;
