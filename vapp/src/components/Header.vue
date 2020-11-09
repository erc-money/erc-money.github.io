<template>
  <c-row class="grid">
    <c-col span="8">
      <c-row class="grid">
        <c-col span="4">
          <div id="logo" class="color-hl-bg">
            <a href="/">
              <img src="../assets/images/logo.jpg" alt="erc.money"/>
            </a>
          </div>
        </c-col>
        <c-col span="16">
          <div id="logo-text" class="glitch color-hl" data-text="no fees <Ξ/> no regulation no bullshit">
            no fees<br/>
            no regulation<br/>
            no bullshit
          </div>
        </c-col>
      </c-row>
    </c-col>
    <c-col span="4"><div class="grid-content bg-color-light"></div></c-col>
    <c-col span="4"><div class="grid-content bg-color"></div></c-col>
    <c-col span="4"><div class="grid-content bg-color-light"></div></c-col>
  </c-row>
</template>

<script>
import mixins from '../mixins'

export default {
  mixins,
  name: "Header",
};
</script>

<style>
@import "../assets/styles/glitch.css";

#logo {
  width: 50px;
  height: 50px;
  overflow: hidden;
  border-radius: 50%;
  padding: 5px;
}

#logo > a {
  text-decoration: none;
}

#logo > a > img {
  width: 100%;
}

#logo-text {
  font-weight: lighter;
  filter: drop-shadow(0 0 1px #F8DA00);
}

@media screen and (max-width: 1200px) {
  #logo-text {
    display: none;
  }
}
</style>
