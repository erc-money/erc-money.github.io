<template>
  <c-layout>
    <!-- HEADER -->
    <c-header height="50">Header</c-header>

    <!-- CONNECTED MAIN -->
    <c-layout v-if="isOnline">
      <c-aside width="200">
        WALLET: {{ $store.state.wallet }}
      </c-aside>
      <c-main>Main</c-main>
    </c-layout>

    <!-- ERROR MAIN -->
    <c-layout v-else>
      <vue-metamask 
          userMessage="Blurp! Blurp! Blurp! Authorizing awesomeness..." 
          @onComplete="metamask"
      >
      </vue-metamask>

      <div v-if="error">
        <h1>{{ error }}</h1>    
      </div>

      <div v-else>
        <Loading/>
      </div>
    </c-layout>

    <!-- FOOTER -->
    <c-footer height="50">Footer</c-footer>
  </c-layout>
</template>

<script>
import VueMetamask from 'vue-metamask'
import { mapGetters, mapMutations } from 'vuex'

import Loading from './components/Loading.vue'

export default {
  name: 'app',
  components: {
    Loading,
    VueMetamask,
  },

  data: function() {
    return {
      error: null,
      isOnline: false,
    }
  },

  computed: {
    ...mapGetters(['isTestnet']),
  },

  methods: {
    // @ref https://www.npmjs.com/package/vue-metamask#oncomplete-return-data
    metamask({ web3, metaMaskAddress, type, netID, message }) {
      this.reset();

      if (!metaMaskAddress) {
        this.error = 'No account choosen in Metamask. Please select one.';
        return;
      }

      if (!["1", "4", "5777"].includes(netID)) {
        this.error = `Disallowed nework ID "${netID}", please connect to Mainnet or Rinkeby`;
        return;
      }

      if (!['MAINNET', 'RINKEBY'].includes(type)) {
        this.error = message;
        return;
      }

      this.setup({ web3, network: netID, wallet: metaMaskAddress });

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length <= 0) {
          this.reset();
          this.error = 'Please choose an account in Metamask';
          return;
        }

        this.setup({ wallet: accounts[0] });
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    },

    reset() {
      this.isOnline = false;
      this.error = null;
      this._reset();
    },

    setup(...args) {
      this._setup(...args);
      this.isOnline = this.$store.getters.isOnline;
    },

    ...mapMutations({ _reset: 'reset', _setup: 'setup' }),
  },
}
</script>

<style>
@import "./assets/styles/reset.min.css";
@import "./assets/styles/fonts.css";

body {
  overflow: hidden;
  background-image: url('./assets/images/background.png');
  font-family: Audiowide;
  color: #FCDA06;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

header,
footer,
main,
aside {
  font-size: 16px;
  font-weight: bold;
  color: #2E2E32;
}
header,
footer {
  background-color: #99a9bf;
  line-height: 50px;
  text-align: center;
}

main,
aside {
  background-color: #d3dce6;
  line-height: 70px;
  text-align: center;
}

aside {
  background-color: #80889c;
}
</style>
