<template>
  <Box>
    <template v-slot:title>Market</template>
    <template v-slot:content>
      <!-- <c-row class="grid">
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

      <c-row class="grid">
        <c-col span="24">
          <c-table
            :bordered="false"
            :selectedItems="false"
            :dataSource="stats"
          >
            <c-table-column field="openedOrders" text="Opened"></c-table-column>
            <c-table-column field="partiallyCompletedOrders" text="Partial Completed"></c-table-column>
            <c-table-column field="completedOrders" text="Completed"></c-table-column>
            <c-table-column field="closedOrders" text="Closed"></c-table-column>
            <c-table-column field="lastOrderId" text="Total"></c-table-column>
          </c-table>
        </c-col>
      </c-row> -->
    </template>
  </Box>
</template>

<script>
import mixins from '../mixins'

import Box from './generic/Box.vue'

export default {
  mixins,
  name: "Market",

  components: {
    Box,
  },
};
</script>

<style>

</style>
