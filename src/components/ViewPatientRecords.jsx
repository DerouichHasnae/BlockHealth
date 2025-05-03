import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Web3 from "web3";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import NavBar_Logout from "./NavBar_Logout";
import "../CSS/ViewPatientRecords.css"; // Import du fichier CSS
function ViewPatientRecords() {
  const { hhNumber } = useParams();
  const [records, setRecords] = useState([]);
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [error, setError] = useState("");

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
            deployedNetwork?.address
          );
          setContract(contractInstance);
        } catch (err) {
          setError("Web3 connection failed");
        }
      } else {
        setError("Please install MetaMask");
      }
    };

    init();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      if (contract && hhNumber) {
        try {
          const result = await contract.methods.getMedicalRecords(hhNumber).call();
          setRecords(result);
        } catch (err) {
          setError("Failed to fetch medical records.");
        }
      }
    };

    fetchRecords();
  }, [contract, hhNumber]);

  return (
    <div>
      <NavBar_Logout />
      <div className="view-records-container">
  <h2 className="records-title">My Medical Records</h2>
  {error && <p className="error-message">{error}</p>}
  <div className="records-grid">
    {records.map((record, index) => (
      <div key={index} className="record-card">
        <p><strong>File Name:</strong> {record.fileName}</p>
        <p><strong>Uploaded:</strong> {new Date(record.timestamp * 1000).toLocaleString()}</p>
        <a
          href={`https://ipfs.io/ipfs/${record.ipfsHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="record-link"
        >
          🔗 View File
        </a>
      </div>
    ))}
  </div>
</div>

    </div>
  );
}

export default ViewPatientRecords;
