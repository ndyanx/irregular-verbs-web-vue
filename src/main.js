import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/router";
import "./assets/styles.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Montar inmediatamente — no esperar al router
// El router-view maneja internamente la transición de rutas
app.mount("#app");
