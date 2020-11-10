<template>
  <div
    :class="'cybox' + (noAnimate ? '' : ' animated lightSpeedIn')"
    :style="'width:' + (width || '100%') + ';height:' + (height || 'auto') + ';display:' + (hidden ? 'none' : 'block')"
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
    noAnimate: Boolean, // don't animate (default: false)
    hidden: Boolean, // hide the box (default: false)
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

/*base code*/
.animated {
  -webkit-animation-duration: 0.5s;
  animation-duration: 0.5s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}
.animated.infinite {
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
}
.animated.hinge {
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
}
/*the animation definition*/
@-webkit-keyframes lightSpeedIn {
  0% {
    -webkit-transform: translate3d(100%, 0, 0) skewX(-30deg);
    transform: translate3d(100%, 0, 0) skewX(-30deg);
    opacity: 0;
  }
  60% {
    -webkit-transform: skewX(20deg);
    transform: skewX(20deg);
    opacity: 1;
  }
  80% {
    -webkit-transform: skewX(-5deg);
    transform: skewX(-5deg);
    opacity: 1;
  }
  100% {
    -webkit-transform: none;
    transform: none;
    opacity: 1;
  }
}
@keyframes lightSpeedIn {
  0% {
    -webkit-transform: translate3d(100%, 0, 0) skewX(-30deg);
    -ms-transform: translate3d(100%, 0, 0) skewX(-30deg);
    transform: translate3d(100%, 0, 0) skewX(-30deg);
    opacity: 0;
  }
  60% {
    -webkit-transform: skewX(20deg);
    -ms-transform: skewX(20deg);
    transform: skewX(20deg);
    opacity: 1;
  }
  80% {
    -webkit-transform: skewX(-5deg);
    -ms-transform: skewX(-5deg);
    transform: skewX(-5deg);
    opacity: 1;
  }
  100% {
    -webkit-transform: none;
    -ms-transform: none;
    transform: none;
    opacity: 1;
  }
}
.lightSpeedIn {
  -webkit-animation-name: lightSpeedIn;
  animation-name: lightSpeedIn;
  -webkit-animation-timing-function: ease-out;
  animation-timing-function: ease-out;
}
</style>
