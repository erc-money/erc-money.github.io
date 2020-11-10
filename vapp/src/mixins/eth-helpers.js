import etherscanLink from '@metamask/etherscan-link'
import { formatted, fromMinimal } from 'ccunits'
import { WALLET_PRECISION } from '../constants'

export default {
  methods: {
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
      return formatted(fromMinimal(value.toString(), denominator), WALLET_PRECISION);
    },
  },
}
