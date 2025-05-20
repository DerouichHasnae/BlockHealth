const DoctorRegistration = artifacts.require("DoctorRegistration");
const PatientRegistry = artifacts.require("PatientRegistration");
const ClinicalObservation = artifacts.require("ClinicalObservation");

module.exports = function (deployer) {
  // Déployer ClinicalObservation en passant les adresses de DoctorRegistration et PatientRegistration
  deployer.deploy(ClinicalObservation, DoctorRegistration.address, PatientRegistry.address);
};