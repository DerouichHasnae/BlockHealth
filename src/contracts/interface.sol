// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDoctorRegistration {
    function getDoctorDetails(string memory _hhNumber) external view returns (
        address _walletAddress,
        string memory _doctorName,
        string memory _hospitalName,
        string memory _dateOfBirth,
        string memory _gender,
        string memory _email,
        string memory _specialization,
        string memory _department,
        string memory _designation,
        string memory _workExperience
    );
    function isDoctorInSpecialization(address doctorAddress, string memory specialization) external view returns (bool);
}

interface IPatientRegistration {
    function isPatientRegistered(string memory _hhNumber) external view returns (bool);
    function isPermissionGranted(string memory _patientNumber, string memory _doctorNumber) external view returns (bool);
}