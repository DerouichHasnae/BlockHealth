const DoctorAvailability = artifacts.require("DoctorAvailability");

module.exports = function (deployer) {
  deployer.deploy(DoctorAvailability);
};
