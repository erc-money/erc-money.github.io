<template>
  <Box>
    <template v-slot:title>Market</template>
    <template v-slot:content>
      ...
    </template>
  </Box>
</template>

<script>
import Box from './generic/Box.vue'

export default {
  name: "Main",

  components: {
    Box,
  },
};
</script>

<style>
</style>
