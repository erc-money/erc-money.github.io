<template>
  <Box :width="'inherit'" :noAnimate="true">
    <template v-slot:title>Wallet</template>
    <template v-slot:content>
      <div id="wallet">
        <c-row class="grid">
          <c-col span="4">
            <div id="identicon" v-html="identicon"></div>
          </c-col>
          <c-col span="20" class="eth-address">
            <a @click.prevent="copyAddressToClipboard()">
              {{ shortenAddress(wallet) }}
              <c-icon type="copy"></c-icon>
            </a>
          </c-col>
        </c-row>

        <c-table
          stripe
          :bordered="false"
          :selectedItems="false"
          :dataSource="holdings"
        >
          <c-table-column field="symbolAndAddress">
            <template slot-scope="props">
              <a @click.prevent="copyAddressToClipboard(props.value.address)" class="address-copy">
                {{ props.value.symbol }}
              </a>
            </template>
          </c-table-column>
          <c-table-column field="amount"></c-table-column>
          <c-table-column field="link">
            <template slot-scope="props">
              <a :href="props.value" class="etherscan-text" target="_blank">
                <c-button icon="link" v-on:click="nothing()">Etherscan</c-button>
              </a>
              <a :href="props.value" class="etherscan-icon" target="_blank">
                <c-button icon="link" v-on:click="nothing()">E</c-button>
              </a>
            </template>
          </c-table-column>
        </c-table>
      </div>
    </template>
  </Box>
</template>

<script>
import multiavatar from '@multiavatar/multiavatar'
import mixins from '../mixins'

import Box from './generic/Box.vue'

export default {
  mixins,
  name: "Wallet",

  computed: {
    identicon() {
      return multiavatar(this.wallet.toString());
    },

    holdings() {
      const tokens = (this.blockchain.wallet.tokens || []).map(token => {
        const { symbol, address, decimals, balance } = token;

        return {
          symbolAndAddress: { symbol, address },
          amount: this.humanValue(balance, decimals),
          link: this.etherscanTokenLink(address),
        };
      });

      return [{
        symbolAndAddress: { symbol: 'ETH', address: null },
        amount: this.humanValue(this.blockchain.wallet.balance),
        link: this.etherscanAccountLink(this.wallet),
      }, ...tokens];
    },
  },

  components: {
    Box,
  },
};
</script>

<style>
a.address-copy {
  cursor: pointer;
}

.eth-address {
  line-height: 50px;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
  margin-left: 10px;
}

.eth-address:hover {
  color: #5D354D;
}

#identicon {
  width: 50px;
  border: 3px solid #5D354D;
  border-bottom: 1px solid #5D354D;
  border-radius: 50%;
  background-color: #5D354D;
  margin: 0;
  padding: 0;
}

#wallet > .c-table-wrapper {
  margin-top: 15px;
  margin-bottom: 10px;
}

#wallet > .c-table-wrapper > .c-table > thead {
  display: none;
}

.etherscan-icon,
.etherscan-text {
  display: none;
}

/* "lg" row */
@media screen and (max-width: 993px) {
  .etherscan-icon {
    display: inline-block;
  }

  #wallet-container {
    display: none;
  }
}

/* "lg" row */
@media screen and (min-width: 993px) {
  .etherscan-text {
    display: inline-block;
  }
}
</style>
