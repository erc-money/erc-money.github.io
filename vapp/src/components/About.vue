<template>
  <Box>
    <template v-slot:title>About</template>
    <template v-slot:content>
      ...
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
</style>
