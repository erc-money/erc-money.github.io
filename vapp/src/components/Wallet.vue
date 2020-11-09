<template>
  <Box :width="'inherit'">
    <template v-slot:title>Wallet</template>
    <template v-slot:content>
      <div id="wallet">
        <Jazzicon :address="$store.state.wallet" :diameter="50" />
        {{ $store.state.wallet }}
      </div>
    </template>
  </Box>
</template>

<script>
import { mapGetters } from 'vuex'

import Box from './generic/Box.vue'

export default {
  name: "Wallet",

  components: {
    Box,
  },

  computed: {
    ...mapGetters(['isTestnet']),
  },
};
</script>

<style>

</style>
