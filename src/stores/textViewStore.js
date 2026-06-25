import { defineStore } from "pinia";
import { useAudioStore } from "./audio";

export const useTextViewStore = defineStore("textView", {
  state: () => ({
    inputText: "",
    tokens: [],
    wordDataMap: {}, // Mapa de datos de palabras
    selectedWord: null, // Palabra seleccionada actualmente
    isAnalyzing: false, // Estado de análisis
    analyzeRunId: 0, // ID de la ejecución actual
    accent: "us", // Acento por defecto
  }),

  getters: {
    // Obtiene los datos de una palabra del mapa
    getWordData: (state) => (word) => {
      return state.wordDataMap[word.toLowerCase()] || null;
    },

    // Verifica si una palabra está cargando
    isLoading: (state) => (word) => {
      const data = state.wordDataMap[word.toLowerCase()];
      return data && data.loading === true;
    },
  },

  actions: {
    /**
     * Maneja el clic en una palabra
     * @param {Object} token - Token de la palabra clickeada
     */
    async handleWordClick(token) {
      if (!token || token.type !== "word") return;

      const audioStore = useAudioStore();
      const wordKey = token.normalized || token.original.toLowerCase();

      // Si ya tenemos datos y no está cargando, solo reproducir audio
      if (this.wordDataMap[wordKey] && !this.wordDataMap[wordKey].loading) {
        await audioStore.playWord(token.original, "en-US", this.accent);
        this.selectedWord = token;
        return;
      }

      // Mostrar estado de carga
      this.wordDataMap = {
        ...this.wordDataMap,
        [wordKey]: { loading: true },
      };

      this.selectedWord = token;

      try {
        // Usar el método que obtiene datos y reproduce audio en paralelo
        const data = await audioStore.playAndGetWordData(
          token.original,
          "en-US",
          this.accent,
        );

        // Actualizar el estado con los datos obtenidos
        this.wordDataMap = {
          ...this.wordDataMap,
          [wordKey]: data || null,
        };
      } catch (error) {
        console.error(`Error al cargar "${token.original}":`, error);
        this.wordDataMap = {
          ...this.wordDataMap,
          [wordKey]: null,
        };
      }
    },

    /**
     * Analiza el texto ingresado
     */
    analyzeText() {
      if (!this.inputText.trim()) return;

      this.isAnalyzing = true;
      this.tokens = this.tokenize(this.inputText);
      this.analyzeRunId++;

      // Aquí podrías agregar lógica adicional de análisis si es necesario

      this.isAnalyzing = false;
    },

    /**
     * Tokeniza el texto en palabras y separadores
     * @private
     */
    tokenize(text) {
      const result = [];
      // Divide en grupos de letras/apóstrofos y lo demás como separadores
      const regex = /([A-Za-z']+)|([^A-Za-z']+)/g;
      let match;

      while ((match = regex.exec(text)) !== null) {
        if (match[1]) {
          const original = match[1];
          result.push({
            type: "word",
            original,
            normalized: original.toLowerCase(),
          });
        } else if (match[2]) {
          result.push({
            type: "sep",
            original: match[2],
          });
        }
      }

      return result;
    },

    /**
     * Obtiene palabras únicas del texto actual
     */
    getUniqueWords() {
      const wordSet = new Set();
      return this.tokens
        .filter((token) => token.type === "word")
        .map((token) => token.normalized)
        .filter((word) => {
          if (wordSet.has(word)) return false;
          wordSet.add(word);
          return true;
        });
    },

    /**
     * Establece el acento actual
     */
    setAccent(accent) {
      this.accent = accent;
      const audioStore = useAudioStore();
      audioStore.currentAccent = accent;
    },
  },
});
