import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router/router';
import './assets/styles.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Esperar a que el router esté listo para mostrar el contenido
router.isReady().then(() => {
  document.body.classList.add('theme-loaded');
  app.mount('#app');
});