<template>
  <span
    :class="['highlight-text', {'glitch' : glitch }]"
    :data-text="text"
    data-augmented-ui="exe tl-clip br-clip">
    <slot></slot>
  </span>
</template>

<script>
export default {
  name: "Tag",

  props: {
    glitch: Boolean,
    glitchText: String,
  },

  computed: {
    text() {
      const { text } = this.$slots.default[0] || { text: '' };
      return this.glitchText || '-_'.repeat(Math.ceil(text.length / 2));
    },
  },
};
</script>

<style>
.highlight-text {
  color: #FCDA06;
  background-color: #5D354D;
  font-weight: lighter;
  text-transform: uppercase;
  font-size: 1.1em;
  padding: 2px;
  padding-right: 10px;
  padding-left: 10px;
  white-space: nowrap;
  --aug-inset: 0.25em;
  --aug-inset-bg: #F8DA00;
  --aug-br: 0.75em;
}
</style>
