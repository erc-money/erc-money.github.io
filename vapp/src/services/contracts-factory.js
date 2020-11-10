import contract from "@truffle/contract"
import { CONTRACTS } from '../constants'
import Marketplace from '../contracts/Marketplace.json'
import EMToken from '../contracts/EMToken.json'
import IToken from '../contracts/IToken.json'
import TokenA from '../contracts/TokenA.json'
import TokenB from '../contracts/TokenB.json'

const ABIS = { Marketplace, EMToken, IToken, TokenA, TokenB };

export default (web3) => {
  const contracts = {};

  for (const name of CONTRACTS) {
    contracts[name] = contract(ABIS[name]);
    contracts[name].setProvider(web3.currentProvider);
  }

  return contracts;
};
