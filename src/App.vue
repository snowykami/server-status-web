<script setup lang="ts">
// import Nav from './components/Nav.vue'
console.log('App.vue')
const year = new Date().getFullYear()
</script>

<template>
  <h1 style="text-align: center">Server Status</h1>
  <router-view/>
  <footer>
    © Copyright 2024-{{year}} <a href="https://sfkm.me" target="_blank">snowykami</a> All Rights Reserved
  </footer>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
footer {
  text-align: center;
  padding: 1em;
  color: #666;
}
</style>
