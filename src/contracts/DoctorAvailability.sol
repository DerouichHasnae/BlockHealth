// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DoctorAvailability {
    struct DayAvailability {
        string date;
        string startTime;
        string endTime;
    }
    
    // Mapping: hhNumber => jour => disponibilités
    mapping(string => mapping(string => DayAvailability)) public availabilities;
    
    event AvailabilitySet(
        string indexed hhNumber, 
        string indexed day, 
        string date, 
        string startTime, 
        string endTime
    );

    function setAvailability(
        string calldata hhNumber,
        string calldata day,
        string calldata date,
        string calldata startTime,
        string calldata endTime
    ) external {
        availabilities[hhNumber][day] = DayAvailability(date, startTime, endTime);
        emit AvailabilitySet(hhNumber, day, date, startTime, endTime);
    }

    function getDayAvailability(
        string calldata hhNumber, 
        string calldata day
    ) external view returns (DayAvailability memory) {
        return availabilities[hhNumber][day];
    }

    function getMultipleDaysAvailability(
        string calldata hhNumber,
        string calldata day1,
        string calldata day2
    ) external view returns (
        DayAvailability memory,
        DayAvailability memory
    ) {
        return (
            availabilities[hhNumber][day1],
            availabilities[hhNumber][day2]
        );
    }
}