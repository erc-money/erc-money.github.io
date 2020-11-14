<template>
  <c-row class="grid">
    <c-col
      xs="0"
      sm="0"
      md="0"
      lg="8"
      xl="8"
      xxl="8" id="logo-container">
      <c-row class="grid">
        <c-col span="4">
          <div id="logo" class="color-hl-bg">
            <a href="/">
              <img src="../assets/images/logo.jpg" alt="erc.money"/>
            </a>
          </div>
        </c-col>
        <c-col span="1"></c-col>
        <c-col span="19">
          <div id="logo-text" class="glitch color-hl" data-text="no fees <Ξ/> no regulation no bullshit">
            no fees<br/>
            no regulation<br/>
            no bullshit
          </div>
        </c-col>
      </c-row>
    </c-col>
    <c-col
      xs="24"
      sm="24"
      md="24"
      lg="16"
      xl="16"
      xxl="16"
      class="controls">
      <c-button-group>
        <router-link to="/" v-slot="{ href, navigate }">
          <c-button icon="tradingdata" :class="[$route.name == 'market' && 'active-route']" @click="navigate(href)">
            <span class="buttons-long-desc">Market</span>
          </c-button>
        </router-link>

        <router-link to="/stats" v-slot="{ href, navigate }">
          <c-button icon="tradingvolume" :class="[$route.name == 'stats' && 'active-route']" @click="navigate(href)">
            <span class="buttons-long-desc">Statistics</span>
          </c-button>
        </router-link>

        <router-link to="/about" v-slot="{ href, navigate }">
          <c-button icon="help" :class="[$route.name == 'about' && 'active-route']" @click="navigate(href)">
            <span class="buttons-long-desc">About</span>
          </c-button>
        </router-link>
      </c-button-group>

      <c-button-group id="network" v-if="isOnline" :class="isTestnet ? 'testnet' : 'mainnet'">
        <c-button :icon="isTestnet ? 'warning' : 'trust'" disabled>
          {{ isTestnet ? 'TESTNET' : 'MAINNET' }}
        </c-button>
      </c-button-group>
    </c-col>
  </c-row>
</template>

<script>
import mixins from '../mixins'

export default {
  mixins,
  name: "Header",
};
</script>

<style>
@import "../assets/styles/glitch.css";

.active-route {
  background-color: #22edfc !important;
}

#logo {
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 50%;
  padding: 5px;
}

#logo > a {
  text-decoration: none;
}

#logo > a > img {
  width: 100%;
}

#logo-text {
  font-weight: lighter;
  filter: drop-shadow(0 0 1px #F8DA00);
}

#network {
  margin-left: 10px;
}

#network > button {
  background: none;
  cursor: default;
}

#network > button > span {
  color: greenyellow;
  font-weight: bolder;
  margin-right: 5px;
}

#network > button > .c-button-icon {
  font-size: 1.3em;
  margin-top: -0.2em;
}

#network.testnet > button > .c-button-content {
  transform: scale(1);
	animation: pulse-red 2s infinite;
  box-shadow: 0 0 0 0 rgba(255, 0, 0, 1);
}

#network.mainnet > button > .c-button-content {
  transform: scale(1);
	animation: pulse-green 2s infinite;
  box-shadow: 0 0 0 0 rgba(173, 255, 47, 1);
}

@keyframes pulse-red {
	0% {
		/* transform: scale(0.95); */
		box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
	}

	70% {
		/* transform: scale(1); */
		box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
	}

	100% {
		/* transform: scale(0.95); */
		box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
	}
}

@keyframes pulse-green {
	0% {
		/* transform: scale(0.95); */
		box-shadow: 0 0 0 0 rgba(173, 255, 47, 0.7);
	}

	70% {
		/* transform: scale(1); */
		box-shadow: 0 0 0 10px rgba(173, 255, 47, 0);
	}

	100% {
		/* transform: scale(0.95); */
		box-shadow: 0 0 0 0 rgba(173, 255, 47, 0);
	}
}

#network.testnet > button > .c-button-icon {
  color: red;
}

#network.mainnet > button > .c-button-icon {
  color: greenyellow;
}

.controls {
  justify-content: flex-end;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -ms-flex-align: center;
  -webkit-align-items: center;
  -webkit-box-align: center;
  align-items: center;
  padding-right: 10px !important;
}

@media screen and (max-width: 333px) {
  #network {
    display: none;
  }
}

/* "lg" row */
@media screen and (max-width: 993px) {
  #logo-container,
  #logo-text {
    display: none;
  }

  .controls {
    text-align: center;
    padding-right: none;
    justify-content: center;
  }
}

@media screen and (max-width: 550px) {
  .buttons-long-desc {
    display: none;
  }
}
</style>
