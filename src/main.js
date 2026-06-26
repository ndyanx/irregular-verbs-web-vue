import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/router";
// styles.css está inlineado en index.html — no importar aquí
// para evitar que Vite lo incluya en el bundle CSS bloqueante

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Montar inmediatamente sin esperar router.isReady()
app.mount("#app");
