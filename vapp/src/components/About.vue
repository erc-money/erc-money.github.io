<template>
  <Box>
    <template v-slot:title>About</template>
    <template v-slot:content>
      <p>
        <a href="http://erc.money">Erc.money</a> is an <span class="highlight">unregulated</span> and <span class="highlight">fee-less</span>
        platform that empowers the exchange between ERC20 tokens holders <i>(ERC2 to ERC20)</i>
        with <span class="highlight">no liquidity needed</span>.
        <br/>
        Simply <span class="highlight">exchange your tokens</span>, have fun and <span class="highlight">receive <b>iEMT</b> reward tokens</span> for completed orders.
      </p>
      <p>
        Nowadays the crypto space is overpopulated with lots of CeFi and DeFi exchanges.
        <br/>
        DeFi is indeed better, however it shares the same complain- it needs liquidity to function!
        <br/>
        That said, <a href="http://erc.money">erc.money</a> is not a trading platform, rather one to explore and unlock the value of
        a vague amount of assets which might have value for you ;)
      </p>
      <p>
        We are <a href="https://github.com/erc-money">Open-Source</a> and are not charging fees, thus we definetly count on your <c-button icon="dollar" v-on:click="donate()">Support</c-button>.
        Remember that helping is not always about money!
      </p>
    </template>
  </Box>
</template>

<script>
import mixins from '../mixins'

import Box from './generic/Box.vue'

export default {
  mixins,
  name: "About",

  components: {
    Box,
  },
};
</script>

<style>
p {
  margin: 20px;
  line-height: 1.4em;
}

.highlight {
  background-color: rgba(248, 218, 0, 0.3);
  color: #5D354D;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 1.1em;
  border-radius: 50%;
  padding: 5px;
  white-space: nowrap;
}
</style>
