import { defineStore } from 'pinia';

/**
 * Store de audio
 * - Gestiona la reproducción de audio y caché
 * - Maneja el estado del acento actual
 * - Proporciona métodos para obtener datos de palabras
 */

export const useAudioStore = defineStore('audio', {
  state: () => ({
    audioCache: new Map(),    // Cache para elementos de audio
    wordDataCache: new Map(), // Cache para datos de palabras
    currentAccent: 'us',      // Acento actual para la pronunciación
  }),

  actions: {
    // --- Métodos Públicos ---

    /**
     * Reproduce el audio de una palabra
     * @param {string} text - Texto a pronunciar (puede contener múltiples formas separadas por '/')
     * @param {string} lang - Idioma para síntesis de voz
     * @param {string} accent - Acento a usar (ej: 'us', 'uk')
     * @returns {Promise<void>}
     */
    async playWord(text, lang = 'en-US', accent = this.currentAccent) {
      if (!text) return;
      
      this.currentAccent = accent;
      const parts = this.prepareTextParts(text);
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        try {
          await this.playSingleWord(part, accent);
        } catch (error) {
          console.warn(`No audio found for "${part}". Using speech synthesis.`, error);
          this.fallbackToSpeechSynthesis(part, lang);
        }
        
        // Pequeña pausa entre palabras compuestas
        if (i < parts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    },

    /**
     * Obtiene los datos de una palabra
     * @param {string} word - Palabra a buscar
     * @returns {Promise<Object>} - Datos de la palabra
     */
    async getWordData(word) {
      const normalizedWord = this.normalizeWord(word);
      
      // Usar caché si está disponible
      if (this.wordDataCache.has(normalizedWord)) {
        return this.wordDataCache.get(normalizedWord);
      }
      
      try {
        const data = await this.fetchWordData(normalizedWord);
        this.wordDataCache.set(normalizedWord, data);
        return data;
      } catch (error) {
        console.error('Error getting word data:', error);
        return null;
      }
    },

    /**
     * Método de conveniencia que reproduce y obtiene datos
     * Útil cuando necesitas ambas operaciones
     * @param {string} text - Texto a procesar
     * @param {string} lang - Idioma para síntesis de voz
     * @param {string} accent - Acento a usar
     * @returns {Promise<Object|null>} Datos de la palabra o null si hay error
     */
    async playAndGetWordData(text, lang = 'en-US', accent = this.currentAccent) {
      if (!text) return null;
      
      try {
        // Ejecutar en paralelo
        const [audioResult, wordData] = await Promise.all([
          this.playWord(text, lang, accent).catch(e => {
            console.warn('Error playing audio:', e);
            return null;
          }),
          this.getWordData(text).catch(e => {
            console.warn('Error fetching word data:', e);
            return null;
          })
        ]);
        
        return wordData;
      } catch (error) {
        console.error('Error in playAndGetWordData:', error);
        return null;
      }
    },

    /**
     * Envía una solicitud para procesar múltiples palabras
     * @param {Array} words - Array de palabras a buscar
     * @returns {Promise<Object>} - Objeto vacío ya que el procesamiento es asíncrono
     */
    async fetchMultipleWords(words) {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://irregular-verbs-web-express.onrender.com';
        const response = await fetch(`${baseUrl}/api/words`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ words })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error('La solicitud no se pudo procesar correctamente');
        }
        
        console.log(`Solicitud de procesamiento enviada: ${result.message}`);
        console.log(`Palabras en cola: ${result.wordsInQueue}`);
        
        return {};
      } catch (error) {
        console.error('Error fetching multiple words:', error);
        throw error;
      }
    },

    // --- Métodos Privados ---

    /**
     * Prepara las partes de texto para procesamiento
     * @private
     */
    prepareTextParts(text) {
      return text
        .replace('*', '')
        .split('/')
        .map(part => part.trim())
        .filter(part => part);
    },
    
    /**
     * Normaliza una palabra para búsqueda
     * @private
     */
    normalizeWord(word) {
      return word.toLowerCase().trim();
    },
    
    /**
     * Reproduce una sola palabra
     * @private
     */
    async playSingleWord(word, accent) {
      const normalizedWord = this.normalizeWord(word);
      const cacheKey = `${normalizedWord}-${accent}`;
      
      // Intentar reproducir desde caché
      if (this.audioCache.has(cacheKey)) {
        const audio = this.audioCache.get(cacheKey);
        audio.currentTime = 0;
        await audio.play();
        return;
      }
      
      // Obtener datos de la palabra
      const data = await this.getWordData(normalizedWord);
      if (!data?.pronunciations?.[accent]?.audioUrl) {
        throw new Error(`No audio URL found for accent "${accent}".`);
      }
      
      // Crear y reproducir audio
      const audio = new Audio(data.pronunciations[accent].audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => {
          this.audioCache.set(cacheKey, audio);
          audio.play().then(resolve).catch(reject);
        });
        
        audio.addEventListener('error', () => {
          reject(new Error('Failed to load audio from URL.'));
        });
        
        audio.load();
      });
    },
    
    /**
     * Obtiene los datos de una palabra desde la API
     * @private
     */
    async fetchWordData(word) {
      if (!word) return null;
      
      const normalized = this.normalizeWord(word);
      
      // Verificar caché primero
      if (this.wordDataCache.has(normalized)) {
        return this.wordDataCache.get(normalized);
      }
      
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://irregular-verbs-web-express.onrender.com';
        const response = await fetch(`${baseUrl}/api/word/${encodeURIComponent(normalized)}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        this.wordDataCache.set(normalized, result.data);
        return result.data;
      } catch (error) {
        console.error(`Error fetching data for "${word}":`, error);
        return null;
      }
    },
    
    /**
     * Reproducción alternativa con la API Web Speech
     * @private
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
