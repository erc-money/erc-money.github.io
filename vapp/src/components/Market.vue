<template>
  <Box>
    <template v-slot:title>Market</template>
    <template v-slot:content>
      <c-tabs :selected.sync="tab" @update:selected="onTabChange">
        <c-tabs-head>
          <c-tabs-item name="market">
            <c-icon type="market"></c-icon>Market
          </c-tabs-item>
          <c-tabs-item name="personal">
            <c-icon type="personal"></c-icon>My Orders
          </c-tabs-item>
        </c-tabs-head>
        <c-tabs-body>
          <c-tabs-pane name="market">
            <c-table
              :bordered="false"
              :selectedItems="false"
              :dataSource="orders"
            >
              <!-- 
              <c-table-column field="id" text="ID"></c-table-column>
              <c-table-column field="_" text="Pair">

              </c-table-column>
              <c-table-column field="status" text="Status">

              </c-table-column>
              <c-table-column field="remainingValue" text="Remaining Amount"></c-table-column>
              <c-table-column field="_" text="Actions">

              </c-table-column>
              -->
            </c-table>

            <c-pagination
              :current.sync="currentPage"
              :total="total"
              :page-size="pageSize"
              :hide-on-single-page="false"
              @change="onPageChange"
            ></c-pagination>
          </c-tabs-pane>
          <c-tabs-pane name="personal">
            <c-table
              :bordered="false"
              :selectedItems="false"
              :dataSource="personalOrders"
            >
              <!-- 
              <c-table-column field="id" text="ID"></c-table-column>
              <c-table-column field="_" text="Pair">

              </c-table-column>
              <c-table-column field="status" text="Status">

              </c-table-column>
              <c-table-column field="remainingValue" text="Remaining Amount"></c-table-column>
              <c-table-column field="_" text="Actions">

              </c-table-column>
              -->
            </c-table>
          </c-tabs-pane>
        </c-tabs-body>
      </c-tabs>
    </template>
  </Box>
</template>

<script>
import { ORDERS_PAGE_SIZE } from '../constants'
import mixins from '../mixins'

import Box from './generic/Box.vue'

export default {
  mixins,
  name: "Market",

  components: {
    Box,
  },

  computed: {
    total() {
      return this.$store.state.blockchain.lastOrderId.toString();
    },
  },

  data() {
    return {
      tab: 'market',
      orders: [],
      personalOrders: [],
      pageSize: ORDERS_PAGE_SIZE,
      currentPage: 1,
    }
  },

  methods: {
    onTabChange() {

    },

    onPageChange() {

    },
  },
};
</script>

<style>
.c-tabs-item {
  border: none !important;
}

.c-tabs-head > .c-tabs-item {
  background-color: #5D354D;
  color: #FCDA06;
}

.c-tabs-head > .c-tabs-item.active {
  background-color: #FCDA06;
  color: #5D354D;
}
</style>
