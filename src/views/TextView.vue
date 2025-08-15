<template>
  <div :class="['app', { 'dark-mode': settingsStore.darkMode }]">
    <NavBar @open-quiz="showQuiz = $event" />

    <main class="text-explorer">
      <h1 class="title">Texto interactivo</h1>
      <p class="subtitle">Pega tu párrafo en inglés, analiza y haz clic en cualquier palabra para escucharla y ver detalles.</p>

      <section class="controls">
        <textarea
          v-model="inputText"
          class="text-input"
          placeholder="Pega aquí tu párrafo en inglés..."
          rows="6"
        ></textarea>
        <div class="actions">
          <div class="accent-select">
            <span class="label">Acento:</span>
            <label class="radio">
              <input type="radio" value="us" v-model="accent" />
              <span>US</span>
            </label>
            <label class="radio">
              <input type="radio" value="uk" v-model="accent" />
              <span>UK</span>
            </label>
          </div>
          <button class="btn primary" @click="analyzeText" :disabled="!inputText.trim() || isAnalyzing">
            {{ isAnalyzing ? 'Analizando…' : 'Analizar texto' }}
          </button>
        </div>
      </section>

      <section v-if="tokens.length" class="results">
        <div class="paragraph" aria-label="Texto interactivo">
          <template v-for="(token, idx) in tokens" :key="idx">
            <span
              v-if="token.type === 'word'"
              class="word"
              :class="{ active: selectedWord?.original === token.original }"
              @click="handleWordClick(token)"
              :title="getWordTitle(token)"
              role="button"
              tabindex="0"
              @keyup.enter="handleWordClick(token)"
              >{{ token.original }}</span
            ><span v-else class="sep">{{ token.original }}</span>
          </template>
        </div>

        <aside class="details" v-if="selectedWord">
          <div class="details-header">
            <h2 class="details-title">{{ selectedWord.normalized }}</h2>
            <div class="pronunciations" v-if="selectedData?.pronunciations">
              <div
                v-for="(p, key) in selectedData.pronunciations"
                :key="key"
                class="accent"
              >
                <strong>{{ key.toUpperCase() }}</strong>
                <span class="ipa" v-if="p.ipa">/{{ p.ipa }}/</span>
                <!-- <button class="play-btn" @click="audioStore.playWord(selectedData.word, 'en-US', key)">🔊</button> -->
              </div>
            </div>
          </div>

          <div class="definitions" v-if="selectedData?.entries">
            <div class="entry" v-for="entry in selectedData.entries" :key="entry.id">
              <h3>{{ entry.pos }}</h3>
              <div v-for="(sense, idx) in entry.senses" :key="idx" class="sense">
                <p v-if="sense.sense_title" class="stitle">[{{ sense.sense_title }}]</p>
                <p v-if="sense.phrase" class="sphrase">» {{ sense.phrase }}</p>
                <p v-if="sense.definition" class="definition">» {{ sense.definition }}</p>
                <p v-if="sense.translation" class="translation">╚ {{ sense.translation }}</p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { ref, computed, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useAudioStore } from '@/stores/audio';

// Vista: Texto interactivo
// - Tokeniza el párrafo preservando espacios y puntuación
// - Hace prefetch de palabras únicas y cachea resultados
// - Reproduce pronunciación y muestra detalles al seleccionar una palabra
export default {
  name: 'TextView',
  components: { NavBar, Footer },
  setup() {
    const settingsStore = useSettingsStore();
    const audioStore = useAudioStore();

    const inputText = ref('');
    const tokens = ref([]);
    const isAnalyzing = ref(false);
    const accent = ref(audioStore.currentAccent || 'us');

    // Mapa palabra(normalizada) -> datos de API
    const wordDataMap = ref({});
    const selectedWord = ref(null);
    const analyzeRunId = ref(0);

    // Control de ritmo de peticiones para evitar saturar la API
    const PREFETCH_BATCH_SIZE = 8; // nº de palabras por lote
    const PREFETCH_DELAY_MS = 400; // pausa entre lotes

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    const selectedData = computed(() => {
      if (!selectedWord.value) return null;
      return wordDataMap.value[selectedWord.value.normalized] || null;
    });

    watch(accent, (val) => {
      audioStore.currentAccent = val;
    });

    function tokenize(text) {
      const result = [];
      // Divide en grupos de letras/apóstrofos y lo demás como separadores
      const regex = /([A-Za-z']+)|([^A-Za-z']+)/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        if (match[1]) {
          const original = match[1];
          result.push({ type: 'word', original, normalized: original.toLowerCase() });
        } else if (match[2]) {
          result.push({ type: 'sep', original: match[2] });
        }
      }
      return result;
    }

    async function analyzeText() {
      if (!inputText.value.trim()) return;
      isAnalyzing.value = true;
      tokens.value = tokenize(inputText.value);

      const unique = Array.from(
        new Set(tokens.value.filter(t => t.type === 'word').map(t => t.normalized))
      );

      const currentRun = ++analyzeRunId.value;

      // Prefetch en lotes con pausa entre ellos
      for (let i = 0; i < unique.length; i += PREFETCH_BATCH_SIZE) {
        const slice = unique.slice(i, i + PREFETCH_BATCH_SIZE);
        await Promise.all(slice.map(async (w) => {
          try {
            if (wordDataMap.value[w] !== undefined) return;
            const data = await audioStore.fetchWordData(w);
            wordDataMap.value[w] = data;
          } catch (e) {
            // Si falla, mantenemos null; SpeechSynthesis actuará como fallback
            wordDataMap.value[w] = null;
          }
        }));

        // Si hay una nueva ejecución, aborta esta
        if (analyzeRunId.value !== currentRun) {
          return;
        }

        // Pausa entre lotes si aún quedan palabras
        if (i + PREFETCH_BATCH_SIZE < unique.length) {
          await sleep(PREFETCH_DELAY_MS);
        }
      }

      // Marcar fin sólo si no fue sustituido por otra ejecución
      if (analyzeRunId.value === currentRun) {
        isAnalyzing.value = false;
        const firstWord = tokens.value.find(t => t.type === 'word');
        selectedWord.value = firstWord || null;
      }
    }

    function getWordTitle(token) {
      const hasData = !!wordDataMap.value[token.normalized];
      return hasData ? 'Clic para escuchar y ver detalles' : 'Clic para pronunciar (sintetizado)';
    }

    async function handleWordClick(token) {
      selectedWord.value = token;
      await audioStore.playWord(token.original, 'en-US', accent.value);
    }

    return {
      settingsStore,
      audioStore,
      inputText,
      tokens,
      isAnalyzing,
      analyzeText,
      selectedWord,
      selectedData,
      getWordTitle,
      handleWordClick,
      accent
    };
  },
  created() {
    document.body.classList.add('theme-loaded');
  }
};
</script>

<style scoped>
.text-explorer {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: var(--text-light);
  margin-bottom: 1.25rem;
  text-align: center;
}

.controls {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.text-input {
  width: 100%;
  background: var(--card);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem;
  resize: vertical;
}

.actions {
  margin-top: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.accent-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.accent-select .label {
  color: var(--text-light);
}

.radio {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.btn.primary {
  background: linear-gradient(90deg, #7928CA 0%, #FF0080 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1rem;
  cursor: pointer;
}

.btn.primary:disabled { opacity: .6; cursor: not-allowed; }

.results {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.paragraph {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  line-height: 1.9;
  font-size: 1.05rem;
}

.word {
  color: var(--text);
  cursor: pointer;
  padding: 0 2px;
  border-radius: 6px;
  transition: background-color .2s ease, color .2s ease;
}

.word:hover {
  background: rgba(121, 40, 202, 0.08);
  color: #7928CA;
}

.word.active {
  background: rgba(121, 40, 202, 0.15);
}

.sep { white-space: pre-wrap; }

.details {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem;
  max-height: 70vh;
  overflow: auto;
}

.details-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.details-title { margin: 0; font-size: 1.25rem; }

.pronunciations { display: flex; gap: .75rem; flex-wrap: wrap; }
.accent { display: inline-flex; align-items: center; gap: .35rem; }
.ipa { font-style: italic; opacity: .8; }
.play-btn { background: none; border: 1px solid var(--border); border-radius: 6px; padding: .2rem .4rem; cursor: pointer; }

.definitions { margin-top: .75rem; }
.entry { margin-bottom: 1rem; }
.sense { margin-bottom: .5rem; border-top: solid 2px #7928CA; }
.stitle { font-weight: bold; color: #1d55af; }
.definition { font-weight: bold; color: #5f646c; }
.translation { color: #ff2b94; }

@media (max-width: 900px) {
  .results {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  .controls,
  .paragraph,
  .details {
    width: 100%;
    max-width: 680px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>

