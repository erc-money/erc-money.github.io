import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import cyberpunk from 'cyberpunk-vue'
import { Message } from 'cyberpunk-vue'
import VueClipboard from 'vue-clipboard2'
import { ToggleButton } from 'vue-js-toggle-button'
import VueGtag from 'vue-gtag'
import VueMask from 'v-mask'

import 'cyberpunk-vue/lib/cyberpunk-vue.css'
// @todo It triggers an issue on css compilation, temporary included in index.html!
// import 'augmented-ui/augmented-ui.min.css'

import Blockchain from './services/blockchain'
import App from './App.vue'

import defaultState from './default-state'
import { SYNC_BLOCKCHAIN, RESET, SETUP, SET_BLOCKCHAIN_GENERIC } from './states'
import { GOOGLE_ANALYTICS_ID } from './constants'
import routes from './routes'

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(cyberpunk)
Vue.use(VueClipboard)
Vue.use(VueMask)
Vue.use(VueGtag, { config: { id: GOOGLE_ANALYTICS_ID } });
Vue.component('ToggleButton', ToggleButton)
Message.install(Vue) // o_O oh that chinese guys...

const blockchain = new Blockchain()
const router = new VueRouter({ routes })
const store = new Vuex.Store({
  state: defaultState,
  getters: {
    isTestnet: state => state.network != "1",
    isOnline: state => !!(state.web3 && state.wallet && state.network),
    web3: state => state.web3,
    network: state => state.network,
    wallet: state => state.wallet,
    blockchain: state => state.blockchain,
  },
  actions: {
    reset (store) {
      store.commit(RESET);
    },
    updateBlockchain(store, { stateKey, value }) {
      store.commit(SET_BLOCKCHAIN_GENERIC, { stateKey, value });
    },
    addTokens(_store, { tokens }) {
      blockchain.updateTokens(
        { tokens },
        /* refresh = */ false,
        /* onlyMissing = */ true
      );
    },
    addBlockchainHandler(store, { stateKey, functor, value = null }) {
      blockchain.addHandler(stateKey, functor);
      store.commit(SET_BLOCKCHAIN_GENERIC, { stateKey, value });
    },
    removeBlockchainHandler(_store, { stateKey, functor }) {
      blockchain.removeHandler(stateKey, functor);
      store.commit(SET_BLOCKCHAIN_GENERIC, { stateKey, value: undefined });
    },
    refreshBlockchainHandler(_store, { key }) {
      blockchain.refreshHandler(key);
    },
    refreshBlockchainHandlers() {
      blockchain.refreshHandlers();
    },
    setup (store, blockchainContext) {
      const { web3, wallet } = blockchainContext;
      store.commit(SETUP, blockchainContext);

      if (web3 && wallet) {
        blockchain.reconfigure({ web3, wallet }, blockchainFlatState => {
          store.commit(SYNC_BLOCKCHAIN, blockchainFlatState);
        });
      } else if (wallet) {
        blockchain.updateAccount({ wallet });
      }
    },
  },
  mutations: {
    [SET_BLOCKCHAIN_GENERIC]: (state, { stateKey, value }) => {
      if (value === undefined) {
        delete state.blockchain[stateKey];
      } else {
        state.blockchain[stateKey] = value;
      }
    },
    [SYNC_BLOCKCHAIN]: (state, blockchainFlatState) => {
      for (const key of Object.keys(blockchainFlatState)) {
        state.blockchain[key] = blockchainFlatState[key];
      }
    },
    [RESET]: (state) => {
      for (const key of Object.keys(defaultState)) {
        state[key] = defaultState[key];
      }
    },
    [SETUP]: (state, { web3, network, wallet }) => {
      state.web3 = web3 || state.web3;
      state.network = network || state.network;
      state.wallet = wallet || state.wallet;
    },
  },
})

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
