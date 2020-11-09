<template>
  <div
    class="cybox"
    :style="'width:' + (width || '100%') + ';height:' + (height || 'auto')"
  >
    <div class="cybox-wrapper" data-augmented-ui="exe tl-clip br-clip">
      <div class="cybox-title color-main color-hl-bg" data-augmented-ui="exe tl-clip br-clip">
        <slot name="title"></slot>
      </div>
      <div class="cybox-content">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "cybox",

  props: {
    width: String, // default: 640px
    height: String // default: auto
  }
};
</script>

<style>
.cybox {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.cybox > .cybox-wrapper {
  background-color:rgba(248, 218, 0, 0.7);
  --aug-border: 2px;
  --aug-border-bg: #F8DA00;
  width: calc(100% - 20px);
  margin: 0 auto;
  overflow: hidden;
}

.cybox > .cybox-wrapper > .cybox-title {
  display: inline-block;
  padding: 0.5em 2em;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
  --aug-inset: 0.25em;
  --aug-inset-bg: #F8DA00;
  --aug-br: 0.75em;
}

.cybox > .cybox-wrapper  > .cybox-content {
  padding: 0.5em 1em;
}
</style>
