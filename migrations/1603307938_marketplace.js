const Web3 = require('web3');
const utilsFunctor = require('../utils');
const Marketplace = artifacts.require("Marketplace");
const EMToken = artifacts.require("EMToken");
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

  const [ marketplace, token ] = await Promise.all([
    await deployer.deploy(
      Marketplace,
      params._owner,
      params._treasury
    ),
    await deployer.deploy(
      EMToken,
    ),
  ]);

  // allow marketplace minting token
  // bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  await token.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", marketplace.address)
  
  return await marketplace.updateReward(token.address, params._reward);
};
