import { DONATE_WALLET, DONATE_AMOUNT } from '../constants'

export default {
  methods: {
    nothing() {},
    navigate(href) {
      this.$router.push(href);
    },
    donate(amount = DONATE_AMOUNT) {
      if (this.isOnline) {
        this.web3.eth.sendTransaction({
          to: DONATE_WALLET,
          from: this.wallet,
          value: this.web3.toWei(amount, 'ether'),
        }, (error) => {
          this.notify((error || {}).message || 'Thank you for the support!');
        });
      } else {
        window.location = this.etherscanAccountLink(DONATE_WALLET, '1');
      }
    }
  },
}
