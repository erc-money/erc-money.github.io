import Vue from 'vue'
import Vuex from 'vuex'
import cyberpunk from 'cyberpunk-vue'
import 'cyberpunk-vue/lib/cyberpunk-vue.css'

import App from './App.vue'

Vue.use(Vuex)
Vue.use(cyberpunk)

const store = new Vuex.Store({
  state: {},
  getters: {
    isTestnet: state => state.network != "1",
    isOnline: state => !!(state.web3 && state.wallet && state.network),
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
