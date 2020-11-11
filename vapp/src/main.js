import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import Jazzicon from 'vue-jazzicon'
import cyberpunk from 'cyberpunk-vue'
import { Message } from 'cyberpunk-vue'
import VueClipboard from 'vue-clipboard2'
import Blockchain from './services/blockchain'

import 'cyberpunk-vue/lib/cyberpunk-vue.css'
import 'augmented-ui/augmented-ui.min.css'

import App from './App.vue'

import defaultState from './default-state'
import { SYNC_BLOCKCHAIN, RESET, SETUP } from './states'
import Market from './components/Market.vue'
import About from './components/About.vue'
import Stats from './components/Stats.vue'

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(cyberpunk)
Vue.use(VueClipboard)
Vue.component(Jazzicon.name, Jazzicon)
Message.install(Vue) // o_O oh that chinese guys...

const blockchain = new Blockchain();
const store = new Vuex.Store({
  state: defaultState,
  getters: {
    isTestnet: state => state.network != "1",
    isOnline: state => !!(state.web3 && state.wallet && state.network),
    web3: state => state.web3,
    network: state => state.network,
    wallet: state => state.wallet,
    walletShort: state => `${state.wallet.substr(0, 10)}...${state.wallet.substr(-10)}`,
    blockchain: state => state.blockchain,
  },
  actions: {
    reset (store) {
      store.commit(RESET);
    },
    setup (store, blockchainContext) {
      const { web3, wallet } = blockchainContext;
      store.commit(SETUP, blockchainContext);

      if (web3 && wallet) {
        blockchain.reconfigure({ web3, wallet }, blockchainFlatState => {
          store.commit(SYNC_BLOCKCHAIN, blockchainFlatState);
        });
      } else if (wallet) {
        blockchain.updateAccount(wallet);
      }
    },
  },
  mutations: {
    [SYNC_BLOCKCHAIN]: (state, blockchainFlatState) => {
      state.blockchain = blockchainFlatState;
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

const router = new VueRouter({
  routes: [
    { path: '/', name: 'market', component: Market },
    { path: '/about', name: 'about', component: About },
    { path: '/stats', name: 'stats', component: Stats }
  ],
})

Vue.config.productionTip = false

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
