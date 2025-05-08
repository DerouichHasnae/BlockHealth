// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DoctorRegistration.sol";

contract DoctorRegistry {
    DoctorRegistration private doctorRegistration;
    
    // Mapping spécialité => liste des HHNumbers
    mapping(string => string[]) private doctorsBySpecialty;
    
    // Liste de toutes les spécialités disponibles
    string[] private allSpecialties;

    constructor(address _doctorRegistrationAddress) {
        doctorRegistration = DoctorRegistration(_doctorRegistrationAddress);
        
        // Initialiser les spécialités disponibles
        allSpecialties = ["Cardiology", "Neurology", "Oncology", "Gynecology", 
                         "Dermatology", "Ophthalmology", "Psychiatry", "Radiology"];
    }

    function registerDoctor(string memory _hhNumber) external {
        // Vérifier que le médecin est bien enregistré dans DoctorRegistration
        (address wallet, , , , , , string memory specialization, , , ) = 
            doctorRegistration.getDoctorDetails(_hhNumber);
        
        require(wallet != address(0), "Doctor not registered");
        require(wallet == msg.sender, "Not authorized");
        
        // Ajouter le médecin à sa spécialité
        doctorsBySpecialty[specialization].push(_hhNumber);
    }

    function getDoctorsBySpecialty(string memory _specialty) external view returns (string[] memory) {
        return doctorsBySpecialty[_specialty];
    }

    function getAllSpecialties() external view returns (string[] memory) {
        return allSpecialties;
    }

    function getDoctorDetails(string memory _hhNumber) external view returns (
        string memory name,
        string memory hospital,
        string memory specialization
    ) {
        (, name, , , , , specialization, , , ) = doctorRegistration.getDoctorDetails(_hhNumber);
        (, , , hospital, , , , , , ) = doctorRegistration.getDoctorDetails(_hhNumber);
        return (name, hospital, specialization);
    }
}