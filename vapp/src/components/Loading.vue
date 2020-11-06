<template>
  <div class="loader">
    <svg class="circleFW" viewBox="0 0 1000 1000">
      <circle
        class="path"
        cx="500"
        cy="500"
        fill="none"
        r="355"
        stroke="#29B6F6"
      ></circle></svg
    ><svg
      class="circleSW"
      style="animation-duration: 1.4s"
      viewBox="0 0 1000 1000"
    >
      <circle
        class="path2"
        cx="500"
        cy="500"
        fill="none"
        r="355"
        stroke="#18FFFF"
      ></circle></svg
    ><svg class="circleFW" viewBox="0 0 1000 1000">
      <circle
        class="path3"
        cx="500"
        cy="500"
        fill="none"
        r="355"
        stroke="#18FFFF"
      ></circle></svg
    ><svg class="circleFW" viewBox="0 0 1000 1000">
      <circle
        class="path4"
        cx="500"
        cy="500"
        fill="none"
        r="255"
        stroke="#FFF"
      ></circle></svg
    ><svg class="circleFW" viewBox="0 0 1000 1000">
      <circle
        class="path5"
        cx="500"
        cy="500"
        fill="none"
        r="420"
        stroke="#18FFFF"
      ></circle></svg
    ><svg class="circleFW" viewBox="0 0 1000 1000">
      <circle
        class="path6"
        cx="500"
        cy="500"
        fill="none"
        r="420"
        stroke="#18FFFF"
      ></circle></svg
    ><svg class="circleSW" viewBox="0 0 1000 1000">
      <circle
        class="path7"
        cx="500"
        cy="500"
        fill="none"
        r="420"
        stroke="#18FFFF"
      ></circle></svg
    ><svg
      class="circleSW"
      style="animation-timing-function: ease-in-out"
      viewBox="0 0 1000 1000"
    >
      <circle
        class="path8"
        cx="500"
        cy="500"
        fill="none"
        r="420"
        stroke="#18FFFF"
      ></circle>
      <svg class="circleFW" viewBox="0 0 1000 1000"></svg>
      <circle
        class="path9"
        cx="500"
        cy="500"
        fill="none"
        r="225"
        stroke="#18FFFF"
      ></circle>
    </svg>
  </div>
</template>

<script>
export default {
  name: "Loading"
};
</script>

<style>
.loader {
  position: absolute;
  height: 200px;
  top: 50%;
  left: 0;
  right: 0;
  margin: -100px auto;
}

.circleFW,
.circleSW {
  width: 100%;
  height: 100%;
  transform-origin: center center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
}
.circleFW {
  animation: rotate 2s linear infinite;
}
.circleSW {
  animation: rotate-reverse 4s linear infinite;
}
.path,
.path2,
.path3,
.path4,
.path5,
.path6,
.path7,
.path8,
.path9 {
  stroke-linecap: square;
  stroke-width: 33;
  opacity: 0.8;
}

.path {
  stroke-dasharray: 1400, 2600;
  stroke-dashoffset: 0;
  animation: dash 3.7s ease-in-out infinite;
  opacity: 0.3;
}
.path2 {
  stroke-dasharray: 40, 2600;
  stroke-dashoffset: -500px;
}
.path3 {
  stroke-dasharray: 200, 2600;
  stroke-dashoffset: -700px;
}
.path4 {
  stroke-dasharray: 40, 2600;
  stroke-dashoffset: -2000px;
}
.path5 {
  stroke-dasharray: 100, 1600;
  stroke-dashoffset: 0;
}
.path6 {
  stroke-dasharray: 300, 2600;
  stroke-dashoffset: -1000px;
}
.path7 {
  stroke-dasharray: 40, 2600;
  stroke-dashoffset: -1200px;
}
.path8 {
  stroke-dasharray: 100, 2600;
  stroke-dashoffset: -300px;
}
.path9 {
  stroke-dashoffset: -300px;
  opacity: 0.8;
}
@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
@keyframes rotate-reverse {
  100% {
    transform: rotate(-360deg);
  }
}
@keyframes dash {
  0% {
    stroke-dasharray: 2000, 2600;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 2400, 2600;
    stroke-dashoffset: -500px;
  }
  100% {
    stroke-dasharray: 2000, 2600;
    stroke-dashoffset: 0;
  }
}
@keyframes dash2 {
  0% {
    stroke-dasharray: 100, 2600;
    stroke-dashoffset: -2000px;
  }
  50% {
    stroke-dasharray: 500, 2600;
    stroke-dashoffset: -1000px;
  }
  100% {
    stroke-dasharray: 100, 2600;
    stroke-dashoffset: -1960px;
  }
}
</style>
