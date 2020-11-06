const Web3 = require('web3');
const utilsFunctor = require('../utils');
const Marketplace = artifacts.require("Marketplace");
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");

module.exports = async function (deployer, network) {
  const { presaleParams } = utilsFunctor(new Web3(deployer.provider));
  const params = await presaleParams(null, network);

  if (network != "mainnet") {
    await Promise.all([
      deployer.deploy(TokenA),
      deployer.deploy(TokenB),
    ]);
  }

  const marketplace = await deployer.deploy(
    Marketplace,
    params._owner,
    params._treasury
  );

  return marketplace;
};
