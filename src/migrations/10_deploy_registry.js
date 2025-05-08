const DoctorRegistration = artifacts.require("DoctorRegistration");
const DoctorRegistry = artifacts.require("DoctorRegistry");

module.exports = async function (deployer) {
  // D'abord déployer DoctorRegistration
  await deployer.deploy(DoctorRegistration);
  const doctorRegistrationInstance = await DoctorRegistration.deployed();
  
  // Puis déployer DoctorRegistry en passant l'adresse de DoctorRegistration
  await deployer.deploy(DoctorRegistry, doctorRegistrationInstance.address);
};