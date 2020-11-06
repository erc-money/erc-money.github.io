<template>
  <c-layout>
    <!-- HEADER -->
    <c-header height="50">Header</c-header>

    <!-- CONNECTED MAIN -->
    <c-layout v-if="isOnline">
      <c-main>
        WALLET: {{ $store.state.wallet }}
      </c-main>
    </c-layout>

    <!-- ERROR MAIN -->
    <c-layout v-else>
      <c-main>
        <vue-metamask 
          userMessage="Blurp! Blurp! Blurp! Authorizing awesomeness..." 
          @onComplete="metamask"
        >
        </vue-metamask>

        <div v-if="error" id="error-block">
          <h1>{{ error }}</h1>
          <div ref="metamask" id="fox"></div>
        </div>

        <div v-else>
          <Loading/>
        </div>
      </c-main>
    </c-layout>

    <!-- FOOTER -->
    <c-footer height="50">Footer</c-footer>
  </c-layout>
</template>

<script>
import VueMetamask from 'vue-metamask'
import { mapGetters, mapMutations } from 'vuex'
import ModelViewer from '@metamask/logo'

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
        return this.fail('No account choosen in Metamask. Please select one.');
      }

      if (!["1", "4", "5777"].includes(netID)) {
        return this.fail(`Disallowed nework ID "${netID}", please connect to Mainnet or Rinkeby`);
      }

      if (!['MAINNET', 'RINKEBY'].includes(type)) {
        return this.fail(message);
      }

      this.setup({ web3, network: netID, wallet: metaMaskAddress });

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length <= 0) {
          this.reset();
          return this.fail('Please choose an account in Metamask');
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

    fail(msg) {
      this.error = msg;
      this.$nextTick(() => { // render error
        this.fox();
      });
    },

    fox() {
      this.$refs.metamask.innerHTML = "";

      // initializing and appending the MetaMask Logo to its Div
      const metaMaskViewer = ModelViewer({
        pxNotRatio: false,
        width: 0.5,
        height: 0.5,
        followMouse: true,
        slowDrift: false,
      });

      this.$refs.metamask.appendChild(metaMaskViewer.container);

      metaMaskViewer.lookAt({
        x: 100,
        y: 100,
      });
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

#error-block {
  width: 100%;
  text-align: center;
  color: red;
}

#fox {
  margin: 50px;
}

footer,
header,
main,
aside {
  padding: 10px;
}

footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
}
</style>
