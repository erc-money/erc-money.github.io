<template>
  <div id="footer">
    <a href="mailto:info@erc.money">
      <c-button icon="email-fill" v-on:click="nothing()">Contact Us</c-button>
    </a>

    <c-button icon="dollar" v-on:click="donate()">Donate ETH</c-button>

    <a href="https://github.com/erc-money" target="_blank">
      <c-button icon="code" v-on:click="nothing()">Github</c-button>
    </a>
  </div>
</template>

<script>
import mixins from '../mixins'
import { DONATE_WALLET, DONATE_AMOUNT } from '../constants'

export default {
  mixins,
  name: "Footer",

  methods: {
    donate() {
      if (this.isOnline) {
        this.web3.eth.sendTransaction({
          to: DONATE_WALLET,
          from: this.wallet,
          value: this.web3.toWei(DONATE_AMOUNT, 'ether'),
        }, (error) => {
          this.notify((error || {}).message || 'Thank you for the support!');
        });
      } else {
        window.location = this.etherscanAccountLink(DONATE_WALLET, '1');
      }
    }
  },
};
</script>

<style>
#footer > a {
  margin: 10px;
}
</style>
