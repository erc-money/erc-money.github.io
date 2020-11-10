<template>
  <Box :width="'inherit'" :noAnimate="true">
    <template v-slot:title>Wallet</template>
    <template v-slot:content>
      <div id="wallet">
        <c-row class="grid">
          <c-col span="4">
            <Jazzicon :address="$store.state.wallet" :diameter="50" />
          </c-col>
          <c-col span="20" class="eth-address">
            <a @click.prevent="copyWallet()">
              {{ walletShort }}
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
          <c-table-column field="symbol"></c-table-column>
          <c-table-column field="amount"></c-table-column>
          <c-table-column field="link">
            <template slot-scope="props">
              <a :href="props.value" class="etherscan-text" target="_blank">
                <c-button icon="link" size="small" v-on:click="nothing()">Etherscan</c-button>
              </a>
              <a :href="props.value" class="etherscan-icon" target="_blank">
                <c-button icon="link" size="small" v-on:click="nothing()">E</c-button>
              </a>
            </template>
          </c-table-column>
        </c-table>
      </div>
    </template>
  </Box>
</template>

<script>
import mixins from '../mixins'

import Box from './generic/Box.vue'

export default {
  mixins,
  name: "Wallet",

  computed: {
    holdings() {
      const tokens = (this.blockchain.wallet.tokens || []).map(token => {
        return {
          symbol: token.symbol,
          amount: this.humanValue(token.balance, token.decimals),
          link: this.etherscanTokenLink(token.address),
        };
      });

      return [{
        symbol: 'ETH',
        amount: this.humanValue(this.blockchain.wallet.balance),
        link: this.etherscanAccountLink(this.wallet),
      }, ...tokens];
    },
  },

  components: {
    Box,
  },

  methods: {
    copyWallet: async function () {
      try {
        await this.$copyText(this.wallet);
        this.notify(`Address "${this.wallet}" copied to clipboard.`);
      } catch(error) {
        this.notify(`Unable to copy address: ${error.message}`);
      }
    },
  },
};
</script>

<style>
.eth-address {
  line-height: 50px;
  white-space: nowrap;
  overflow: hidden;
  cursor: pointer;
}

.eth-address:hover {
  color: #5D354D;
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

@media screen and (max-width: 1200px) {
  .etherscan-icon {
    display: inline-block;
  }
}

@media screen and (min-width: 1200px) {
  .etherscan-text {
    display: inline-block;
  }
}
</style>
