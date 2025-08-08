import { defineStore } from 'pinia';

/**
 * Store de audio
 * - Reproduce pronunciaciones usando un API externo con caché en memoria
 * - Hace fallback a SpeechSynthesis si no hay audio disponible
 * - Gestiona acentos (us, uk, etc.) y cola de reproducción para formas compuestas
 */

export const useAudioStore = defineStore('audio', {
  state: () => ({
    audioCache: new Map(),
    currentAccent: 'us',
  }),

  actions: {
    /**
     * Reproduce una o varias formas separadas por '/'
     * Intenta audio por API; si falla, usa SpeechSynthesis
     */
    async playWord(text, lang = 'en-US', accent = this.currentAccent) {
      if (!text) return;

      this.currentAccent = accent;

      const parts = text
        .replace('*', '')
        .split('/')
        .map(part => part.trim())
        .filter(part => part);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        try {
          await this.playApiAudio(part, accent);
        } catch (error) {
          console.warn(`No audio found for "${part}". Using speech synthesis.`, error);
          this.fallbackToSpeechSynthesis(part, lang);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (i < parts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    },

    /**
     * Obtiene datos de pronunciación/definiciones desde el backend
     */
    async fetchWordData(word) {
      word = word.toLowerCase().trim();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://irregular-verbs-web-express.onrender.com';
      const apiUrl = `${baseUrl}/api/word/${encodeURIComponent(word)}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Word not found in the dictionary.');

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('[fetchWordData ERROR]', error.message);
        throw new Error('Unable to fetch word data. Please try another word.');
      }
    },

    /**
     * Intenta reproducir audio descargándolo y cacheándolo por palabra+acento
     */
    async playApiAudio(word, accent = this.currentAccent) {
      word = word.toLowerCase().trim();
      const cacheKey = `${word}-${accent}`;

      if (this.audioCache.has(cacheKey)) {
        const audio = this.audioCache.get(cacheKey);
        audio.currentTime = 0;
        await audio.play();
        return;
      }

      try {
        const data = await this.fetchWordData(word);
        const audioUrl = data?.pronunciations?.[accent]?.audioUrl;
        if (!audioUrl) throw new Error(`No audio URL found for accent "${accent}".`);

        const audio = new Audio(audioUrl);
        return new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            this.audioCache.set(cacheKey, audio);
            audio.play().then(resolve).catch((err) => {
              console.warn('Audio play failed, falling back to speech synthesis.', err);
              reject(err);
            });
          });
          audio.addEventListener('error', () =>
            reject(new Error('Failed to load audio from URL.'))
          );
          audio.load();
        });
      } catch (error) {
        console.error('[playApiAudio ERROR]', error.message);
        throw error;
      }
    },

    /**
     * Reproducción alternativa con la API Web Speech
     */
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
