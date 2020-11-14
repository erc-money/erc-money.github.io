const DEFAULT_PARAMS = require('../parameters.json');

const AVG_BLOCK_TIME = 13.3;
const DEFAULT_REWARD = '0.1 ether';
const BLOCK_MATH_PARAMS = [/* e.g. "_startBlock" */];
const HUMAN_VALUE_PARAMS = [ "_reward" ];
// bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";

const presaleParams = async (web3, params = {}, network = null) => {
  let accounts = [];

  if (network) {
    params = DEFAULT_PARAMS[network] || {};
  }

  try {
    accounts = await web3.eth.getAccounts();
  } catch (e) {
    console.warn(`> [getAccounts()]: ${e.message}`);
  }

  const block = await web3.eth.getBlock('latest');
  const result = Object.assign({
    "_owner": accounts[0],
    "_treasury": accounts[1],
    "_reward": DEFAULT_REWARD,
  }, params);

  for (const bmp of BLOCK_MATH_PARAMS) {
    if (!/^\s*\d/.test(result[bmp])) {
      // if "+1000" prefix w/ current block
      result[bmp] = eval(`${block.number}${result[bmp]}`);
    } else {
      // if "100+2352" do not prefix
      result[bmp] = eval(`${result[bmp]}`);
    }

    console.info(
      `> ${bmp}=${result[bmp]} (+${result[bmp] - block.number} blocks) occurs in approx. ` +
      `${ Number(((result[bmp] - block.number) * AVG_BLOCK_TIME) / 3600).toFixed(1) } hours (~${AVG_BLOCK_TIME} sec/block)`
    );
  }

  for (const hvp of HUMAN_VALUE_PARAMS) {
    result[hvp] = web3.utils.toWei(...result[hvp].split(' ').filter(Boolean));
  }

  console.info(`> [${network || 'N/A'}] Params: ${JSON.stringify(result, null, '  ')}`);

  return result;
};

module.exports = (web3) => {
  return {
    AVG_BLOCK_TIME,
    DEFAULT_REWARD,
    MINTER_ROLE,
    presaleParams: (...args) => presaleParams(web3, ...args),
  };
};
