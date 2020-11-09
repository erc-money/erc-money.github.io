import Vue from 'vue'
import Vuex from 'vuex'
import Jazzicon from 'vue-jazzicon'
import cyberpunk from 'cyberpunk-vue'
import { Message } from 'cyberpunk-vue'
import VueClipboard from 'vue-clipboard2'

import 'cyberpunk-vue/lib/cyberpunk-vue.css'
import 'augmented-ui/augmented-ui.min.css'

import App from './App.vue'

Vue.component(Jazzicon.name, Jazzicon)
Vue.use(Vuex)
Vue.use(cyberpunk)
Vue.use(VueClipboard)
Message.install(Vue) // o_O oh that chinese guys...

const store = new Vuex.Store({
  state: {},
  getters: {
    isTestnet: state => state.network != "1",
    isOnline: state => !!(state.web3 && state.wallet && state.network),
    web3: state => state.web3,
    network: state => state.network,
    wallet: state => state.wallet,
    walletShort: state => `${state.wallet.substr(0, 10)}...${state.wallet.substr(-10)}`,
  },
  mutations: {
    reset(state) {
      state.web3 = null;
      state.network = null;
      state.wallet = null;
    },
    setup(state, { web3, network, wallet }) {
      state.web3 = web3 || state.web3;
      state.network = network || state.network;
      state.wallet = wallet || state.wallet;
    },
  },
})

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
