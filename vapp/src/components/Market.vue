<template>
  <Box>
    <template v-slot:title>Market</template>
    <template v-slot:content>
      <c-tabs :selected.sync="tab">
        <c-tabs-head>
          <c-tabs-item name="market">
            <c-icon type="tradingdata"></c-icon>Market
          </c-tabs-item>
          <c-tabs-item name="personal">
            <c-icon type="usercenter"></c-icon>My Orders
          </c-tabs-item>
          <c-tabs-item name="admin" v-if="isMarketplaceOwner">
            <c-icon type="tool-hardware"></c-icon>Administration
          </c-tabs-item>
        </c-tabs-head>
        <c-tabs-body>
          <Exchange/>
          <Personal/>
          <Admin v-if="isMarketplaceOwner"/>
        </c-tabs-body>
      </c-tabs>
    </template>
  </Box>
</template>

<script>
import mixins from '../mixins'
import { DEFAULT_TAB } from '../constants'
import routeGuards from '../helpers/route.guards'

import Box from './generic/Box.vue'
import Exchange from './Exchange.vue'
import Personal from './Personal.vue'
import Admin from './Admin.vue'

export default {
  mixins,
  ...routeGuards,
  name: "Market",

  components: {
    Box,
    Personal,
    Exchange,
    Admin,
  },

  computed: {
    isMarketplaceOwner() {
      return (this.blockchain.owner || '').toLowerCase() == (this.wallet || '').toLowerCase();
    },
  },

  data() {
    return {
      tab: DEFAULT_TAB,
    }
  },
};
</script>

<style>

</style>
