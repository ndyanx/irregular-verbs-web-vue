import { defineStore } from 'pinia';

export const useAudioStore = defineStore('audio', {
  state: () => ({
    audioCache: new Map(),
    currentAccent: 'us',
  }),

  actions: {
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

    async fetchWordData(word) {
      word = word.toLowerCase().trim();
      // const apiUrl = `http://localhost:3001/api/word/${encodeURIComponent(word)}`;
      const apiUrl = `https://irregular-verbs-web-express.onrender.com/api/word/${encodeURIComponent(word)}`;

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
        console.log(accent)
        const audioUrl = data?.pronunciations?.[accent]?.audioUrl;
        console.log(audioUrl)
        if (!audioUrl) throw new Error(`No audio URL found for accent "${accent}".`);

        const audio = new Audio(audioUrl);
        return new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => {
            this.audioCache.set(cacheKey, audio);
            audio.play().then(resolve).catch(reject);
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
