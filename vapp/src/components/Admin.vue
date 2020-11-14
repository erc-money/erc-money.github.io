<template>
  <c-tabs-pane name="admin">
    <h1>Token Blacklist</h1>
    <c-row class="grid">
      <c-col span="2">
        <div class="token-blacklisted">
          <c-icon :type="blacklistStatus ? 'cry-fill' : 'smile-fill'"></c-icon>
        </div>
      </c-col>
      <c-col span="4">
        <div class="token-details">
          <a v-if="blacklistAddress" :href="etherscanTokenLink(blacklistAddress)" target="_blank">
            {{ blacklistSymbol }}
          </a>
          <span v-else>N/A</span>
        </div>
      </c-col>
      <c-col span="8">
        <c-input placeholder="Token Address" v-model="blacklistToken"></c-input>
      </c-col>
      <c-col span="10">
        <c-button icon="reduce" v-on:click="blacklist(true)" :loading="working" :disabled="!blacklistValid || blacklistStatus">Blacklist</c-button>
        <c-button icon="security" v-on:click="blacklist(false)" :loading="working" :disabled="!blacklistValid || !blacklistStatus">Resurrect</c-button>
      </c-col>
    </c-row>

    <h1>Order Reward</h1>
    <c-row class="grid">
      <c-col span="8">
        <div class="token-details">
          Current: {{ humanReward }}
        </div>
      </c-col>
      <c-col span="8">
        <c-input placeholder="New Reward" v-model="reward"></c-input>
      </c-col>
      <c-col span="10">
        <c-button icon="credit-level" v-on:click="updateReward()" :loading="working">Update</c-button>
      </c-col>
    </c-row>

    <h1>Marketplace Controls</h1>
    <c-row class="grid">
      <c-col span="26">
        <toggle-button
          :width="90"
          :height="30"
          :color="{ checked: '#FCDA06', unchecked: '#5D354D' }"
          :labels="{ checked: 'Active', unchecked: 'Paused' }"
          :value="isActive"
          @change="freeze"
          :sync="true"/>
      </c-col>
    </c-row>
  </c-tabs-pane>
</template>

<script>
import { mapActions } from 'vuex'
import { debounce } from 'vue-debounce'
import { GENERIC_TOKEN } from '../constants'
import mixins from '../mixins'

export default {
  mixins,
  name: "Admin",

  created() {
    
  },

  components: {
  },

  data() {
    return {
      // generic
      working: false,

      // blacklisting
      blacklistStatus: false,
      blacklistAddress: '',
      blacklistSymbol: '',

      // reward
      newReward: 0,
    }
  },

  computed: {
    isActive() {
      return !this.blockchain.paused;
    },
    blacklistToken: {
      get() {
        return this.blacklistAddress;
      },
      set(address) {
        this.blacklistAddress = address;
        this.blacklistStatus = false;
        this.blacklistSymbol = '';
        this.fetchTokenInfo(address, 'blacklist');
      },
    },

    blacklistValid() {
      return this.blacklistAddress
        && this.blacklistSymbol;
    },

    humanReward() {
      return this.humanValue(this.blockchain.reward, this.blockchain.rewardDecimals);
    },

    reward: {
      get() {
        return this.humanValue(this.newReward || this.blockchain.reward, this.blockchain.rewardDecimals);
      },
      set(newValue) {
        this.updateNewReward.call(this, newValue);
      },
    },
  },

  methods: {
    updateNewReward: debounce(function (value) {
      if (value.trim().length > 0) {
        this.newReward = this.machineValue(value, this.blockchain.rewardDecimals);
      }
    }, '500ms'),

    async fetchTokenInfo(address, prop) {
      if (!this.isAddress(address)) {
        return;
      }
      
      const { Marketplace, [GENERIC_TOKEN]: Token } = this.blockchain;

      const marketplace = await Marketplace.deployed();
      const token = await Token.at(address);

      try {
        const [ symbol, status ] = await Promise.all([
          token.symbol.call(),
          prop == 'blacklist' ? marketplace.isTokenBlacklisted.call(token.address) : Promise.resolve(false),
        ]);

        this[`${ prop }Symbol`] = symbol.toString();

        if (prop == 'blacklist') {
          this[`${ prop }Status`] = status;
        }
      } catch (error) {
        this.notify(`Unable to fetch token info at "${ address }": ${ error.message }`);
      }
    },

    async freeze({ value }) {
      if (this.working) {
        return;
      }

      const state = !value;
      this.working = true;
      
      const { Marketplace } = this.blockchain;
      const marketplace = await Marketplace.deployed();

      try {
        await marketplace.freeze(state, { from: this.wallet });

        this.notify(`Market activity ${ state ? '' : 'un-' }paused`);
        this.working = false;
      } catch (error) {
        this.working = false;
        this.notify(`Unable to ${ state ? '' : 'un-' }pause marketplace activity: ${ error.message }`);
      }
    },

    async updateReward() {
      if (this.working) {
        return;
      }

      this.working = true;
      
      const { Marketplace } = this.blockchain;
      const marketplace = await Marketplace.deployed();

      try {
        const rewardToken = await marketplace.token.call();
        await marketplace.updateReward(rewardToken, this.newReward, { from: this.wallet });

        this.notify(`Order reward updated to: ${ this.reward }`);
        this.working = false;
      } catch (error) {
        this.working = false;
        this.notify(`Unable to update reward amount: ${ error.message }`);
      }
    },

    async blacklist(state) {
      if (!this.blacklistValid || this.working) {
        return;
      }

      this.working = true;
      
      const { Marketplace } = this.blockchain;
      const marketplace = await Marketplace.deployed();

      try {
        await marketplace.blacklistToken(this.blacklistAddress, state, { from: this.wallet });

        this.notify(`Token "${ this.blacklistSymbol }" ${ state || 'un-' }blacklisted`);
        this.working = false;
        this.blacklistAddress = '';
        this.blacklistStatus = false;
        this.blacklistSymbol = '';
      } catch (error) {
        this.working = false;
        this.notify(`Unable to ${ state || 'un-' }blacklisted token "${ this.blacklistSymbol }": ${ error.message }`);
      }
    },

    ...mapActions(['addBlockchainHandler', 'updateBlockchain']),
  },
};
</script>

<style>
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

.c-col-wrapper > label.vue-js-switch {
  margin-top: 0.7em;
}

.c-col-wrapper > div.token-details {
  color: #5D354D;
  font-size: 1.2em;
  margin-top: 0.5em;
}

.c-col-wrapper > div.token-blacklisted {
  color: #5D354D;
  font-size: 1.2em;
  margin-top: 0.3em;
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
