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

  if (
    // skip mainnet and coverage
    ![ 'soliditycoverage', 'mainnet' ].includes(network)
    // check mainly for Ganache provider
    && accounts.length >= 2
    // do not run when testing
    && ![ 'test' ].includes(process.argv[2])) {

    console.info('Deploy test tokens');
    const tokenA = await deployer.deploy(TokenA);
    const tokenB = await deployer.deploy(TokenB);

    
    const tokens = [ tokenA, tokenB ];
    const owners = [ accounts[0], accounts[1] ];

    console.info('Mint test tokens to', ...owners);
    await Promise.all(tokens.map(async t => {
      return Promise.all(owners.map(o => t.mint(o, TEST_TOKENS_AMOUNT)));
    }));

    console.info('Setup Marketplace allowance');
    await Promise.all(tokens.map(async t => {
      return Promise.all(owners.map(o => t.increaseAllowance(marketplace.address, TEST_TOKENS_AMOUNT, { from: o })));
    }));

    const orders = [];
    const randomPair = () => {
      const idx = Math.round(Math.random());
      return {
        from: tokens[idx].address,
        fromAmount: web3.utils.toWei((Math.random() * 10).toString(), 'ether'),
        to: tokens[idx == 1 ? 0 : 1].address,
        toAmount: web3.utils.toWei((Math.random() * 10).toString(), 'ether'),
        allowPartial: !!idx,
        $options: { from: owners[idx] },
      };
    }
    for (let i = 0; i < 10; i++) {
      orders.push(randomPair());
    }

    console.info('Add', orders.length, 'random orders');
    await Promise.all(orders.map(o => marketplace.createOrder(...Object.values(o))));
  }
  
  return [ token, marketplace ];
};
