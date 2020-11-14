import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'isTestnet', 'isOnline', 'wallet',
      'web3', 'network', 'blockchain',
    ]),
  },
}
