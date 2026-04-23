<template>
  <div class="layout">
    <nav class="navbar" v-if="!$route.meta.hideNavbar">
      <header>
        <router-link to="/"> <img src="/images/MirrorIDE_text.png" alt="MirrorIDE" class="logo"> </router-link>
      </header>
      <div class="nav-links">
        <router-link class="nav-btn" to="/">Join</router-link>
        <router-link class="nav-btn" to="/create">Create Room</router-link>
        <router-link class="nav-btn" to="/offline">Offline</router-link>
      </div>
    </nav>
    <main class="main">
      <router-view/>
    </main>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: white;
}
* {
  box-sizing: border-box;
}
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  color: white;
  background: radial-gradient(circle at 50% 15%, #1a1a1a 0%, #0b0b0b 55%, #050505 100%);
}
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}
.logo {
  height: 50px;
  width: auto;
  display: block;
}
.navbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 12px 40px;
  border-bottom: 1px solid #333;
  width: 100%;
}
nav {
  padding: 0;
}
nav a {
  font-weight: bold; color: white;
}
nav a.router-link-exact-active {
  color: #42b983;
}
.nav-links {
  justify-self: center;
  display: flex;
  gap: 16px;
}
.nav-btn {
  padding: 7px 12px;
  cursor: pointer;
  color: white;
  text-decoration: none;
  border: 1px solid #333;
  background: rgba(255, 255, 255, 0.02);
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.05s ease;
}
.nav-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: #444;
}
.nav-btn:active {
  transform: translateY(1px);
}
.main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 24px;
}
</style>

<script setup lang="ts">

</script>