<template>
  <Box>
    <template v-slot:title>Statistics</template>
    <template v-slot:content>
      <h1>General</h1>
      <c-row class="grid">
        <c-col span="24">
          <c-table
            :bordered="false"
            :selectedItems="false"
            :dataSource="stats"
          >
            <c-table-column field="paused" text="Status"></c-table-column>
            <c-table-column field="owner" text="Owner Address">
              <template slot-scope="props">
                <a v-if="props.value" :href="etherscanAccountLink(props.value)" target="_blank">
                  {{ shortenAddress(props.value) }}
                </a>
                <span v-else>N/A</span>
              </template>
            </c-table-column>
            <c-table-column field="address" text="Marketplace Address">
              <template slot-scope="props">
                <a v-if="props.value" :href="etherscanAccountLink(props.value)" target="_blank">
                  {{ shortenAddress(props.value) }}
                </a>
                <span v-else>N/A</span>
              </template>
            </c-table-column>
          </c-table>
        </c-col>
      </c-row>

      <br/>

      <h1>Rewards</h1>
      <c-row class="grid">
        <c-col span="24">
          <c-table
            :bordered="false"
            :selectedItems="false"
            :dataSource="stats"
          >
            <c-table-column field="reward" text="Current Value"></c-table-column>
            <c-table-column field="rewardsCount" text="Distributed Count"></c-table-column>
            <c-table-column field="rewardsValue" text="Distributed Value"></c-table-column>
          </c-table>
        </c-col>
      </c-row>

      <br/>

      <h1>Blacklist</h1>
      <c-row class="grid">
        <c-col span="24">
          <c-table
            :bordered="false"
            :selectedItems="false"
            :dataSource="stats"
          >
            <c-table-column field="blacklistedTokensCount" text="Blacklisted Tokens Count"></c-table-column>
          </c-table>
        </c-col>
      </c-row>

      <br/>

      <h1>Orders</h1>
      <c-row class="grid">
        <c-col span="24">
          <c-table
            :bordered="false"
            :selectedItems="false"
            :dataSource="stats"
          >
            <c-table-column field="openedOrders" text="Opened"></c-table-column>
            <c-table-column field="partiallyCompletedOrders" text="Partially Completed"></c-table-column>
            <c-table-column field="completedOrders" text="Completed"></c-table-column>
            <c-table-column field="closedOrders" text="Closed"></c-table-column>
            <c-table-column field="lastOrderId" text="Total"></c-table-column>
          </c-table>
        </c-col>
      </c-row>
      <!-- <div class="blockquote">
        * A counter reflects all orders that passed through that state without being further decremented,
        which would mean that an order is reflected in several counters at once.
      </div> -->
    </template>
  </Box>
</template>

<script>
import mixins from '../mixins'
import routeGuards from '../helpers/route.guards'

import Box from './generic/Box.vue'

export default {
  mixins,
  ...routeGuards,
  name: "Stats",

  components: {
    Box,
  },

  computed: {
    stats() {
      return [{
        address: this.blockchain.address,
        paused: this.blockchain.paused ? 'Paused' :  this.blockchain.address ? 'Active' : 'Not Deployed',
        owner: this.blockchain.owner,
        reward: this.humanValue(this.blockchain.reward, this.blockchain.rewardDecimals),
        rewardsCount: this.blockchain.rewardsCount.toString(),
        rewardsValue: this.humanValue(this.blockchain.rewardsValue),
        lastOrderId: this.blockchain.lastOrderId.toString(),
        blacklistedTokensCount: this.blockchain.blacklistedTokensCount.toString(),
        openedOrders: this.blockchain.openedOrders.toString(),
        partiallyCompletedOrders: this.blockchain.partiallyCompletedOrders.toString(),
        completedOrders: this.blockchain.completedOrders.toString(),
        closedOrders: this.blockchain.closedOrders.toString(),
      }];
    },
  },
};
</script>

<style>
.blockquote {
  margin: 5px;
  font-size: 0.7em;
  font-style: italic;
}
</style>
