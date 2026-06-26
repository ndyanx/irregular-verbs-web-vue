import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/router";

// Fuentes servidas localmente desde Cloudflare — sin petición a Google Fonts
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import "@fontsource/sora/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

// CSS globales centralizados aquí para que Vite los fusione en un solo bundle
// styles.css está además inlineado en index.html para la primera pintura
import "./assets/styles.css";
import "./assets/game-modal.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount("#app");
