import { defineStore } from 'pinia';

/**
 * Store de configuración
 * - Sonido activado/desactivado
 * - Mostrar/ocultar columna de participio
 *
 * Nota: el modo oscuro se retiró temporalmente del diseño visual.
 * Se puede reintroducir más adelante reutilizando las variables
 * --ink/--paper/--surface definidas en assets/styles.css.
 */

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    soundEnabled: localStorage.getItem('soundEnabled') === 'true',
    showParticiple: false,
  }),
  actions: {
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('soundEnabled', this.soundEnabled);
    },
    toggleParticiple() {
      this.showParticiple = !this.showParticiple;
    },
  },
});