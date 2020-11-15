import { hexToString, BN } from 'ethereumjs-util'
import fromExponential from 'from-exponential'
import prettyNum, { PRECISION_SETTING } from 'pretty-num'
import etherscanLink from '@metamask/etherscan-link'
import { WALLET_PRECISION, DEFAULT_DENOMINATION/*, TX_POOL_INTERVAL, BLOCKS_CONFIRMATION*/ } from '../constants'

export default {
  methods: {
    isSameAddress(a, b) {
      return (a || '').toLowerCase() === (b || '').toLowerCase();
    },

    isAddress(address) {
      return address && /^0x[a-zA-Z0-9]{40}$/.test(address);
    },

    etherscanTokenLink(token, address = null, network = null) {
      return etherscanLink.createTokenTrackerLink(
        token,
        network || this.network,
        address || this.wallet
      );
    },

    etherscanAccountLink(address = null, network = null) {
      return etherscanLink.createAccountLink(
        address || this.wallet,
        network || this.network,
      );
    },

    etherscanExplorerLink(hash, network = null) {
      return etherscanLink.createExplorerLink(
        hash,
        network || this.network,
      );
    },

    async awaitTxConfirmation(/*tx, confirmations = BLOCKS_CONFIRMATION, interval = TX_POOL_INTERVAL*/) {
      throw new Error("Not implemented!");
      // await awaitMinedTransaction(this.web3, tx, { interval, blocksToWait: confirmations });
    },

    machineValue(value, denominator = DEFAULT_DENOMINATION) {
      value = (value || 0).toString().trim();
      let denominatorShift = 0;

      if (/\./.test(value)) {
        const parts = value.split('');
        value = parts.filter(x => x !== '.').join('');
        denominatorShift = parts.length - parts.indexOf('.') - 1;
      }

      return this.toBN(value).mul(
        this.toBN(10).pow(
          this.toBN(denominator.toString())
            .sub(
              this.toBN(denominatorShift.toString())
            )
        )
      ).toString();
    },

    humanValue(value, denominator = DEFAULT_DENOMINATION, precision = WALLET_PRECISION) {
      value = fromExponential((value || 0).toString().trim());
      denominator = parseInt(denominator, 10);

      if (value.length < denominator) {
        value = `0.${ '0'.repeat(denominator - value.length) }${ value }`;
      } else {
        const [, pre, post ] = value.match(new RegExp(`^([0-9]*)([0-9]{${ denominator }})$`));
        value = `${ pre || 0 }.${ post }`;
      }

      return prettyNum(
        value,
        { precision, precisionSetting: PRECISION_SETTING.REDUCE_SIGNIFICANT }
      );
    },

    shortenAddress(address, chars = 9) {
      if (!address) {
        return 'N/A';
      }

      return `${(address || '').substr(0, chars)}...${(address || '').substr(-chars)}`;
    },

    hexToString(hex) {
      return hexToString(hex);
    },

    toBN(value = null) {
      return new BN((value || 0).toString());
    },
  },
}
