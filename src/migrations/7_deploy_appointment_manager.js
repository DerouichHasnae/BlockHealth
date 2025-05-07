const AppointmentManager = artifacts.require("AppointmentManager");

module.exports = function (deployer) {
  deployer.deploy(AppointmentManager);
};
