<template>
  <div id="footer">
    <a href="mailto:info@erc.money">
      <c-button icon="email-fill" v-on:click="nothing()">Contact Us</c-button>
    </a>

    <c-button icon="dollar" v-on:click="donate()">Donate ETH</c-button>

    <a href="https://github.com/erc-money" target="_blank">
      <c-button icon="code" v-on:click="nothing()">Github</c-button>
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
</style>
