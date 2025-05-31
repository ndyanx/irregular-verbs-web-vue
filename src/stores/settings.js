import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    soundEnabled: localStorage.getItem('soundEnabled') === 'true',
    darkMode: localStorage.getItem('darkMode') === 'true',
    showParticiple: false,
  }),
  actions: {
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