import etherscanLink from '@metamask/etherscan-link'
import { formatted, fromMinimal } from 'ccunits'
import { WALLET_PRECISION } from '../constants'

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

    humanValue(value, denominator = 18) {
      const hvalueRaw = fromMinimal(value.toString(), denominator);
      const hvalue = formatted(hvalueRaw, WALLET_PRECISION);    
      return parseFloat(hvalue).toFixed(WALLET_PRECISION);
    },
  },
}
