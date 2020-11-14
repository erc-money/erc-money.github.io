<template>
  <div id="footer">
    <a href="mailto:info@erc.money">
      <c-button icon="email-fill" v-on:click="nothing()">
        <span class="buttons-long-desc">Contact Us</span>
      </c-button>
    </a>

    <c-button icon="dollar" v-on:click="donate()">
      Donate <span class="buttons-long-desc">ETH</span>
    </c-button>

    <a href="https://github.com/erc-money" target="_blank">
      <c-button icon="code" v-on:click="nothing()">
        <span class="buttons-long-desc">Github</span>
      </c-button>
    </a>
  </div>
</template>

<script>
import mixins from '../mixins'

export default {
  mixins,
  name: "Footer",
};
</script>

<style>
#footer > a {
  margin: 10px;
}

/* "lg" row */
@media screen and (max-width: 993px) {
  .buttons-long-desc {
    display: none;
  }
}
</style>
