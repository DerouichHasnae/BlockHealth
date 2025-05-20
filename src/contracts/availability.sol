// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interface.sol";

contract Availability {
    enum ReservationStatus { PENDING, CONFIRMED, CANCELLED }

    struct Creneau {
        uint date;
        uint jourSemaine;
        uint debut;
        uint fin;
        uint dureeConsultation;
    }

    struct Reservation {
        uint creneauIndex;
        uint timestampDebut;
        address patient;
        string patientHhNumber;
        ReservationStatus status;
    }

    mapping(string => Creneau[]) public disponibilites;
    mapping(bytes32 => bool) public isSlotTaken;
    mapping(bytes32 => address) public slotPatient;
    mapping(bytes32 => string) public slotPatientHhNumber;
    mapping(bytes32 => ReservationStatus) public slotStatus;
    mapping(string => Reservation[]) public patientReservations; // Added mapping for patient reservations

    IDoctorRegistration private doctorRegistration;

    event CreneauAjoute(string indexed specialization, uint index);
    event CreneauReserve(string indexed specialization, uint index, address patient, string patientHhNumber);
    event ReservationConfirmed(string indexed specialization, uint timestampDebut, string patientHhNumber);
    event ReservationCancelled(string indexed specialization, uint timestampDebut, string patientHhNumber);

    constructor(address _doctorRegistrationAddress) {
        doctorRegistration = IDoctorRegistration(_doctorRegistrationAddress);
    }

    function ajouterCreneau(
        string memory specialization,
        uint _date,
        uint _jourSemaine,
        uint _debut,
        uint _fin,
        uint _dureeConsultation
    ) public {
        require(doctorRegistration.isDoctorInSpecialization(msg.sender, specialization), "Vous n'etes pas autorise pour cette specialite");
        require(_debut < _fin, "L'heure de fin doit etre apres l'heure de debut");
        require(_debut >= _date && _fin <= _date + 24 * 3600, "Les creneaux doivent etre dans la meme journee");
        require(_dureeConsultation > 0, "Duree de consultation invalide");
        require(_fin - _debut <= 12 * 3600, "Creneau trop long (max 12 heures)");

        for (uint i = 0; i < disponibilites[specialization].length; i++) {
            Creneau memory existing = disponibilites[specialization][i];
            require(
                existing.date != _date || (_fin <= existing.debut || _debut >= existing.fin),
                "Chevauchement de creneaux pour cette date"
            );
        }

        Creneau memory nouveauCreneau = Creneau(_date, _jourSemaine, _debut, _fin, _dureeConsultation);
        disponibilites[specialization].push(nouveauCreneau);
        emit CreneauAjoute(specialization, disponibilites[specialization].length - 1);
    }

    function getDisponibilites(string memory specialization) public view returns (Creneau[] memory) {
        return disponibilites[specialization];
    }

    function reserverCreneau(string memory specialization, uint timestampDebut, string memory patientHhNumber) public {
        bool found = false;
        uint creneauIndex;
        for (uint i = 0; i < disponibilites[specialization].length; i++) {
            Creneau memory creneau = disponibilites[specialization][i];
            if (
                timestampDebut >= creneau.debut &&
                timestampDebut < creneau.fin &&
                (timestampDebut - creneau.debut) % creneau.dureeConsultation == 0
            ) {
                found = true;
                creneauIndex = i;
                break;
            }
        }
        require(found, "Creneau invalide");

        bytes32 key = keccak256(abi.encodePacked(specialization, timestampDebut));
        require(!isSlotTaken[key], "Ce creneau est deja reserve");

        isSlotTaken[key] = true;
        slotPatient[key] = msg.sender;
        slotPatientHhNumber[key] = patientHhNumber;
        slotStatus[key] = ReservationStatus.PENDING;

        // Store reservation in patientReservations
        Reservation memory newReservation = Reservation({
            creneauIndex: creneauIndex,
            timestampDebut: timestampDebut,
            patient: msg.sender,
            patientHhNumber: patientHhNumber,
            status: ReservationStatus.PENDING
        });
        patientReservations[patientHhNumber].push(newReservation);

        emit CreneauReserve(specialization, creneauIndex, msg.sender, patientHhNumber);
    }

    function confirmReservation(string memory specialization, uint timestampDebut) public {
        require(doctorRegistration.isDoctorInSpecialization(msg.sender, specialization), "Vous n'etes pas autorise pour cette specialite");
        bytes32 key = keccak256(abi.encodePacked(specialization, timestampDebut));
        require(isSlotTaken[key], "Reservation inexistante");
        require(slotStatus[key] == ReservationStatus.PENDING, "Reservation deja traitee");

        slotStatus[key] = ReservationStatus.CONFIRMED;

        // Update patientReservations
        string memory patientHhNumber = slotPatientHhNumber[key];
        for (uint i = 0; i < patientReservations[patientHhNumber].length; i++) {
            if (
                patientReservations[patientHhNumber][i].timestampDebut == timestampDebut &&
                keccak256(abi.encodePacked(specialization)) == keccak256(abi.encodePacked(specialization))
            ) {
                patientReservations[patientHhNumber][i].status = ReservationStatus.CONFIRMED;
                break;
            }
        }

        emit ReservationConfirmed(specialization, timestampDebut, slotPatientHhNumber[key]);
    }

    function cancelReservation(string memory specialization, uint timestampDebut) public {
        require(doctorRegistration.isDoctorInSpecialization(msg.sender, specialization), "Vous n'etes pas autorise pour cette specialite");
        bytes32 key = keccak256(abi.encodePacked(specialization, timestampDebut));
        require(isSlotTaken[key], "Reservation inexistante");
        require(slotStatus[key] == ReservationStatus.PENDING, "Reservation deja traitee");

        slotStatus[key] = ReservationStatus.CANCELLED;

        // Update patientReservations
        string memory patientHhNumber = slotPatientHhNumber[key];
        for (uint i = 0; i < patientReservations[patientHhNumber].length; i++) {
            if (
                patientReservations[patientHhNumber][i].timestampDebut == timestampDebut &&
                keccak256(abi.encodePacked(specialization)) == keccak256(abi.encodePacked(specialization))
            ) {
                patientReservations[patientHhNumber][i].status = ReservationStatus.CANCELLED;
                break;
            }
        }

        emit ReservationCancelled(specialization, timestampDebut, slotPatientHhNumber[key]);
    }

    function isCreneauReserve(string memory specialization, uint timestampDebut) public view returns (bool) {
        bytes32 slotKey = keccak256(abi.encodePacked(specialization, timestampDebut));
        return isSlotTaken[slotKey];
    }

    function getReservations(string memory specialization) public view returns (Reservation[] memory) {
        require(doctorRegistration.isDoctorInSpecialization(msg.sender, specialization), "Vous n'etes pas autorise pour cette specialite");

        uint reservationCount = 0;
        for (uint i = 0; i < disponibilites[specialization].length; i++) {
            Creneau memory creneau = disponibilites[specialization][i];
            for (uint t = creneau.debut; t < creneau.fin; t += creneau.dureeConsultation) {
                bytes32 key = keccak256(abi.encodePacked(specialization, t));
                if (isSlotTaken[key]) {
                    reservationCount++;
                }
            }
        }

        Reservation[] memory reservations = new Reservation[](reservationCount);
        uint index = 0;
        for (uint i = 0; i < disponibilites[specialization].length; i++) {
            Creneau memory creneau = disponibilites[specialization][i];
            for (uint t = creneau.debut; t < creneau.fin; t += creneau.dureeConsultation) {
                bytes32 key = keccak256(abi.encodePacked(specialization, t));
                if (isSlotTaken[key]) {
                    reservations[index] = Reservation({
                        creneauIndex: i,
                        timestampDebut: t,
                        patient: slotPatient[key],
                        patientHhNumber: slotPatientHhNumber[key],
                        status: slotStatus[key]
                    });
                    index++;
                }
            }
        }

        return reservations;
    }

    function resetDisponibilites(string memory specialization) public {
        require(doctorRegistration.isDoctorInSpecialization(msg.sender, specialization), "Vous n'etes pas autorise pour cette specialite");
        for (uint i = 0; i < disponibilites[specialization].length; i++) {
            Creneau memory creneau = disponibilites[specialization][i];
            for (uint t = creneau.debut; t < creneau.fin; t += creneau.dureeConsultation) {
                bytes32 key = keccak256(abi.encodePacked(specialization, t));
                delete isSlotTaken[key];
                delete slotPatient[key];
                delete slotPatientHhNumber[key];
                delete slotStatus[key];
            }
        }
        delete disponibilites[specialization];
        // Note: patientReservations is not deleted here to preserve patient history
    }

    function getReservationsByPatient(string memory _patientHhNumber)
        external
        view
        returns (Reservation[] memory)
    {
        return patientReservations[_patientHhNumber];
    }
}