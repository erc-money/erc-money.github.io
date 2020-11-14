<template>
  <c-tabs-pane name="market">
    <h1>Current Reward - {{ humanReward }} {{ blockchain.rewardSymbol }}</h1>

    <c-row class="grid filter" v-if="current === null">
      <c-col span="4"></c-col>
      <c-col span="18">
        <c-input placeholder="Filter Orders (by token symbol)" v-model="symbolFilter" size="large"></c-input>
      </c-col>
      <c-col span="4"></c-col>
    </c-row>

    <c-table
      :bordered="false"
      :selectedItems="false"
      :dataSource="orders"
      v-if="orders.length > 0 && current === null"
    >
      <c-table-column field="id" text="ID"></c-table-column>
      <c-table-column field="from" text="Get">
        <template slot-scope="props">
          {{ props.value.amount }}
          <a :href="props.value.link" target="_blank">
            {{ props.value.symbol }}
          </a>
        </template>
      </c-table-column>
      <c-table-column field="to" text="Spend">
        <template slot-scope="props">
          {{ props.value.amount }}
          <a :href="props.value.link" target="_blank">
            {{ props.value.symbol }}
          </a>
        </template>
      </c-table-column>
      <c-table-column field="remaining" text="Remaining Amount">
        <template slot-scope="props">
          {{ props.value.amount }}
          <a :href="props.value.link" target="_blank">
            {{ props.value.symbol }}
          </a>
        </template>
      </c-table-column>
      <c-table-column field="partial" text="Partial"></c-table-column>
      <c-table-column field="_" text="Actions">
        <template slot-scope="props">
          <c-button v-if="isSameAddress(props.value.owner, wallet)" icon="close" v-on:click="close(props.value.id)">Close</c-button>
          <c-button v-else icon="trust" v-on:click="setCurrent(props.value)">Exchange</c-button>
        </template>
      </c-table-column>
    </c-table>
    <div v-else-if="current !== null">
      <c-row class="grid">
        <c-col span="11">
          <c-input placeholder="Amount" :readonly="current.order.allowPartial == false" v-model="currentHumanAmount"></c-input>
        </c-col>
        <c-col span="1"></c-col>
        <c-col span="11">
          <c-input placeholder="Wallet" v-model="current.wallet"></c-input>
        </c-col>
        <c-col span="1"></c-col>
      </c-row>
      <c-row class="grid">
        <c-col span="24">
          <h1>
            You will get
            <a :href="etherscanTokenLink(current.order.from, current.wallet)" target="_blank">
              {{ currentHumanAmount }} {{ current.order.fromSymbol }}
            </a>
            <br/>
            to
            <a :href="etherscanAccountLink(current.wallet)" target="_blank">
              {{ current.wallet }}
            </a>
            and receive {{ humanReward }} {{ blockchain.rewardSymbol }} to
            <a :href="etherscanAccountLink(current.wallet)" target="_blank">
              {{ current.wallet }}
            </a>
            on top of it.
          </h1>
        </c-col>
      </c-row>
      <c-row class="grid">
        <c-col span="24">
          <c-button-group>
            <c-button icon="good-fill" v-on:click="exchange()" :loading="exchanging" :disabled="exchanging">Accept</c-button>
            <c-button icon="close" v-on:click="resetCurrent()" :loading="exchanging" :disabled="exchanging">Cancel</c-button>
          </c-button-group>
        </c-col>
      </c-row>
    </div>
    <h1 v-else>No Orders Found.</h1>

    <c-button-group v-if="current === null">
      <c-button icon="arrow-lift" :disabled="offset == 0" @click="prev()">
        Prev
      </c-button>
      <c-button icon="arrow-right" icon-position="right" :disabled="orders.length == 0" @click="next()">
        Next
      </c-button>
    </c-button-group>
  </c-tabs-pane>
</template>

<script>
import { mapActions } from 'vuex'
import { debounce } from 'vue-debounce'
import { ORDERS_PAGE_SIZE, GENERIC_TOKEN } from '../constants'
import mixins from '../mixins'

export default {
  mixins,
  name: "Exchange",

  components: {
  },

  created() {
    this.addBlockchainHandler({
      stateKey: 'orders',
      functor: this._handleMarket.bind(this),
      value: [],
    });
    this._handleMarketInternal();
  },

  data() {
    return {
      // market
      pageSize: ORDERS_PAGE_SIZE,
      offset: 0,
      offsets: [0],
      filterSymbol: '',

      // trade
      current: null, // { order, amount, wallet }
      exchanging: false,
    }
  },

  computed: {
    orders() {
      return this.blockchain.orders;
    },

    humanReward() {
      return this.humanValue(this.blockchain.reward, this.blockchain.rewardDecimals);
    },

    symbolFilter: {
      get() {
        return this.filterSymbol;
      },
      set(newValue) {
        this.filterSymbol = newValue;
        this.applySymbolFilter.call(this);
      },
    },

    currentHumanAmount: {
      get() {
        return this.humanValue(this.current.amount, this.current.order.fromDecimals);
      },
      set(newValue) {
        this.updateCurrentHumanAmount.call(this, newValue);
      },
    },
  },

  methods: {
    applySymbolFilter: debounce(function () {
      this._handleMarketInternal();
    }, '500ms'),

    updateCurrentHumanAmount: debounce(function (value) {
      if (value.trim().length > 0) {
        this.current.amount = this.machineValue(value, this.current.order.fromDecimals);

        if (this.toBN(this.current.amount).gt(this.current.order.remaining)) {
          this.$nextTick(async () => {
            this.current.amount = this.current.order.remaining.toString();
          });
        }
      }
    }, '500ms'),

    next() {
      if (this.orders.length > 0) {
        this.offset++;
        this._handleMarketInternal();
      }
    },

    prev() {
      if (this.offset > 0) {
        this.offset--;
        this._handleMarketInternal();
      }
    },

    setCurrent(order) {
      this.resetCurrent();
      this.current = {
        order,
        amount: order.remaining,
        wallet: this.wallet,
      };
    },

    resetCurrent() {
      this.current = null;
    },

    async exchange() {
      if (!this.current || this.exchanging) {
        return;
      }

      this.exchanging = true;
      const { order, amount, wallet } = this.current;
      const {
        Marketplace,
        [GENERIC_TOKEN]: Token,
      } = this.blockchain;
      const marketplace = await Marketplace.deployed();
      const token = await Token.at(order.to);

      // @todo: Figure out a way to check allowance for desired order only
      // this might use allowance set for other trades, thus breaking that ones...
      try {
        const [ payoffAmount/*, allowance*/ ] = await Promise.all([
          marketplace.orderPayoffAmount.call(order.id, amount),
          //token.allowance.call(this.wallet, Marketplace.address),
        ]);
        const humanPayoffAmount = this.humanValue(payoffAmount.toString(), order.toDecimals);

        //if (!this.toBN(allowance).gte(this.toBN(payoffAmount))) {
          await token.increaseAllowance(Marketplace.address, payoffAmount, { from: this.wallet });
          // await this.awaitTxConfirmation(tx);
          this.notify(`[Order#${ order.id }] Allowance of ${ humanPayoffAmount } ${ order.toSymbol } confirmed.`);
        //}
        
        await marketplace.claimOrder(
          order.id,
          amount,
          wallet,
          { from: this.wallet }
        );

        this.notify(`[Order#${ order.id }] An amount of ${ this.currentHumanAmount } ${ order.fromSymbol } send to ${ wallet }.`);
        this.resetCurrent();
        this.exchanging = false;
      } catch (error) {
        this.exchanging = false;
        this.notify(`Unable to claim Order#${ order.id } tokens: ${ error.message }`);
      }
    },

    async close(id) {
      const { Marketplace } = this.blockchain;
      const marketplace = await Marketplace.deployed();

      try {
        await marketplace.closeOrder(id, { from: this.wallet });
        this.notify(`Order#${ id } successfully closed.`);
      } catch (error) {
        this.notify(`Unable to close Order#${ id }: ${ error.message }`);
      }
    },

    async _handleMarketInternal() {
      this.$nextTick(async () => {
        this.updateBlockchain({
          stateKey: 'orders',
          value: await this._handleMarket({
            state: this.blockchain,
          }),
        });
      });
    },
    
    async _handleMarket({ state }) {
      const { Marketplace } = state;

      if (!Marketplace) {
        return [];
      }

      const marketplace = await Marketplace.deployed();

      // listOrders(uint offset, uint size, bool listOnlyActive) public view
      //    returns (IOrder.Order[] memory page, uint newOffset, uint entries)
      const { page, newOffset, entries } = await marketplace.listOrders.call(
        this.offsets[this.offset] || 0,
        this.pageSize,
        /** listOnlyActive = */ true,
        this.filterSymbol
      );

      if (parseInt(entries.toString(), 10) <= 0) {
        return [];
      }

      this.offsets[this.offset + 1] = newOffset.toString();
      const orders = [];

      for (const order of page) {
        if (order.id == '0') continue;

        const from = {
          amount: this.humanValue(order.fromAmount, order.fromDecimals),
          symbol: order.fromSymbol,
          link: this.etherscanTokenLink(order.from),
        };
        const to = {
          amount: this.humanValue(order.toAmount, order.toDecimals),
          symbol: order.toSymbol,
          link: this.etherscanTokenLink(order.to),
        };
        const remaining = {
          amount: this.humanValue(
            this.toBN(order.fromAmount).sub(this.toBN(order.completedAmount)),
            order.fromDecimals
          ),
          symbol: order.fromSymbol,
          link: this.etherscanTokenLink(order.from),
        };

        orders.push({
          id: `${ this.orderHumanStatus(order.status) }_${ order.id }`,
          from,
          to,
          remaining,
          partial: order.allowPartial ? 'Yes' : 'No',
          _: {
            ...order,
            remaining: this.toBN(order.fromAmount).sub(this.toBN(order.completedAmount)),
          },
        });
      }

      return orders;
    },

    ...mapActions(['addBlockchainHandler', 'updateBlockchain']),
  },
};
</script>

<style>
#symbol-filter {
  width: 90%;
}

.c-row.filter {
  margin-bottom: 20px;
}

.c-col-wrapper > .c-button-group {
  margin-top: 20px;
}

.c-col-wrapper > input {
  width: 100% !important;
}

.tr-data > td > a {
  color: #FCDA06;
  font-size: 1.2em;
}

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

.c-tabs-item > .c-tabs-pane {
  text-align: center;
}

.c-tabs-item > .c-tabs-pane > .c-button-group {
  margin-top: 20px;
}

h1 {
  font-size: 1.2em;
  color: #5D354D;
  text-transform: uppercase;
  font-weight: bold;
  padding: 20px;
}
</style>
