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
          @keyup.enter="analyzeText"
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
          <button 
            class="btn primary" 
            @click="analyzeText" 
            :disabled="!inputText.trim() || isAnalyzing"
          >
            {{ isAnalyzing ? 'Analizando…' : 'Analizar texto' }}
          </button>
        </div>
      </section>

      <section v-if="tokens.length > 0" class="results">
        <div class="paragraph" aria-label="Texto interactivo">
          <template v-for="(token, idx) in tokens" :key="`token-${idx}`">
            <span
              v-if="token.type === 'word'"
              class="word"
              :class="getWordClass(token)"
              @click="handleWordClick(token)"
              :title="getWordTitle(token)"
              role="button"
              tabindex="0"
              @keyup.enter="handleWordClick(token)"
            >
              {{ token.original }}
            </span>
            <span v-else class="sep">{{ token.original }}</span>
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
import { ref, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '@/stores/settings';
import { useTextViewStore } from '@/stores/textViewStore';
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';

export default {
  name: 'TextView',
  components: {
    NavBar,
    Footer
  },
  setup() {
    const settingsStore = useSettingsStore();
    const textViewStore = useTextViewStore();
    const showQuiz = ref(false);
    
    // Usar storeToRefs para mantener la reactividad
    const { 
      inputText, 
      tokens, 
      isAnalyzing, 
      accent, 
      wordDataMap, 
      selectedWord 
    } = storeToRefs(textViewStore);

    // Datos de la palabra seleccionada
    const selectedData = computed(() => {
      if (!selectedWord.value) return null;
      const wordKey = selectedWord.value.normalized || selectedWord.value.original?.toLowerCase();
      return wordDataMap.value[wordKey] || null;
    });

    // Watchers
    watch(accent, (newAccent) => {
      textViewStore.setAccent(newAccent);
    });

    /**
     * Analiza el texto ingresado
     */
    function analyzeText() {
      textViewStore.analyzeText();
    }

    /**
     * Maneja el clic en una palabra
     */
    function handleWordClick(token) {
      textViewStore.handleWordClick(token);
    }

    /**
     * Obtiene el título para el tooltip de una palabra
     */
    function getWordTitle(token) {
      if (token.type !== 'word') return '';
      const wordKey = token.normalized || token.original?.toLowerCase();
      const wordData = wordDataMap.value[wordKey];
      
      if (!wordData) return token.original;
      if (wordData.loading) return 'Cargando...';
      
      // Mostrar la primera definición si existe
      if (wordData.definitions?.length > 0) {
        return wordData.definitions[0].definition;
      }
      
      return token.original;
    }

    /**
     * Obtiene las clases CSS para una palabra
     */
    function getWordClass(token) {
      if (token.type !== 'word') return '';
      
      const classes = [];
      const wordKey = token.normalized || token.original?.toLowerCase();
      const wordData = wordDataMap.value[wordKey];
      
      // Resaltar palabra seleccionada
      if (selectedWord.value?.normalized === wordKey || 
          selectedWord.value?.original?.toLowerCase() === wordKey) {
        classes.push('selected');
      }
      
      // Estado de carga
      if (wordData?.loading) {
        classes.push('loading');
      } 
      // Tiene datos
      else if (wordData?.definitions?.length > 0) {
        classes.push('has-data');
      }
      
      return classes.join(' ');
    }

    return {
      // Stores
      settingsStore,
      
      // Estado reactivo
      inputText,
      tokens,
      isAnalyzing,
      accent,
      selectedWord,
      selectedData,
      wordDataMap,
      showQuiz,
      
      // Métodos
      analyzeText,
      handleWordClick,
      getWordTitle,
      getWordClass
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

