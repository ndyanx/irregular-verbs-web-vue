import { defineStore } from "pinia";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Store de audio
 * - Reproduce pronunciaciones usando un API externo con caché en memoria
 * - Hace fallback a SpeechSynthesis si no hay audio disponible
 * - Gestiona acentos (us, uk, etc.) y cola de reproducción para formas compuestas
 */

export const useAudioStore = defineStore("audio", {
  state: () => ({
    audioCache: new Map(),
    currentAccent: "us",
  }),

  actions: {
    /**
     * Reproduce una o varias formas separadas por '/'
     * Intenta audio por API; si falla, usa SpeechSynthesis
     */
    async playWord(text, lang = "en-US", accent = this.currentAccent) {
      if (!text) return;

      this.currentAccent = accent;

      const parts = text
        .replace("*", "")
        .split("/")
        .map((part) => part.trim())
        .filter((part) => part);

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        try {
          await this.playApiAudio(part, accent);
        } catch (error) {
          console.warn(
            `No audio found for "${part}". Using speech synthesis.`,
            error,
          );
          this.fallbackToSpeechSynthesis(part, lang);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        if (i < parts.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    },

    /**
     * Obtiene datos de pronunciación/definiciones desde el backend.
     * La API devuelve directamente el objeto plano { word, pronunciations, entries }.
     *
     * Incluye timeout: sin esto, un fetch que se queda "colgado" (red lenta,
     * backend dormido en Render, etc.) nunca resuelve ni rechaza, y cuando
     * TextView lanza varias peticiones en paralelo con Promise.all, basta
     * una sola petición colgada para bloquear el lote completo de forma
     * indefinida. Con el timeout, esa palabra falla rápido y cae al fallback
     * de síntesis de voz en vez de trabar el análisis de todo el texto.
     */
    async fetchWordData(word, timeoutMs = 90000) {
      word = word.toLowerCase().trim();
      const apiUrl = `${VITE_API_BASE_URL}/api/word/${encodeURIComponent(word)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(apiUrl, { signal: controller.signal });
        if (!response.ok) throw new Error("Word not found in the dictionary.");

        const payload = await response.json();

        if (!payload?.success || !payload?.data) {
          throw new Error("Word not found in the dictionary.");
        }

        return payload.data;
      } catch (error) {
        if (error.name === "AbortError") {
          console.error(
            `[fetchWordData TIMEOUT] "${word}" tardó más de ${timeoutMs}ms`,
          );
        } else {
          console.error("[fetchWordData ERROR]", error.message);
        }
        throw new Error("Unable to fetch word data. Please try another word.");
      } finally {
        clearTimeout(timeoutId);
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
        if (!audioUrl)
          throw new Error(`No audio URL found for accent "${accent}".`);

        const audio = new Audio(audioUrl);
        return new Promise((resolve, reject) => {
          audio.addEventListener("canplaythrough", () => {
            this.audioCache.set(cacheKey, audio);
            audio
              .play()
              .then(resolve)
              .catch((err) => {
                console.warn(
                  "Audio play failed, falling back to speech synthesis.",
                  err,
                );
                reject(err);
              });
          });
          audio.addEventListener("error", () =>
            reject(new Error("Failed to load audio from URL.")),
          );
          audio.load();
        });
      } catch (error) {
        console.error("[playApiAudio ERROR]", error.message);
        throw error;
      }
    },

    /**
     * Reproducción alternativa con la API Web Speech
     */
    fallbackToSpeechSynthesis(text, lang) {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    },
  },
});
