import etherscanLink from '@metamask/etherscan-link'

export default {
  methods: {
    etherscanAccountLink(address, network = null) {
      return etherscanLink.createAccountLink(
        address, network || this.network,
      );
    },

    etherscanExplorerLink(hash, network = null) {
      return etherscanLink.createExplorerLink(
        hash, network || this.network,
      );
    },
  },
}
