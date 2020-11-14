const Web3 = require('web3');
const utilsFunctor = require('../utils');
const Marketplace = artifacts.require("Marketplace");
const EMToken = artifacts.require("EMToken");
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");

const TEST_TOKENS_AMOUNT = '100000000000000000000'; // 100 tokens

module.exports = async function (deployer, network) {
  const web3 = new Web3(deployer.provider);
  const { presaleParams, MINTER_ROLE } = utilsFunctor(web3);
  const accounts = await web3.eth.getAccounts();
  const params = await presaleParams(null, network);

  console.info('Deploy main assets');
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

  // not mainnet and not test nor coverage
  if (network != "mainnet" && network != "development") {
    // deploy test tokens
    console.info('Deploy test tokens');
    const tokenA = await deployer.deploy(TokenA);
    const tokenB = await deployer.deploy(TokenB);

    // Mainly for Ganache...
    if (accounts[1]) {
      console.info('Mint some test tokens to', accounts[1]);
      await tokenA.mint(accounts[1], TEST_TOKENS_AMOUNT);
      await tokenB.mint(accounts[1], TEST_TOKENS_AMOUNT);
    }
  }
  
  return [ token, marketplace ];
};
