import etherscanLink from '@metamask/etherscan-link'
import { hexToString, BN } from 'ethereumjs-util'
import { WALLET_PRECISION/*, TX_POOL_INTERVAL, BLOCKS_CONFIRMATION*/ } from '../constants'

export default {
  methods: {
    etherscanTokenLink(token, address = null, network = null) {
      return etherscanLink.createAccountLink(
        token,
        network || this.network,
      ) + `?a=${address || this.wallet}`;
    },

    etherscanAccountLink(address = null, network = null) {
      return etherscanLink.createAccountLink(
        address || this.wallet,
        network || this.network,
      );
    },

    etherscanExplorerLink(hash, network = null) {
      return etherscanLink.createExplorerLink(
        hash, network || this.network,
      );
    },

    async awaitTxConfirmation(/*tx, confirmations = BLOCKS_CONFIRMATION, interval = TX_POOL_INTERVAL*/) {
      throw new Error("Not implemented!");
      // await awaitMinedTransaction(this.web3, tx, { interval, blocksToWait: confirmations });
    },

    machineValue(value, denominator = '18') {
      value = (value || '').toString().trim();
      let denominatorShift = 0;

      if (/\./.test(value)) {
        const parts = value.split('');
        value = parts.filter(x => x !== '.').join('');
        denominatorShift = parts.length - parts.indexOf('.') - 1;
      }

      return this.toBN(value).mul(
        this.toBN(10).pow(
          this.toBN(denominator)
            .sub(
              this.toBN(denominatorShift.toString())
            )
        )
      ).toString();
    },

    humanValue(value, denominator = '18', precision = WALLET_PRECISION) {
      value = (value || '').toString().trim();
      denominator = parseInt(denominator.toString(), 10);

      if (value.length < denominator) {
        value = '0'.repeat(denominator - value.length) + '.' + value.substr(0, precision);
      } else {
        value = value.substr(0, value.length - denominator) + '.' + value.substr(value.length - denominator, precision);
      }

      return parseFloat(value)
        .toString()
        .replace(/^(.*\.[^0]*)0+$/, '$1')
        .replace(/\.$/, '');
    },

    hexToString(hex) {
      return hexToString(hex);
    },

    toBN(value = null) {
      return new BN((value || 0).toString());
    },
  },
}
