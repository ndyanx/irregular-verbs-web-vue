import { defineStore } from 'pinia';

export const useAudioStore = defineStore('audio', {
  state: () => ({
    audioCache: new Map(),
    currentAccent: 'us', // Cambiamos de defaultAccent a currentAccent
  }),
  
  actions: {
    async playWord(text, lang = 'en-US', accent = this.currentAccent) {
      if (!text) return;
      
      // Actualizamos el acento actual
      this.currentAccent = accent;
      
      const parts = text.replace('*', '').split('/').map(part => part.trim()).filter(part => part);
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        try {
          await this.playApiAudio(part, accent);
        } catch (error) {
          console.log(`API audio not available for "${part}", using speechSynthesis`, error);
          this.fallbackToSpeechSynthesis(part, lang);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (i < parts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    },

    async playApiAudio(word, accent = this.currentAccent) {
      // Creamos una clave única combinando palabra y acento
      const cacheKey = `${word}-${accent}`;
      
      if (this.audioCache.has(cacheKey)) {
        const audio = this.audioCache.get(cacheKey);
        audio.currentTime = 0;
        await audio.play();
        return;
      }

      const apiUrl = `https://irregular-verbs-web-express.onrender.com/api/audio/${accent}/${encodeURIComponent(word)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) throw new Error('Audio API fetch failed');

      const data = await response.json();
      if (!data.audioUrl) throw new Error('No audio URL returned');

      const audio = new Audio(data.audioUrl);
      return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          this.audioCache.set(cacheKey, audio);
          audio.play().then(resolve).catch(reject);
        });
        audio.addEventListener('error', () => {
          reject(new Error('Audio load failed'));
        });
        audio.load();
      });
    },

    fallbackToSpeechSynthesis(text, lang) {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    }
  }
});