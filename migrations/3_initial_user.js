var User = artifacts.require("User");  //这里填入的是合约名，而不是文件名

module.exports = function(deployer) {
  deployer.deploy(User);
};