var Adoption = artifacts.require("Adoption");  //这里填入的是合约名，而不是文件名

module.exports = function(deployer) {
  deployer.deploy(Adoption);
};