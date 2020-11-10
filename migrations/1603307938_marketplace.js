const Web3 = require('web3');
const utilsFunctor = require('../utils');
const Marketplace = artifacts.require("Marketplace");
const EMToken = artifacts.require("EMToken");
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");

module.exports = async function (deployer, network) {
  const { presaleParams, MINTER_ROLE } = utilsFunctor(new Web3(deployer.provider));
  const params = await presaleParams(null, network);

  if (network != "mainnet") {
    const tokenA = await deployer.deploy(TokenA);
    const tokenB = await deployer.deploy(TokenB);
  }

  const token = await deployer.deploy(EMToken);
  const marketplace = await deployer.deploy(
    Marketplace,
    params._owner,
    params._treasury
  );

  await token.grantRole(MINTER_ROLE, marketplace.address);
  await marketplace.updateReward(token.address, params._reward);

  if (network != "mainnet") {
    // premint 100 tokens
    await token.mint(params._owner, '100000000000000000000');
  }
  
  return [ token, marketplace ];
};
