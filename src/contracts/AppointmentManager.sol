// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AppointmentManager {
    address public owner;

    // mapping(dokter => timestamps)
    mapping(address => uint256[]) private availabilities;

    constructor() {
        owner = msg.sender;
    }

    // Ajouter un créneau disponible
    function addAvailability(uint256 timestamp) public {
        // On évite les doublons
        uint256[] storage slots = availabilities[msg.sender];
        for (uint256 i = 0; i < slots.length; i++) {
            if (slots[i] == timestamp) {
                return; // déjà ajouté
            }
        }
        availabilities[msg.sender].push(timestamp);
    }

    // Supprimer un créneau
    function removeAvailability(uint256 timestamp) public {
        uint256[] storage slots = availabilities[msg.sender];
        for (uint256 i = 0; i < slots.length; i++) {
            if (slots[i] == timestamp) {
                // remplace l'élément supprimé par le dernier
                slots[i] = slots[slots.length - 1];
                slots.pop();
                break;
            }
        }
    }

    // Récupérer les créneaux disponibles dans une plage donnée
    function getAvailabilitiesBetween(uint256 start, uint256 end) public view returns (uint256[] memory) {
        uint256[] storage all = availabilities[msg.sender];

        // Compter les éléments valides
        uint256 count = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (all[i] >= start && all[i] <= end) {
                count++;
            }
        }

        // Remplir le tableau de retour
        uint256[] memory result = new uint256[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (all[i] >= start && all[i] <= end) {
                result[j] = all[i];
                j++;
            }
        }

        return result;
    }
}
