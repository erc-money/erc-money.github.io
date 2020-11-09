<template>
  <div id="footer">
    <a href="mailto:info@erc.money">
      <c-button icon="email-fill" v-on:click="nothing()">Contact Email</c-button>
    </a>

    <c-button icon="dollar" v-on:click="donate()">Support w/ ETH</c-button>

    <a href="https://github.com/erc-money" target="_blank">
      <c-button icon="code" v-on:click="nothing()">Github</c-button>
    </a>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { DONATE_WALLET } from '../constants';

export default {
  name: "Footer",

  computed: mapGetters(['isOnline', 'web3', 'wallet']),

  methods: {
    nothing() {},
    donate() {
      if (this.isOnline) {
        this.web3.eth.sendTransaction({
          to: DONATE_WALLET,
          from: this.wallet,
          value: this.web3.toWei('0.5', 'ether'),
        }, (error) => {
          this.$message({
            message: (error || {}).message || 'Thank you for the support!',
            position: 'center',
            autoClose: 5,
            closeButton: false,
          });
        });
      } else {
        window.location = `https://etherscan.io/address/${DONATE_WALLET}`;
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
