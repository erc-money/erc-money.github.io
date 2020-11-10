import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'isTestnet', 'isOnline', 'walletShort',
      'wallet', 'web3', 'network', 'blockchain',
    ]),
  },
}
