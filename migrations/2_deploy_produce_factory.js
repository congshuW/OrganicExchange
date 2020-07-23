const ProduceFactory = artifacts.require("ProduceFactory");

module.exports = function(deployer) {
  deployer.deploy(ProduceFactory);
}