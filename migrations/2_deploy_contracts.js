var BasicInheritance = artifacts.require("./BasicInheritance.sol")
var ArrayUtils = artifacts.require("./ArrayUtils.sol")

module.exports = function(deployer, network, accounts) {
  deployer.deploy(ArrayUtils)
  deployer.link(ArrayUtils, BasicInheritance)
  deployer.deploy(BasicInheritance, 3600 * 24 * 365)
}
