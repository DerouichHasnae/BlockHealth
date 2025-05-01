import React, { useState, useEffect } from "react";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import Web3 from "web3";
import { useNavigate, useParams } from "react-router-dom";
import "../CSS/ViewProfile.css";
import NavBar_Logout from "./NavBar_Logout";

const ViewProfile = () => {
  const { hhNumber } = useParams();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [error, setError] = useState(null);

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
        } catch (error) {
          console.error('Error initializing Web3:', error);
          setError('Error connecting to blockchain');
        }
      } else {
        setError('Please install MetaMask extension');
      }
    };

    init();
  }, []);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!contract || !hhNumber) return;

      try {
        const result = await contract.methods.getPatientDetails(hhNumber).call();
        setPatientDetails(result);
      } catch (error) {
        console.error('Error retrieving patient details:', error);
        setError('Error loading patient data');
      }
    };

    fetchPatientDetails();
  }, [contract, hhNumber]);

  const cancelOperation = () => {
    navigate(`/patient/${hhNumber}`);
  };

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <p className="profile-detail">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar_Logout />
      <div className="profile-container">
        <div className="profile-content">
          <h1 className="profile-title">Profile</h1>
          
          {patientDetails ? (
            <div>
              <p className="profile-detail">
                <span className="profile-detail-label">Name:</span>
                <span className="profile-detail-value">{patientDetails.name}</span>
              </p>
              <p className="profile-detail">
                <span className="profile-detail-label">DOB:</span>
                <span className="profile-detail-value">{patientDetails.dateOfBirth}</span>
              </p>
              <p className="profile-detail">
                <span className="profile-detail-label">Gender:</span>
                <span className="profile-detail-value">{patientDetails.gender}</span>
              </p>
              <p className="profile-detail">
                <span className="profile-detail-label">Blood Group:</span>
                <span className="profile-detail-value">{patientDetails.bloodGroup}</span>
              </p>
              <p className="profile-detail">
                <span className="profile-detail-label">Address:</span>
                <span className="profile-detail-value">{patientDetails.homeAddress}</span>
              </p>
              <p className="profile-detail">
                <span className="profile-detail-label">Email:</span>
                <span className="profile-detail-value">{patientDetails.email}</span>
              </p>
            </div>
          ) : (
            <p className="profile-detail">Loading patient data...</p>
          )}

          <div className="profile-button-container">
            <button
              onClick={cancelOperation}
              className="profile-close-btn"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;