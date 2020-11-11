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

  console.info('Grant MINTER_ROLE to Marketplace');
  await token.grantRole(MINTER_ROLE, marketplace.address);

  console.info('Setup Marketplace reward');
  await marketplace.updateReward(token.address, params._reward);

  if (network != "mainnet") {
    // deploy test tokens
    console.info('Deploy test tokens');
    const tokenA = await deployer.deploy(TokenA);
    const tokenB = await deployer.deploy(TokenB);

    console.info('Setup test orders Marketplace allowance');
    await tokenA.increaseAllowance(marketplace.address, '10000000000000000000'); // 10
    await tokenB.increaseAllowance(marketplace.address, '7000000000000000000'); // 7

    // add some test orders...
    console.info('Create Order#1');
    await marketplace.createOrder(
      tokenA.address,
      '10000000000000000000', // 10
      tokenB.address,
      '6000000000000000000', // 6
      true
    );

    console.info('Create Order#2');
    await marketplace.createOrder(
      tokenB.address,
      '7000000000000000000', // 7
      tokenA.address,
      '5000000000000000000', // 5
      false
    );
    
    // premint 100 tokens
    console.info('Mint 100 reward tokens to owner address');
    await token.mint(params._owner, '100000000000000000000');
  }
  
  return [ token, marketplace ];
};
