/*pragma solidity ^0.8.19;

contract Availability {
    struct Creneau {
        uint date;       // Timestamp de la date (sans l'heure)
        uint jourSemaine; // 0 = dimanche, 1 = lundi, ...
        uint debut;      // Timestamp complet (date + heure début)
        uint fin;        // Timestamp complet (date + heure fin)
        address patient; // address(0) si non réservé
    }

    mapping(uint => Creneau[]) public disponibilites;
    mapping(uint => address) public proprietaireCreneaux;

    // On change ici le type de clé du mapping pour un `bytes32`
    mapping(bytes32 => bool) public isSlotTaken;

    event CreneauAjoute(uint indexed hhNumber, uint index);
    event CreneauReserve(uint indexed hhNumber, uint index, address patient);

    function ajouterCreneau(
        uint hhNumber,
        uint _date,       // Date seule (timestamp à minuit)
        uint _jourSemaine,
        uint _debut,      // Heure début (timestamp complet)
        uint _fin         // Heure fin (timestamp complet)
    ) public {
        if (disponibilites[hhNumber].length == 0) {
            proprietaireCreneaux[hhNumber] = msg.sender;
        }

        require(
            proprietaireCreneaux[hhNumber] == msg.sender,
            "Seul le proprietaire peut ajouter des creneaux"
        );

        require(_debut < _fin, "L'heure de fin doit etre apres l'heure de debut");
        require(
            _date <= _debut && _date <= _fin,
            "La date doit correspondre aux creneaux"
        );

        Creneau memory nouveauCreneau = Creneau(
            _date,
            _jourSemaine,
            _debut,
            _fin,
            address(0)
        );

        disponibilites[hhNumber].push(nouveauCreneau);
        emit CreneauAjoute(hhNumber, disponibilites[hhNumber].length - 1);
    }

    function getDisponibilites(uint hhNumber) public view returns (Creneau[] memory) {
        return disponibilites[hhNumber];
    }
event DebugSlotKey(bytes32 key, uint timestamp, uint hhNumber);

     function reserverCreneau(uint hhNumber, uint timestampDebut) public {
    bytes32 key = keccak256(abi.encodePacked(hhNumber, timestampDebut));
    require(!isSlotTaken[key], "Ce crenau est deja resrver ");
    isSlotTaken[key] = true;
    // éventuellement : store patient info, emit event, etc.
} 

    function isCreneauReserve(uint hhNumber, uint timestampDebut) public view returns (bool) {
        bytes32 slotKey = keccak256(abi.encodePacked(hhNumber, timestampDebut));
        return isSlotTaken[slotKey];
    }

   function getReservationsByDateFlat(uint hhNumber, uint date) public view returns (
    uint[] memory dates,
    uint[] memory debuts,
    uint[] memory fins,
    string[] memory status
) {
    Creneau[] memory all = disponibilites[hhNumber];
    uint count = 0;

    for (uint i = 0; i < all.length; i++) {
        if (all[i].date == date && all[i].patient != address(0)) {
            count++;
        }
    }

    dates = new uint[](count);
    debuts = new uint[](count);
    fins = new uint[](count);
    status = new string[](count);

    uint index = 0;
    for (uint i = 0; i < all.length; i++) {
        if (all[i].date == date && all[i].patient != address(0)) {
            dates[index] = all[i].date;
            debuts[index] = all[i].debut;
            fins[index] = all[i].fin;
            status[index] = "OK"; // Indique simplement que le créneau est réservé
            index++;
        }
    }

    return (dates, debuts, fins, status);
}

}
*/
/*
pragma solidity ^0.8.19;

contract Availability {
    struct Creneau {
        uint date;           // Timestamp de la date (sans l'heure)
        uint jourSemaine;    // 0 = dimanche, 1 = lundi, ...
        uint debut;          // Timestamp complet (date + heure début)
        uint fin;            // Timestamp complet (date + heure fin)
        uint dureeConsultation; // Durée d'une consultation (en secondes, ex: 900 pour 15 min)
        address patient;     // address(0) si non réservé
    }
    struct Reservation {
    uint creneauIndex;
    uint timestampDebut;
    address patient;
}


    mapping(uint => Creneau[]) public disponibilites;
    mapping(uint => address) public proprietaireCreneaux;
    mapping(bytes32 => bool) public isSlotTaken;

    event CreneauAjoute(uint indexed hhNumber, uint index);
    event CreneauReserve(uint indexed hhNumber, uint index, address patient);

    function ajouterCreneau(
        uint hhNumber,
        uint _date,
        uint _jourSemaine,
        uint _debut,
        uint _fin,
        uint _dureeConsultation // Nouveau paramètre
    ) public {
        if (disponibilites[hhNumber].length == 0) {
            proprietaireCreneaux[hhNumber] = msg.sender;
        }
        require(
            proprietaireCreneaux[hhNumber] == msg.sender,
            "Seul le proprietaire peut ajouter des creneaux"
        );
        require(_debut < _fin, "L'heure de fin doit etre apres l'heure de debut");
        require(
            _date <= _debut && _date <= _fin,
            "La date doit correspondre aux creneaux"
        );
        require(_dureeConsultation > 0, "Dure de consultation invalide");

        Creneau memory nouveauCreneau = Creneau(
            _date,
            _jourSemaine,
            _debut,
            _fin,
            _dureeConsultation,
            address(0)
        );

        disponibilites[hhNumber].push(nouveauCreneau);
        emit CreneauAjoute(hhNumber, disponibilites[hhNumber].length - 1);
    }

    function getDisponibilites(uint hhNumber) public view returns (Creneau[] memory) {
        return disponibilites[hhNumber];
    }
   

   // Ajouter un nouveau mapping pour stocker l'adresse du patient
mapping(bytes32 => address) public slotPatient;

function reserverCreneau(uint hhNumber, uint timestampDebut) public {
    bool found = false;
    uint creneauIndex;
    for (uint i = 0; i < disponibilites[hhNumber].length; i++) {
        Creneau memory creneau = disponibilites[hhNumber][i];
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
    require(found, "Crneau invalide");

    bytes32 key = keccak256(abi.encodePacked(hhNumber, timestampDebut));
    require(!isSlotTaken[key], "Ce crneau est dj rserv");

    isSlotTaken[key] = true;
    slotPatient[key] = msg.sender; // Stocker l'adresse du patient
    emit CreneauReserve(hhNumber, creneauIndex, msg.sender);
}
  function isCreneauReserve(uint hhNumber, uint timestampDebut) public view returns (bool) {
        bytes32 slotKey = keccak256(abi.encodePacked(hhNumber, timestampDebut));
        return isSlotTaken[slotKey];
    }
// Mettre à jour getReservations pour utiliser slotPatient
function getReservations(uint hhNumber) public view returns (Reservation[] memory) {
    require(
        proprietaireCreneaux[hhNumber] == msg.sender,
        "Seul le proprietaire peut voir les rservations"
    );

    uint reservationCount = 0;
    for (uint i = 0; i < disponibilites[hhNumber].length; i++) {
        Creneau memory creneau = disponibilites[hhNumber][i];
        for (
            uint t = creneau.debut;
            t < creneau.fin;
            t += creneau.dureeConsultation
        ) {
            bytes32 key = keccak256(abi.encodePacked(hhNumber, t));
            if (isSlotTaken[key]) {
                reservationCount++;
            }
        }
    }

    Reservation[] memory reservations = new Reservation[](reservationCount);
    uint index = 0;
    for (uint i = 0; i < disponibilites[hhNumber].length; i++) {
        Creneau memory creneau = disponibilites[hhNumber][i];
        for (
            uint t = creneau.debut;
            t < creneau.fin;
            t += creneau.dureeConsultation
        ) {
            bytes32 key = keccak256(abi.encodePacked(hhNumber, t));
            if (isSlotTaken[key]) {
                reservations[index] = Reservation({
                    creneauIndex: i,
                    timestampDebut: t,
                    patient: slotPatient[key] // Utiliser l'adresse stockée
                });
                index++;
            }
        }
    }

    return reservations;
}
   
}*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDoctorRegistration {
    function isDoctorInSpecialization(address doctorAddress, string memory specialization) external view returns (bool);
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
}

contract Availability {
    enum ReservationStatus { PENDING, CONFIRMED, CANCELLED } // Nouveau champ pour le statut

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
        ReservationStatus status; // Nouveau champ
    }

    mapping(string => Creneau[]) public disponibilites;
    mapping(bytes32 => bool) public isSlotTaken;
    mapping(bytes32 => address) public slotPatient;
    mapping(bytes32 => string) public slotPatientHhNumber;
    mapping(bytes32 => ReservationStatus) public slotStatus; // Nouveau mapping pour le statut

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
        slotStatus[key] = ReservationStatus.PENDING; // Statut initial
        emit CreneauReserve(specialization, creneauIndex, msg.sender, patientHhNumber);
    }

    function confirmReservation(string memory specialization, uint timestampDebut) public {
        require(doctorRegistration.isDoctorInSpecialization(msg.sender, specialization), "Vous n'etes pas autorise pour cette specialite");
        bytes32 key = keccak256(abi.encodePacked(specialization, timestampDebut));
        require(isSlotTaken[key], "Reservation inexistante");
        require(slotStatus[key] == ReservationStatus.PENDING, "Reservation deja traitee");
        
        slotStatus[key] = ReservationStatus.CONFIRMED;
        emit ReservationConfirmed(specialization, timestampDebut, slotPatientHhNumber[key]);
    }

    function cancelReservation(string memory specialization, uint timestampDebut) public {
        require(doctorRegistration.isDoctorInSpecialization(msg.sender, specialization), "Vous n'etes pas autorise pour cette specialite");
        bytes32 key = keccak256(abi.encodePacked(specialization, timestampDebut));
        require(isSlotTaken[key], "Reservation inexistante");
        require(slotStatus[key] == ReservationStatus.PENDING, "Reservation deja traitee");

        slotStatus[key] = ReservationStatus.CANCELLED;
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
    }
}