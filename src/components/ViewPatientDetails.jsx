import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import "../CSS/ViewPatientDetails.css";

function ViewPatientDetails() {
  const { hhNumber } = useParams();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const init = async () => {
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

          const patientDetails = await contractInstance.methods
            .getPatientDetails(hhNumber)
            .call();

          setPatientInfo({
            wallet: patientDetails[0],
            name: patientDetails[1],
            dateOfBirth: patientDetails[2],
            gender: patientDetails[3],
            bloodGroup: patientDetails[4],
            address: patientDetails[5],
            email: patientDetails[6],
          });
        } catch (error) {
          console.error("Error loading patient details:", error);
          setStatus("Failed to load patient data.");
        }
      }
    };

    init();
  }, [hhNumber]);

  return (
    <div className="view-patient-container">
      <h2>Patient Details</h2>
      {patientInfo ? (
        <div className="patient-info">
          <p><strong>Name:</strong> {patientInfo.name}</p>
          <p><strong>Date of Birth:</strong> {patientInfo.dateOfBirth}</p>
          <p><strong>Gender:</strong> {patientInfo.gender}</p>
          <p><strong>Blood Group:</strong> {patientInfo.bloodGroup}</p>
          <p><strong>Address:</strong> {patientInfo.address}</p>
          <p><strong>Email:</strong> {patientInfo.email}</p>
        </div>
      ) : (
        <p>Loading patient info...</p>
      )}

      <div className="button-group">
        <button onClick={() => alert("Opening records...")}>🗂 View Records</button>
        <button onClick={() => alert("Consulting prescription...")}>💊 Prescription/Consultancy</button>
      </div>

      <p>{status}</p>
    </div>
  );
}

export default ViewPatientDetails;
