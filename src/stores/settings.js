import { defineStore } from 'pinia';

/**
 * Store de configuración
 * - Sonido activado/desactivado
 * - Modo oscuro (persistencia en localStorage)
 * - Mostrar/ocultar columna de participio
 */

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    soundEnabled: localStorage.getItem('soundEnabled') === 'true',
    darkMode: localStorage.getItem('darkMode') === 'true',
    showParticiple: false,
  }),
  actions: {
    // Aplicar el tema guardado al cargar la app (evita FOUC)
    initTheme() {
      document.body.classList.toggle('dark-mode', this.darkMode);
    },
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('soundEnabled', this.soundEnabled);
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('darkMode', this.darkMode);
      document.body.classList.toggle('dark-mode', this.darkMode);
    },
    toggleParticiple() {
      this.showParticiple = !this.showParticiple;
    },
  },
});