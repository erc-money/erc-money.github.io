<template>
  <Box :width="'inherit'">
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
          <c-table-column field="asset"></c-table-column>
          <c-table-column field="amount"></c-table-column>
          <c-table-column field="actions">
            <template>
              <a :href="etherscanAccountLink()" target="_blank">
                <c-button icon="link" v-on:click="nothing()">Etherscan</c-button>
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
      return [{
        asset: 'ETH',
        amount: this.humanValue(this.blockchain.wallet.balance),
      }];
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
    }
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
</style>
