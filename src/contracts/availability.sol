// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Availability {
    struct Creneau {
        uint date;       // Timestamp de la date (sans l'heure)
        uint jourSemaine; // 0 = dimanche, 1 = lundi, ...
        uint debut;      // Timestamp complet (date + heure début)
        uint fin;        // Timestamp complet (date + heure fin)
        address patient; // address(0) si non réservé
    }

    mapping(string => Creneau[]) public disponibilites;
    mapping(string => address) public proprietaireCreneaux;

    event CreneauAjoute(string indexed hhNumber, uint index);
    event CreneauReserve(string indexed hhNumber, uint index, address patient);

    function ajouterCreneau(
        string memory _hhNumber,
        uint _date,       // Date seule (timestamp à minuit)
        uint _jourSemaine,
        uint _debut,      // Heure début (timestamp complet)
        uint _fin         // Heure fin (timestamp complet)
    ) public {
        if(disponibilites[_hhNumber].length == 0) {
            proprietaireCreneaux[_hhNumber] = msg.sender;
        }
        
        require(
            proprietaireCreneaux[_hhNumber] == msg.sender,
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
        
        disponibilites[_hhNumber].push(nouveauCreneau);
        emit CreneauAjoute(_hhNumber, disponibilites[_hhNumber].length - 1);
    }

    function getDisponibilites(string memory _hhNumber) public view returns (Creneau[] memory) {
        return disponibilites[_hhNumber];
    }

    function reserverCreneau(string memory _hhNumber, uint _index) public {
        require(_index < disponibilites[_hhNumber].length, "Index invalide");
        require(
            disponibilites[_hhNumber][_index].patient == address(0),
            "Deja reserve"
        );
        
        disponibilites[_hhNumber][_index].patient = msg.sender;
        emit CreneauReserve(_hhNumber, _index, msg.sender);
    }
}