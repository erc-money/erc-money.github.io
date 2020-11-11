import contract from "@truffle/contract"
import { CONTRACTS } from '../constants'
import Marketplace from '../contracts/Marketplace.json'
import EMToken from '../contracts/EMToken.json'
import ERC20 from '../contracts/ERC20.json'
import TokenA from '../contracts/TokenA.json'
import TokenB from '../contracts/TokenB.json'

const ABIS = { Marketplace, EMToken, ERC20, TokenA, TokenB };

export default (web3) => {
  const contracts = {};

  for (const name of CONTRACTS) {
    //contracts[name] = { deployed() { return { address: null }; } }
    contracts[name] = contract(ABIS[name]);
    contracts[name].setProvider(web3.currentProvider);
  }

  return contracts;
};
