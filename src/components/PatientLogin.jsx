import React, { useState } from "react";
import Web3 from "web3";
import PatientRegistration from "../build/contracts/PatientRegistration.json";
import { useNavigate } from "react-router-dom";
import "../CSS/Patient.css";
import NavBar from "./NavBar";

const PatientLogin = () => {
  const navigate = useNavigate();
  const [hhNumberError, sethhNumberError] = useState("");
  const [hhNumber, sethhNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [doctorDetails, setPatientDetails] = useState(null);

  const handlehhNumberChange = (e) => {
    const inputhhNumber = e.target.value;
    const phoneRegex = /^\d{6}$/;
    if (phoneRegex.test(inputhhNumber)) {
      sethhNumber(inputhhNumber);
      sethhNumberError("");
    } else {
      sethhNumber(inputhhNumber);
      sethhNumberError("Please enter a 6-digit HH Number.");
    }
  };

  const handleCheckRegistration = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = PatientRegistration.networks[networkId];
      const contract = new web3.eth.Contract(
        PatientRegistration.abi,
        deployedNetwork && deployedNetwork.address
      );

      const isRegisteredResult = await contract.methods
        .isRegisteredPatient(hhNumber)
        .call();
      setIsRegistered(isRegisteredResult);

      if (isRegisteredResult) {
        const isValidPassword = await contract.methods
          .validatePassword(hhNumber, password)
          .call();

        if (isValidPassword) {
          const doctor = await contract.methods
            .getPatientDetails(hhNumber)
            .call();
          setPatientDetails(doctor);
          navigate("/patient/" + hhNumber);
        } else {
          alert("Incorrect password");
        }
      } else {
        alert("Patient not registered");
      }
    } catch (error) {
      console.error("Error checking registration:", error);
      alert("An error occurred while checking registration.");
    }
  };

  const cancelOperation = () => {
    navigate("/");
  };

  return (
    <div>
      <NavBar />
      <div className="patient-login-container">
  <div className="patient-login-box">
    <h2>Patient Login</h2>

    <div className="form-group">
      <label htmlFor="hhNumber">HH Number</label>
      <input
        id="hhNumber"
        name="hhNumber"
        type="text"
        required
        value={hhNumber}
        onChange={handlehhNumberChange}
      />
      {hhNumberError && <p className="error-message">{hhNumberError}</p>}
    </div>

    <div className="form-group">
      <label>Password</label>
      <input
        type="password"
        placeholder="Enter your Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>

    <div className="button-group">
      <button onClick={handleCheckRegistration}>Login</button>
      <button onClick={cancelOperation}>Close</button>
    </div>
  </div>
</div>

    </div>
  );
};

export default PatientLogin;