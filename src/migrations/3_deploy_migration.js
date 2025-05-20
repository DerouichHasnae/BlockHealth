const DoctorRegistration = artifacts.require("DoctorRegistration");
const PatientRegistry = artifacts.require("PatientRegistration");
const Prescription = artifacts.require("Prescription");

module.exports = function (deployer) {
  // Déployer Prescription en passant les adresses de DoctorRegistration et PatientRegistration
  deployer.deploy(Prescription, DoctorRegistration.address, PatientRegistry.address);
};