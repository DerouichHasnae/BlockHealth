// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interface.sol";

contract ClinicalObservation {
    struct Observation {
        string patientHhNumber;
        string doctorHhNumber;
        string description;
        uint256 timestamp;
    }

    mapping(string => Observation[]) public observations; // patientHhNumber => observations
    mapping(string => string[]) private doctorPatients; // doctorHhNumber => patientHhNumber[]
    IDoctorRegistration private doctorRegistration;
    IPatientRegistration private patientRegistration;

    event ObservationAdded(
        string patientHhNumber,
        string doctorHhNumber,
        string description,
        uint256 timestamp
    );

    constructor(address _doctorRegistrationAddress, address _patientRegistrationAddress) {
        doctorRegistration = IDoctorRegistration(_doctorRegistrationAddress);
        patientRegistration = IPatientRegistration(_patientRegistrationAddress);
    }

    function addObservation(
        string memory _patientHhNumber,
        string memory _doctorHhNumber,
        string memory _description
    ) external {
        require(
            patientRegistration.isPatientRegistered(_patientHhNumber),
            "Patient non enregistre"
        );
        require(
            patientRegistration.isPermissionGranted(_patientHhNumber, _doctorHhNumber),
            "Medecin non autorise"
        );
        (address doctorAddress, , , , , , , , , ) = doctorRegistration.getDoctorDetails(_doctorHhNumber);
        require(doctorAddress == msg.sender, "Seul le medecin peut ajouter une observation");
        require(doctorAddress != address(0), "Medecin non enregistre");
        require(bytes(_description).length > 0, "Description requise");

        Observation memory newObservation = Observation({
            patientHhNumber: _patientHhNumber,
            doctorHhNumber: _doctorHhNumber,
            description: _description,
            timestamp: block.timestamp
        });

        observations[_patientHhNumber].push(newObservation);

        // Ajouter le patient à la liste du médecin s'il n'y est pas déjà
        bool patientExists = false;
        for (uint i = 0; i < doctorPatients[_doctorHhNumber].length; i++) {
            if (keccak256(bytes(doctorPatients[_doctorHhNumber][i])) == keccak256(bytes(_patientHhNumber))) {
                patientExists = true;
                break;
            }
        }
        if (!patientExists) {
            doctorPatients[_doctorHhNumber].push(_patientHhNumber);
        }

        emit ObservationAdded(_patientHhNumber, _doctorHhNumber, _description, block.timestamp);
    }

    function getObservations(string memory _patientHhNumber) external view returns (Observation[] memory) {
        return observations[_patientHhNumber];
    }

    function getPatientsByDoctor(string memory _doctorHhNumber) external view returns (string[] memory) {
        return doctorPatients[_doctorHhNumber];
    }
     function getObservationsByDoctor(
        string memory _patientHhNumber,
        string memory _doctorHhNumber
    ) external view returns (Observation[] memory) {
        Observation[] memory patientObservations = observations[_patientHhNumber];
        uint256 count = 0;

        // Compter le nombre d'observations pour ce médecin
        for (uint i = 0; i < patientObservations.length; i++) {
            if (keccak256(bytes(patientObservations[i].doctorHhNumber)) == keccak256(bytes(_doctorHhNumber))) {
                count++;
            }
        }

        // Créer un tableau pour stocker les observations du médecin
        Observation[] memory result = new Observation[](count);
        uint256 index = 0;

        // Remplir le tableau avec les observations correspondantes
        for (uint i = 0; i < patientObservations.length; i++) {
            if (keccak256(bytes(patientObservations[i].doctorHhNumber)) == keccak256(bytes(_doctorHhNumber))) {
                result[index] = patientObservations[i];
                index++;
            }
        }

        return result;
    }
}