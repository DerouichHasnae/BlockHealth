
const DoctorRegistration = artifacts.require("DoctorRegistration");
const Availability = artifacts.require("Availability");

module.exports = function (deployer) {
  // Déployer DoctorRegistration en premier
  deployer.deploy(DoctorRegistration).then(function() {
    // Après le déploiement de DoctorRegistration, déployer Availability avec l'adresse de DoctorRegistration
    return deployer.deploy(Availability, DoctorRegistration.address);
  });
};