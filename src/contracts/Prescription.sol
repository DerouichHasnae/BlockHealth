// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./interface.sol";

contract Prescription {
    struct PrescriptionEntry {
        string patientHhNumber;
        string doctorHhNumber;
        string medication;
        uint256 dosesPerDay;
        string[] intakeTimes; // Par ex., ["Matin", "Soir"]
        uint256 durationDays;
        uint256 timestamp;
    }

    mapping(string => PrescriptionEntry[]) public prescriptions; // patientHhNumber => liste de prescriptions
    mapping(string => string[]) private doctorPatients; // doctorHhNumber => liste de patients
    IDoctorRegistration private doctorRegistration;
    IPatientRegistration private patientRegistration;

    event PrescriptionAdded(
        string patientHhNumber,
        string doctorHhNumber,
        string medication,
        uint256 timestamp
    );

    constructor(address _doctorRegistrationAddress, address _patientRegistrationAddress) {
        doctorRegistration = IDoctorRegistration(_doctorRegistrationAddress);
        patientRegistration = IPatientRegistration(_patientRegistrationAddress);
    }

    function addPrescription(
        string memory _patientHhNumber,
        string memory _doctorHhNumber,
        string memory _medication,
        uint256 _dosesPerDay,
        string[] memory _intakeTimes,
        uint256 _durationDays
    ) external {
        // Vérifier que le patient existe
        require(
            patientRegistration.isPatientRegistered(_patientHhNumber),
            "Patient non enregistre"
        );

        // Vérifier que le médecin est valide et que l'appelant est le médecin
        (address doctorAddress, , , , , , , , , ) = doctorRegistration.getDoctorDetails(_doctorHhNumber);
        require(doctorAddress == msg.sender, "Seul le medecin peut ajouter une prescription");
        require(doctorAddress != address(0), "Medecin non enregistre");

        // Vérifier les entrées
        require(bytes(_medication).length > 0, "Medicament requis");
        require(_dosesPerDay > 0, "Nombre de doses invalide");
        require(_intakeTimes.length > 0, "Horaires de prise requis");
        require(_intakeTimes.length <= _dosesPerDay, "Trop d'horaires par rapport aux doses");
        require(_durationDays > 0, "Duree de traitement invalide");

        // Créer et ajouter la prescription
        PrescriptionEntry memory newPrescription = PrescriptionEntry({
            patientHhNumber: _patientHhNumber,
            doctorHhNumber: _doctorHhNumber,
            medication: _medication,
            dosesPerDay: _dosesPerDay,
            intakeTimes: _intakeTimes,
            durationDays: _durationDays,
            timestamp: block.timestamp
        });

        prescriptions[_patientHhNumber].push(newPrescription);

        // Ajouter le patient à la liste du médecin s'il n'est pas déjà présent
        bool exists = false;
        string[] storage patients = doctorPatients[_doctorHhNumber];
        for (uint i = 0; i < patients.length; i++) {
            if (keccak256(bytes(patients[i])) == keccak256(bytes(_patientHhNumber))) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            doctorPatients[_doctorHhNumber].push(_patientHhNumber);
        }

        emit PrescriptionAdded(_patientHhNumber, _doctorHhNumber, _medication, block.timestamp);
    }

    function getPrescriptions(string memory _patientHhNumber) external view returns (PrescriptionEntry[] memory) {
        return prescriptions[_patientHhNumber];
    }

    function getPatientsByDoctor(string memory _doctorHhNumber) external view returns (string[] memory) {
        return doctorPatients[_doctorHhNumber];
    }
     function getPrescriptionsByDoctor(
        string memory _patientHhNumber,
        string memory _doctorHhNumber
    ) external view returns (PrescriptionEntry[] memory) {
        PrescriptionEntry[] memory patientPrescriptions = prescriptions[_patientHhNumber];
        uint256 count = 0;

        // Compter le nombre de prescriptions pour ce médecin
        for (uint i = 0; i < patientPrescriptions.length; i++) {
            if (keccak256(bytes(patientPrescriptions[i].doctorHhNumber)) == keccak256(bytes(_doctorHhNumber))) {
                count++;
            }
        }

        // Créer un tableau pour stocker les prescriptions du médecin
        PrescriptionEntry[] memory result = new PrescriptionEntry[](count);
        uint256 index = 0;

        // Remplir le tableau avec les prescriptions correspondantes
        for (uint i = 0; i < patientPrescriptions.length; i++) {
            if (keccak256(bytes(patientPrescriptions[i].doctorHhNumber)) == keccak256(bytes(_doctorHhNumber))) {
                result[index] = patientPrescriptions[i];
                index++;
            }
        }

        return result;
    }
}
