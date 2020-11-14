<template>
  <Box>
    <template v-slot:title>About</template>
    <template v-slot:content>
      <p>
        <Tag>Erc.money</Tag>
        is an
        <Tag>unregulated</Tag>
        and
        <Tag>feeless</Tag>
        token
        <Tag>marketplace</Tag>
        supporting any ERC20 token with no need for any liquidity pool.
      </p>
      <p>
        <Tag>Exchange any ERC20</Tag>
        pair and
        <Tag>receive reward tokens</Tag>
        for you and the order issuer.
      </p>
      <p>
        Nowadays the crypto space is overpopulated with lots of CeFi and DeFi exchanges.
        DeFi is indeed better, however it shares the same issue - it needs liquidity to function!
        
        <br/>
        
        That said, <a href="http://erc.money">erc.money</a> is not a trading platform,
        rather one to explore a vague amount of assets which might have value specifically for you ;)
      </p>
      <p>
        We are
        <a href="https://github.com/erc-money">Open-Source</a>
        and are not charging any fees, thus we definetly count on your
        <c-button icon="dollar" v-on:click="donate()">Support</c-button>, but remember - helping is not always about the money!
      </p>
    </template>
  </Box>
</template>

<script>
import mixins from '../mixins'

import Box from './generic/Box.vue'
import Tag from './generic/Tag.vue'

export default {
  mixins,
  name: "About",

  components: {
    Box,
    Tag,
  },
};
</script>

<style>
p {
  margin: 20px;
  line-height: 1.4em;
}
</style>
