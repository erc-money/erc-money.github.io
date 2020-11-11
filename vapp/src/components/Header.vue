<template>
  <c-row class="grid">
    <c-col span="8">
      <c-row class="grid">
        <c-col span="4">
          <div id="logo" class="color-hl-bg">
            <a href="/">
              <img src="../assets/images/logo.jpg" alt="erc.money"/>
            </a>
          </div>
        </c-col>
        <c-col span="16">
          <div id="logo-text" class="glitch color-hl" data-text="no fees <Ξ/> no regulation no bullshit">
            no fees<br/>
            no regulation<br/>
            no bullshit
          </div>
        </c-col>
      </c-row>
    </c-col>
    <c-col span="16" class="controls">
      <c-button-group>
        <router-link to="/" v-slot="{ href, navigate }">
          <c-button icon="tradingdata" :class="[$route.name == 'market' && 'active-route']" @click="navigate(href)">Market</c-button>
        </router-link>

        <router-link to="/stats" v-slot="{ href, navigate }">
          <c-button icon="tradingvolume" :class="[$route.name == 'stats' && 'active-route']" @click="navigate(href)">Stats</c-button>
        </router-link>

        <router-link to="/about" v-slot="{ href, navigate }">
          <c-button icon="help" :class="[$route.name == 'about' && 'active-route']" @click="navigate(href)">About</c-button>
        </router-link>
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

@media screen and (max-width: 1200px) {
  #logo-text {
    display: none;
  }
}
</style>
