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
</style>
