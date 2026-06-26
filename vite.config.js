import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Inyectar CSS de los componentes directamente en el JS
    // para eliminar el archivo /assets/index-*.css bloqueante
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Un solo chunk para evitar cadenas de solicitudes
        manualChunks: undefined,
      },
    },
  },
});
