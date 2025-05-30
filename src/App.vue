<template>
  <router-view></router-view>
</template>

<script>

export default {
  name: 'App',
}
</script>

<style>
/* Estilos globales que deben aplicarse a TODA la app */
:root {
  --primary: #6c51a6;
  --text: #2b2d42;
  --text-light: #8d99ae;
  --bg: #f8f9fa;
  --card: #ffffff;
  --border: #e9ecef;
  --success: #6c51a6;
  --danger: #f72585;
  --warning: #f8961e;
  --radius: 12px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

.dark-mode {
  --primary: #6c51a6;
  --primary-light: #6c51a6;
  --text: #f8f9fa;
  --text-light: #adb5bd;
  --bg: #121212;
  --card: #1e1e1e;
  --border: #2d2d2d;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}
</style>