<template>
  <Box>
    <template v-slot:title>Market</template>
    <template v-slot:content>
      <c-tabs :selected.sync="tab">
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
            <h1>Current Reward - {{ humanReward }} {{ blockchain.rewardSymbol }}</h1>

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
                <c-col span="8">
                  <c-input placeholder="Amount" :readonly="current.order.allowPartial == false" v-model="currentHumanAmount"></c-input>
                </c-col>
                <c-col span="16">
                  <c-input placeholder="Wallet" v-model="current.wallet"></c-input>
                </c-col>
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
                    <hr/>
                    Rewards to be sent:
                    <br/>
                    {{ humanReward }} {{ blockchain.rewardSymbol }} -
                    <a :href="etherscanAccountLink(wallet)" target="_blank">
                      {{ wallet }}
                    </a>
                    <br/>
                    {{ humanReward }} {{ blockchain.rewardSymbol }} -
                    <a :href="etherscanAccountLink(current.order.owner)" target="_blank">
                      {{ current.order.owner }}
                    </a>
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
          <c-tabs-pane name="personal">
            <div>
              <c-row class="grid">
                <c-col span="4">
                  <div class="token-details">
                    <a v-if="fromAddress" :href="etherscanAccountLink(fromAddress)" target="_blank">
                      {{ fromSymbol }}
                    </a>
                    <span v-else>N/A</span>
                  </div>
                </c-col>
                <c-col span="10">
                  <c-input placeholder="Token Address" v-model="fromToken"></c-input>
                </c-col>
                <c-col span="10">
                  <c-input placeholder="Give" :readonly="!fromSymbol || !fromDecimals" v-model="createFromHumanAmount"></c-input>
                </c-col>
              </c-row>
              <c-row class="grid">
                <c-col span="4">
                  <div class="token-details">
                    <a v-if="toAddress" :href="etherscanAccountLink(toAddress)" target="_blank">
                      {{ toSymbol }}
                    </a>
                    <span v-else>N/A</span>
                  </div>
                </c-col>
                <c-col span="10">
                  <c-input placeholder="Token Address" v-model="toToken"></c-input>
                </c-col>
                <c-col span="10">
                  <c-input placeholder="Get" :readonly="!toSymbol || !toDecimals" v-model="createToHumanAmount"></c-input>
                </c-col>
              </c-row>
              <c-row class="grid">
                <c-col span="24" class="create-actions">
                  <c-button icon="smile-fill" v-on:click="create(true)" :loading="creating" :disabled="!createValid">Partial</c-button>
                  <c-button icon="cry-fill" icon-position="right" v-on:click="create(false)" :loading="creating" :disabled="!createValid">Integral</c-button>
                </c-col>
              </c-row>
            </div>

            <c-table
              :bordered="false"
              :selectedItems="false"
              :dataSource="personalOrders"
              v-if="personalOrders.length > 0"
            >
              <c-table-column field="id" text="ID"></c-table-column>
              <c-table-column field="from" text="Send">
                <template slot-scope="props">
                  {{ props.value.amount }}
                  <a :href="props.value.link" target="_blank">
                    {{ props.value.symbol }}
                  </a>
                </template>
              </c-table-column>
              <c-table-column field="to" text="Receive">
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
                  <c-button icon="close" v-on:click="close(props.value.id)">Close</c-button>
                </template>
              </c-table-column>
            </c-table>
            <h1 v-else>No Orders Found.</h1>
          </c-tabs-pane>
        </c-tabs-body>
      </c-tabs>
    </template>
  </Box>
</template>

<script>
import { mapActions } from 'vuex'
import { debounce } from 'vue-debounce'
import { ORDERS_PAGE_SIZE, GENERIC_TOKEN } from '../constants'
import mixins from '../mixins'

import Box from './generic/Box.vue'

export default {
  mixins,
  name: "Market",

  components: {
    Box,
  },

  created() {
    this.addBlockchainHandler({
      stateKey: 'orders',
      functor: this._handleMarket.bind(this),
      value: [],
    });
    this.addBlockchainHandler({
      stateKey: 'personalOrders',
      functor: this._handlePersonal.bind(this),
      value: [],
    });
    this._handleMarketInternal();
    this._handlePersonalInternal();
  },

  data() {
    return {
      tab: 'market',

      // market
      pageSize: ORDERS_PAGE_SIZE,
      offset: 0,
      offsets: [0],

      // trade
      current: null, // { order, amount, wallet }
      exchanging: false,

      // create
      fromAddress: '',
      fromSymbol: '',
      fromDecimals: '',
      fromAmount: '0',
      toAddress: '',
      toSymbol: '',
      toDecimals: '',
      toAmount: '0',
      creating: false,
    }
  },

  computed: {
    orders() {
      return this.blockchain.orders;
    },

    personalOrders() {
      return this.blockchain.personalOrders;
    },

    humanReward() {
      return this.humanValue(this.blockchain.reward, this.blockchain.rewardDecimals);
    },

    createValid() {
      return this.fromAddress
        && this.fromSymbol
        && this.fromDecimals
        && this.toBN(this.fromAmount).gte(this.toBN('0'))
        && this.toAddress
        && this.toSymbol
        && this.toDecimals
        && this.toBN(this.toAmount).gte(this.toBN('0'))
        && this.fromAddress != this.toAddress;
    },

    fromToken: {
      get() {
        return this.fromAddress;
      },
      set(address) {
        this.fromAddress = address;
        this.fromAmount = '0';
        this.fetchTokenInfo(address, 'from');
      },
    },

    toToken: {
      get() {
        return this.toAddress;
      },
      set(address) {
        this.toAddress = address;
        this.toAmount = '0';
        this.fetchTokenInfo(address, 'to');
      },
    },

    createFromHumanAmount: {
      get() {
        return (this.fromAmount && this.fromDecimals)
          ? this.humanValue(this.fromAmount, this.fromDecimals)
          : '0';
      },
      set(newValue) {
        this.updateFromHumanAmount.call(this, newValue);
      },
    },

    createToHumanAmount: {
      get() {
        return (this.toAmount && this.toDecimals)
          ? this.humanValue(this.toAmount, this.toDecimals)
          : '0';
      },
      set(newValue) {
        this.updateToHumanAmount.call(this, newValue);
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
    async fetchTokenInfo(address, prop) {
      if (!this.isAddress(address)) {
        return;
      }
      
      const { [GENERIC_TOKEN]: Token } = this.blockchain;
      const token = await Token.at(address);

      try {
        const [ symbol, decimals ] = await Promise.all([
          token.symbol.call(),
          token.decimals.call(),
        ]);

        this[`${ prop }Symbol`] = symbol.toString();
        this[`${ prop }Decimals`] = decimals.toString();
      } catch (error) {
        this.notify(`Unable to fetch token info at "${ address }": ${ error.message }`);
      }
    },

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

    updateFromHumanAmount: debounce(function (value) {
      if (value.trim().length > 0) {
        this.fromAmount = this.machineValue(value, this.fromDecimals);
      }
    }, '500ms'),

    updateToHumanAmount: debounce(function (value) {
      if (value.trim().length > 0) {
        this.toAmount = this.machineValue(value, this.toDecimals);
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
        amount: order.fromAmount,
        wallet: this.wallet,
      };
    },

    resetCurrent() {
      this.current = null;
    },

    async create(allowPartial) {
      if (this.creating || !this.createValid) {
        return;
      }

      this.creating = true;
      const {
        Marketplace,
        [GENERIC_TOKEN]: Token,
      } = this.blockchain;
      const marketplace = await Marketplace.deployed();
      const token = await Token.at(this.fromAddress);

      // @todo: Figure out a way to check allowance for desired order only
      // this might use allowance set for other trades, thus breaking that ones...
      try {
        // const [ allowance ] = await Promise.all([
        //   token.allowance.call(this.wallet, Marketplace.address),
        // ]);

        //if (!this.toBN(allowance).gte(this.toBN(this.fromAmount))) {
          await token.increaseAllowance(Marketplace.address, this.fromAmount, { from: this.wallet });
          // await this.awaitTxConfirmation(tx);
          this.notify(`Allowance of ${ this.createFromHumanAmount } ${ this.fromSymbol } confirmed.`);
        //}
        
        const { logs: [ { args: { orderId } } ] } = await marketplace.createOrder(
          this.fromAddress,
          this.fromAmount,
          this.toAddress,
          this.toAmount,
          allowPartial,
          { from: this.wallet }
        );

        this.notify(`Your Order has been created under ID Order@${ orderId.toString() }`);
        this.creating = false;
      } catch (error) {
        this.creating = false;
        this.notify(`Unable to create the Order: ${ error.message }`);
      }
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

    async close (id) {
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

    async _handlePersonalInternal() {
      this.$nextTick(async () => {
        this.updateBlockchain({
          stateKey: 'personalOrders',
          value: await this._handlePersonal({
            state: this.blockchain,
          }),
        });
      });
    },

    async _handlePersonal({ state }) {
      const { Marketplace } = state;

      if (!Marketplace) {
        return [];
      }

      const marketplace = await Marketplace.deployed();

      // function listActiveUserOrders(address user) public view
      //    returns (IOrder.Order[] memory userOrders)
      const userOrders = await marketplace.listActiveUserOrders.call(this.wallet);

      if (userOrders.length <= 0) {
        return [];
      }

      const orders = [];

      for (const order of userOrders) {
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
          _: order,
        });
      }

      return orders;
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
        /** listOnlyActive = */ true
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
.create-actions {
  justify-content: flex-end;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -ms-flex-align: center;
  -webkit-align-items: center;
  -webkit-box-align: center;
  align-items: center;
  margin-top: 10px;
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

.c-col-wrapper > div.token-details {
  color: #5D354D;
  font-size: 1.2em;
  margin-top: 0.5em;
}

.c-col-wrapper > div.token-details > a {
  text-decoration: none;
  color: #5D354D;
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
