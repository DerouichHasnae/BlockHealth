import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import { create } from 'ipfs-http-client';
import "../CSS/Upload.css";

// Utilise ton nœud IPFS local
const ipfs = create({ url: 'http://localhost:5001' });

const UploadRecord = () => {
  const { hhNumber } = useParams();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = PatientRegistration.networks[networkId];
          const contractInstance = new web3Instance.eth.Contract(
            PatientRegistration.abi,
            deployedNetwork?.address
          );
          setWeb3(web3Instance);
          setContract(contractInstance);
        } catch (err) {
          console.error("Blockchain init error", err);
        }
      }
    };

    init();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !contract || !description) {
      setStatus("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setStatus("Uploading to IPFS...");
      const added = await ipfs.add(file);
      const ipfsHash = added.path;

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];

      setStatus("Sending transaction...");
      await contract.methods
        .uploadMedicalRecord(hhNumber, ipfsHash, description)
        .send({ from: account });

      setStatus("Record uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus("Upload failed");
    }
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">Upload Past Medical Record</h2>
      <form className="upload-form" onSubmit={handleUpload}>
        <label className="upload-label">
          Select File
          <input
            type="file"
            className="upload-input"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </label>
        <label className="upload-label">
          Description
          <input
            type="text"
            className="upload-input"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <button type="submit" className="upload-button">Submit</button>
      </form>
      <p className="upload-status">{status}</p>
    </div>
  );
  
};

export default UploadRecord;
