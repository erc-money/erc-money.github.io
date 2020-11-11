const Web3 = require('web3');
const utilsFunctor = require('../utils');
const Marketplace = artifacts.require("Marketplace");
const EMToken = artifacts.require("EMToken");
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");

module.exports = async function (deployer, network) {
  const { presaleParams, MINTER_ROLE } = utilsFunctor(new Web3(deployer.provider));
  const params = await presaleParams(null, network);

  const token = await deployer.deploy(EMToken);
  const marketplace = await deployer.deploy(
    Marketplace,
    params._owner,
    params._treasury
  );

  await token.grantRole(MINTER_ROLE, marketplace.address);
  await marketplace.updateReward(token.address, params._reward);

  if (network != "mainnet") {
    // deploy test tokens
    const tokenA = await deployer.deploy(TokenA);
    const tokenB = await deployer.deploy(TokenB);

    tokenA.increaseAllowance(marketplace.address, '10000000000000000000'); // 10
    tokenB.increaseAllowance(marketplace.address, '7000000000000000000'); // 7

    // add some test orders...
    await marketplace.createOrder(
      tokenA.address,
      '10000000000000000000', // 10
      tokenB.address,
      '6000000000000000000', // 6
      true
    );

    await marketplace.createOrder(
      tokenB.address,
      '7000000000000000000', // 7
      tokenA.address,
      '5000000000000000000', // 5
      false
    );
    
    // premint 100 tokens
    await token.mint(params._owner, '100000000000000000000');
  }
  
  return [ token, marketplace ];
};
