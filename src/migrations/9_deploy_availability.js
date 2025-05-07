const availability = artifacts.require("availability");

module.exports = function (deployer) {
  deployer.deploy(availability);
};
