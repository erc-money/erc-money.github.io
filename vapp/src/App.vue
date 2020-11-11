<template>
  <c-layout>
    <!-- HEADER -->
    <c-header height="50">
      <Header/>
    </c-header>

    <!-- CONNECTED MAIN -->
    <c-layout id="main-container" v-if="isOnline || $route.name == 'about'">
      <c-main>
        <c-row class="grid" gutter="10">
          <c-col v-if="isOnline"
            xs="12"
            sm="12"
            md="8"
            lg="8"
            xl="8"
            xxl="8">
            <Wallet/>
          </c-col>
          <c-col
            :xs="isOnline ? 12 : 24"
            :sm="isOnline ? 12 : 24"
            :md="isOnline ? 16 : 24"
            :lg="isOnline ? 16 : 24"
            :xl="isOnline ? 16 : 24"
            :xxl="isOnline ? 16 : 24">
            <router-view></router-view>
          </c-col>
        </c-row>
      </c-main>
    </c-layout>

    <!-- ERROR MAIN -->
    <c-layout v-else>
      <c-main>
        <vue-metamask 
          userMessage="Blurp! Blurp! Blurp! Something bad happened, please try again later..." 
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
    <c-footer height="30">
      <Footer/>
    </c-footer>
  </c-layout>
</template>

<script>
import { mapActions } from 'vuex'
import VueMetamask from 'vue-metamask'
import ModelViewer from '@metamask/logo'

import Loading from './components/Loading.vue'
import Wallet from './components/Wallet.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'app',

  components: {
    VueMetamask,
    Loading,
    Wallet,
    Header,
    Footer
  },

  data: function() {
    return {
      error: null,
      isOnline: false,
    }
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

    ...mapActions({ _reset: 'reset', _setup: 'setup' }),
  },
}
</script>

<style>
@import "./assets/styles/reset.min.css";
@import "./assets/styles/fonts.css";

body {
  overflow-x: hidden;
  background-image: url('./assets/images/background.png');
  font-family: Audiowide;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  text-decoration: none;
}

.color-hl {
  color: #FCDA06;
}

.color-main {
  color: #5D354D;
}

.color-hl-bg {
  background-color: #FCDA06;
}

.color-main-bg {
  background-color: #5D354D;
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

#main-container {
  margin-top: 20px;
  margin-bottom: 50px;
}

footer {
  background-color:rgba(93, 53, 77, 0.7);
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

.c-button {
  padding-top: 0.5em !important;
  font-family: Audiowide;
}

.c-button-icon {
  color: #5D354D;
}

.c-button-icon {
  color: #5D354D;
}

.c-button-content {
  color: #5D354D;
  font-family: Audiowide;
}
</style>
