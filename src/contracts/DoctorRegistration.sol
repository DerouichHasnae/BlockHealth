
/*pragma solidity ^0.8.19;

contract DoctorRegistration {
    struct Doctor {
        address walletAddress;
        string doctorName;
        string hospitalName;
        string dateOfBirth;
        string gender;
        string email;
        string hhNumber;
        string specialization;
        string department;
        string designation;
        string workExperience;
        string password;
    }

    struct PatientList {
        string patient_number;
        string patient_name;
    }
    struct RendezVous {
    address patient;
    uint256 debut;
    uint256 fin;
}

    mapping(string => address) private doctorAddresses;
    mapping(string => Doctor) private doctors;
    mapping(string => PatientList[]) private Dpermission;
    mapping(string => mapping(string => bool)) public doctorPermissions;
    mapping(string => RendezVous[]) private disponibilitesPrises;


    string[] private allHhNumbers; // ✅ Correction ici

    event DoctorRegistered(string hhNumber, string doctorName, address walletAddress);

    function registerDoctor(
        string memory _doctorName,
        string memory _hospitalName,
        string memory _dateOfBirth,
        string memory _gender,
        string memory _email,
        string memory _hhNumber,
        string memory _specialization,
        string memory _department,
        string memory _designation,
        string memory _workExperience,
        string memory _password
    ) external {
        require(doctorAddresses[_hhNumber] == address(0), "Doctor already registered");

        Doctor memory newDoctor = Doctor({
            walletAddress: msg.sender,
            doctorName: _doctorName,
            hospitalName: _hospitalName,
            dateOfBirth: _dateOfBirth,
            gender: _gender,
            email: _email,
            hhNumber: _hhNumber,
            specialization: _specialization,
            department: _department,
            designation: _designation,
            workExperience: _workExperience,
            password: _password
        });

        doctors[_hhNumber] = newDoctor;
        doctorAddresses[_hhNumber] = msg.sender;
        emit DoctorRegistered(_hhNumber, _doctorName, msg.sender);
        allHhNumbers.push(_hhNumber); // ✅ Ajout correct ici
    }

    function isRegisteredDoctor(string memory _hhNumber) external view returns (bool) {
        return doctorAddresses[_hhNumber] != address(0);
    }

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
    ) {
        require(doctorAddresses[_hhNumber] != address(0), "Doctor not registered");
        Doctor memory doctor = doctors[_hhNumber];
        return (
            doctor.walletAddress,
            doctor.doctorName,
            doctor.hospitalName,
            doctor.dateOfBirth,
            doctor.gender,
            doctor.email,
            doctor.specialization,
            doctor.department,
            doctor.designation,
            doctor.workExperience
        );
    }

    function validatePassword(string memory _hhNumber, string memory _password) external view returns (bool) {
        require(doctorAddresses[_hhNumber] != address(0), "Doctor not registered");
        return keccak256(abi.encodePacked(_password)) == keccak256(abi.encodePacked(doctors[_hhNumber].password));
    }

    function grantPermission(
        string memory _patientNumber,
        string memory _doctorNumber,
        string memory _patientName
    ) external {
        PatientList memory newRecord = PatientList(_patientNumber, _patientName);
        Dpermission[_doctorNumber].push(newRecord);
        doctorPermissions[_patientNumber][_doctorNumber] = true;
    }

    function isPermissionGranted(string memory _patientNumber, string memory _doctorNumber) external view returns (bool) {
        return doctorPermissions[_patientNumber][_doctorNumber];
    }

    function revokePermission(string memory _patientNumber, string memory _doctorNumber) public {
        doctorPermissions[_patientNumber][_doctorNumber] = false;

        // Remove the patient's record from the list
        for (uint i = 0; i < Dpermission[_doctorNumber].length; i++) {
            if (
                keccak256(abi.encodePacked(Dpermission[_doctorNumber][i].patient_number)) ==
                keccak256(abi.encodePacked(_patientNumber))
            ) {
                for (uint j = i; j < Dpermission[_doctorNumber].length - 1; j++) {
                    Dpermission[_doctorNumber][j] = Dpermission[_doctorNumber][j + 1];
                }
                Dpermission[_doctorNumber].pop();
                break;
            }
        }
    }

    function getPatientList(string memory _doctorNumber) public view returns (PatientList[] memory) {
        return Dpermission[_doctorNumber];
    }

    function getAllHhNumbers() external view returns (string[] memory) {
        return allHhNumbers;
    }

}*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DoctorRegistration {
    struct Doctor {
        address walletAddress;
        string doctorName;
        string hospitalName;
        string dateOfBirth;
        string gender;
        string email;
        string hhNumber;
        string specialization;
        string department;
        string designation;
        string workExperience;
        string password;
    }

    struct PatientList {
        string patient_number;
        string patient_name;
    }

    struct RendezVous {
        address patient;
        uint256 debut;
        uint256 fin;
    }

    mapping(string => address) private doctorAddresses;
    mapping(string => Doctor) private doctors;
    mapping(string => PatientList[]) private Dpermission;
    mapping(string => mapping(string => bool)) public doctorPermissions;
    mapping(string => RendezVous[]) private disponibilitesPrises;
    // Nouveau mapping pour regrouper les médecins par spécialité
    mapping(string => string[]) public doctorsBySpecialization;

    string[] private allHhNumbers;

    event DoctorRegistered(string hhNumber, string doctorName, address walletAddress);
    // Nouvel événement pour l'ajout à une spécialité
    event DoctorAddedToSpecialization(string hhNumber, string specialization);

    // Fonction interne pour normaliser les chaînes (minuscules)
    function toLower(string memory str) internal pure returns (string memory) {
        bytes memory bStr = bytes(str);
        bytes memory bLower = new bytes(bStr.length);
        for (uint i = 0; i < bStr.length; i++) {
            if ((uint8(bStr[i]) >= 65) && (uint8(bStr[i]) <= 90)) {
                bLower[i] = bytes1(uint8(bStr[i]) + 32);
            } else {
                bLower[i] = bStr[i];
            }
        }
        return string(bLower);
    }

    function registerDoctor(
        string memory _doctorName,
        string memory _hospitalName,
        string memory _dateOfBirth,
        string memory _gender,
        string memory _email,
        string memory _hhNumber,
        string memory _specialization,
        string memory _department,
        string memory _designation,
        string memory _workExperience,
        string memory _password
    ) external {
        require(doctorAddresses[_hhNumber] == address(0), "Doctor already registered");

        // Normaliser la spécialité
        string memory normalizedSpecialization = toLower(_specialization);

        Doctor memory newDoctor = Doctor({
            walletAddress: msg.sender,
            doctorName: _doctorName,
            hospitalName: _hospitalName,
            dateOfBirth: _dateOfBirth,
            gender: _gender,
            email: _email,
            hhNumber: _hhNumber,
            specialization: normalizedSpecialization, // Stocker la version normalisée
            department: _department,
            designation: _designation,
            workExperience: _workExperience,
            password: _password
        });

        doctors[_hhNumber] = newDoctor;
        doctorAddresses[_hhNumber] = msg.sender;
        allHhNumbers.push(_hhNumber);
        // Ajouter le hhNumber à la spécialité
        doctorsBySpecialization[normalizedSpecialization].push(_hhNumber);
        emit DoctorRegistered(_hhNumber, _doctorName, msg.sender);
        emit DoctorAddedToSpecialization(_hhNumber, normalizedSpecialization);
    }

    function isRegisteredDoctor(string memory _hhNumber) external view returns (bool) {
        return doctorAddresses[_hhNumber] != address(0);
    }

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
    ) {
        require(doctorAddresses[_hhNumber] != address(0), "Doctor not registered");
        Doctor memory doctor = doctors[_hhNumber];
        return (
            doctor.walletAddress,
            doctor.doctorName,
            doctor.hospitalName,
            doctor.dateOfBirth,
            doctor.gender,
            doctor.email,
            doctor.specialization,
            doctor.department,
            doctor.designation,
            doctor.workExperience
        );
    }

    function validatePassword(string memory _hhNumber, string memory _password) external view returns (bool) {
        require(doctorAddresses[_hhNumber] != address(0), "Doctor not registered");
        return keccak256(abi.encodePacked(_password)) == keccak256(abi.encodePacked(doctors[_hhNumber].password));
    }

    // Nouvelle fonction : Vérifier si une adresse est un médecin d'une spécialité
    function isDoctorInSpecialization(address doctorAddress, string memory specialization) external view returns (bool) {
        string memory normalizedSpecialization = toLower(specialization);
        string[] memory hhNumbers = doctorsBySpecialization[normalizedSpecialization];
        for (uint i = 0; i < hhNumbers.length; i++) {
            if (doctorAddresses[hhNumbers[i]] == doctorAddress) {
                return true;
            }
        }
        return false;
    }

    // Nouvelle fonction : Obtenir la liste des hhNumber pour une spécialité
    function getDoctorsBySpecialization(string memory specialization) external view returns (string[] memory) {
        return doctorsBySpecialization[toLower(specialization)];
    }

    function grantPermission(
        string memory _patientNumber,
        string memory _doctorNumber,
        string memory _patientName
    ) external {
        PatientList memory newRecord = PatientList(_patientNumber, _patientName);
        Dpermission[_doctorNumber].push(newRecord);
        doctorPermissions[_patientNumber][_doctorNumber] = true;
    }

    function isPermissionGranted(string memory _patientNumber, string memory _doctorNumber) external view returns (bool) {
        return doctorPermissions[_patientNumber][_doctorNumber];
    }

    function revokePermission(string memory _patientNumber, string memory _doctorNumber) public {
        doctorPermissions[_patientNumber][_doctorNumber] = false;
        for (uint i = 0; i < Dpermission[_doctorNumber].length; i++) {
            if (
                keccak256(abi.encodePacked(Dpermission[_doctorNumber][i].patient_number)) ==
                keccak256(abi.encodePacked(_patientNumber))
            ) {
                for (uint j = i; j < Dpermission[_doctorNumber].length - 1; j++) {
                    Dpermission[_doctorNumber][j] = Dpermission[_doctorNumber][j + 1];
                }
                Dpermission[_doctorNumber].pop();
                break;
            }
        }
    }

    function getPatientList(string memory _doctorNumber) public view returns (PatientList[] memory) {
        return Dpermission[_doctorNumber];
    }

    function getAllHhNumbers() external view returns (string[] memory) {
        return allHhNumbers;
    }
}

