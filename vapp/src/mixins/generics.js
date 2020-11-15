import hashSum from 'hash-sum'
import { DONATE_WALLET, DONATE_AMOUNT } from '../constants'

export default {
  methods: {
    nothing() {},
    navigate(href) {
      this.$router.push(href);
    },
    pushAnalyticsEvent(event, payload = {}) {
      try {
        const isPageview = event === 'pageview';
        const method = isPageview ? 'pageview' : 'event';

        // do not send raw address, hash it to avoid sending PIIs!!
        if (this.isOnline && !isPageview) {
          payload.user = hashSum(payload.address || this.wallet);
          payload.network = payload.network || this.network;
        }

        // @todo Remove it?
        // eslint-disable-next-line no-console
        console.info(`[GA] method=${ method } event=${ event } payload=${ JSON.stringify(payload) }`);
        this.$gtag[method](event, payload);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[GA] ERROR >> ${ error.message }`);
      }
    },
    copyAddressToClipboard: async function (address = null) {
      address = address || this.wallet;

      try {
        await this.$copyText(address);
        this.notify(`Address "${address}" copied to clipboard.`);
      } catch(error) {
        this.notify(`Unable to copy address: ${error.message}`);
      }
    },
    async donate(amount = DONATE_AMOUNT) {
      this.pushAnalyticsEvent('donate', { amount });

      if (this.isOnline) {
        this.web3.eth.sendTransaction({
          to: DONATE_WALLET,
          from: this.wallet,
          value: this.web3.toWei(amount, 'ether'),
        }, (error) => {
          this.notify((error || {}).message || 'Thank you for the support!');
        });
      } else {
        // allow performing analytics push...
        setTimeout(() => {
          window.location = this.etherscanAccountLink(DONATE_WALLET, '1');
        }, 500);
      }
    }
  },
}
