<template>
  <div id="app" class="min-h-screen">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Mantemos apenas ajustes mínimos, o resto virá do Tailwind */
:root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* Estilos para links do router */
.router-link-active {
  text-decoration: none;
}
</style>
