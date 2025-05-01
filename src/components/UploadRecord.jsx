import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { useParams } from "react-router-dom";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import { create } from 'ipfs-http-client';
import "../CSS/UploadRecord.css";

// IPFS local
const ipfs = create({ url: 'http://localhost:5001' });

const UploadRecord = () => {
  const { hhNumber } = useParams();
  const [file, setFile] = useState(null);
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
    if (!file || !contract) return;

    try {
      setStatus("Uploading to IPFS...");
      const added = await ipfs.add(file);
      const ipfsHash = added.path;

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];

      setStatus("Sending transaction...");
      await contract.methods.uploadRecord(hhNumber, ipfsHash).send({ from: account });

      setStatus("Record uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus("Upload failed");
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Past Medical Record</h2>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Submit</button>
      </form>
      <p>{status}</p>
    </div>
  );
};

export default UploadRecord;
