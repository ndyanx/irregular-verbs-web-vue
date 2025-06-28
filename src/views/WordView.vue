<template>
  <div :class="['app', { 'dark-mode': settingsStore.darkMode }]">
    <NavBar 
      :soundEnabled="settingsStore.soundEnabled" 
      :darkMode="settingsStore.darkMode"
      @toggle-sound="settingsStore.toggleSound"
      @toggle-dark-mode="settingsStore.toggleDarkMode"
      @open-quiz="showQuiz = $event"
    />

    <main class="audio-content">
      <div class="header-wrapper">
        <h1 class="title">
          <span class="title-gradient">Word Explorer</span>
          <span class="title-emoji">🎙️</span>
        </h1>
        <p class="subtitle">Escuche la pronunciación en inglés y ejemplos.</p>
      </div>

      <div class="audio-card">
        <div class="input-group">
          <input 
            v-model="inputWord"
            type="text" 
            placeholder="Type an English word..."
            @keyup.enter="fetchWordInfo"
            class="audio-input"
          >
          <button 
            @click="fetchWordInfo"
            :disabled="!inputWord || isSearching"
            class="btn primary"
          >
            <span class="btn-content">
              <span class="btn-text">Search</span>
              <span class="btn-icon">🔎</span>
            </span>
          </button>
        </div>

        <div v-if="wordData" class="word-display">
          <div class="pronunciation-info">
            <div class="accent-block" v-for="(data, key) in wordData.pronunciations" :key="key">
              <strong>{{ key.toUpperCase() }}</strong>
              <span class="ipa">/{{ data.ipa }}/</span>
              <button class="play-btn" @click="playAccentAudio(key)">🔊</button>
            </div>
          </div>

          <div class="definitions" v-for="entry in wordData.entries" :key="entry.pos">
            <h3>{{ entry.pos }}</h3>
            <div class="sense" v-for="(sense, idx) in entry.senses" :key="idx">
              <p class="definition">» {{ sense.definition }}</p>
              <p class="translation">╚ {{ sense.translation }}</p>
              <div class="examples-toggle" @click="toggleExamples(entry.pos, idx)">
                <span>Examples ({{ sense.examples.length }})</span>
                <span class="toggle-icon">{{ isExampleExpanded(entry.pos, idx) ? '▼' : '▶' }}</span>
              </div>
              <ul class="examples" v-if="isExampleExpanded(entry.pos, idx)">
                <li v-for="(ex, exIdx) in sense.examples" :key="exIdx">
                  <strong>» {{ ex.en }}</strong><br>
                  <em v-if="ex.es">╚ {{ ex.es }}</em>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="isSearching" class="audio-status-bar">
          <div class="audio-wave">
            <span class="wave-bar" v-for="n in 5" :key="n" :style="waveBarStyle(n)"></span>
          </div>
          <span class="playing-text">Searching: {{ inputWord }}</span>
        </div>
      </div>
    </main>

    <QuizModals 
      :showQuiz="showQuiz"
      :verbs="preparedVerbs"
      @close="showQuiz = null"
    />

    <Footer />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import QuizModals from '@/components/modals/QuizModals.vue';
import { useSettingsStore } from '@/stores/settings';
import { useVerbsStore } from '@/stores/verbs';
import { useAudioStore } from '@/stores/audio';
import { ref, computed } from 'vue';

export default {
  name: 'AudioView',
  components: { NavBar, QuizModals, Footer },
  setup() {
    const settingsStore = useSettingsStore();
    const verbsStore = useVerbsStore();
    const audioStore = useAudioStore();
    
    const showQuiz = ref(null);
    const inputWord = ref('');
    const isSearching = ref(false);
    const waveAnimation = ref(Array(5).fill(0));
    const wordData = ref(null);
    const lastRequestId = ref(0);
    const expandedExamples = ref({});

    const preparedVerbs = computed(() => verbsStore.allVerbs);

    const isExampleExpanded = (pos, idx) => {
      return !!expandedExamples.value[`${pos}-${idx}`];
    };

    const toggleExamples = (pos, idx) => {
      const key = `${pos}-${idx}`;
      expandedExamples.value = {
        ...expandedExamples.value,
        [key]: !expandedExamples.value[key]
      };
    };

    const fetchWordInfo = async () => {
      if (!inputWord.value.trim() || isSearching.value) return;
      
      wordData.value = null;
      isSearching.value = true;
      startWaveAnimation();
      
      const currentRequestId = ++lastRequestId.value;
      
      try {
        const data = await audioStore.fetchWordData(inputWord.value);
        
        if (currentRequestId === lastRequestId.value) {
          wordData.value = data;
          expandedExamples.value = {};
        }
      } catch (err) {
        console.error('Error loading word data:', err);
      } finally {
        if (currentRequestId === lastRequestId.value) {
          setTimeout(() => {
            isSearching.value = false;
            stopWaveAnimation();
          }, 500);
        }
      }
    };

    const playAccentAudio = (accent) => {
      if (!wordData.value || !wordData.value.word) return;
      audioStore.playWord(wordData.value.word, 'en-US', accent);
    };

    let animationInterval = null;

    const startWaveAnimation = () => {
      animationInterval = setInterval(() => {
        waveAnimation.value = waveAnimation.value.map(() => 
          Math.floor(Math.random() * 15) + 5
        );
      }, 200);
    };

    const stopWaveAnimation = () => {
      clearInterval(animationInterval);
      waveAnimation.value = Array(5).fill(0);
    };

    const waveBarStyle = (index) => {
      return {
        height: `${waveAnimation.value[index-1]}px`,
        backgroundColor: settingsStore.darkMode ? '#7928CA' : '#FF0080'
      };
    };

    return {
      settingsStore,
      verbsStore,
      audioStore,
      showQuiz,
      inputWord,
      isSearching,
      waveAnimation,
      wordData,
      preparedVerbs,
      fetchWordInfo,
      playAccentAudio,
      waveBarStyle,
      isExampleExpanded,
      toggleExamples
    };
  },
  created() {
    document.body.classList.add('theme-loaded');
  },
  beforeUnmount() {
    this.stopWaveAnimation();
  }
};
</script>

<style scoped>
.audio-content {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1.25rem;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.header-wrapper {
  margin-bottom: 2.5rem;
  text-align: center;
  padding: 0 0.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  line-height: 1.2;
}

.title-gradient {
  background: linear-gradient(90deg, #7928CA 0%, #FF0080 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.title-emoji {
  font-size: 2rem;
}

.subtitle {
  font-size: 1.125rem;
  color: var(--text-light);
  margin-bottom: 0;
}

.audio-card {
  background: var(--card);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
  margin: 0 0.5rem;
}

.dark-mode .audio-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  border-color: var(--border-dark);
}

.input-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.audio-input {
  flex: 1;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--input-bg);
  color: var(--text);
  min-height: 50px;
}

.audio-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(115, 103, 255, 0.1);
}

.btn {
  padding: 0 1.5rem;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
  font-size: 0.9rem;
}

.btn.primary {
  background: linear-gradient(90deg, #7928CA 0%, #FF0080 100%);
  color: white;
  position: relative;
  overflow: hidden;
  min-width: 120px;
}

.btn.primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, #8a3bda 0%, #ff2b94 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1;
}

.btn.primary:hover::before {
  opacity: 1;
}

.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(121, 40, 202, 0.3);
}

.btn.primary:active {
  transform: translateY(0);
}

.btn.primary:disabled {
  background: var(--disabled-bg);
  color: var(--disabled-text);
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
}

.btn.primary:disabled::before {
  display: none;
}

.accent-selector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.selector-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-light);
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  background: var(--radio-bg);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.radio-option:hover {
  border-color: var(--primary-light);
}

.radio-option.active {
  background: var(--primary-lightest);
  border-color: var(--primary);
  color: var(--primary);
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  width: 100%;
  justify-content: center;
}

/* Audio Status Bar */
.audio-status-bar {
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--status-bar-bg);
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: fadeIn 0.3s ease;
}

.audio-wave {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  height: 30px;
}

.wave-bar {
  width: 4px;
  background: linear-gradient(to top, #7928CA, #FF0080);
  border-radius: 2px;
  transition: height 0.2s ease;
  display: inline-block;
}

.playing-text {
  font-size: 0.9rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Dark mode adjustments */
.dark-mode {
  --radio-bg: rgba(255, 255, 255, 0.05);
  --status-bar-bg: rgba(255, 255, 255, 0.05);
}

.dark-mode .audio-input {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .radio-option {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .radio-option.active {
  background: rgba(121, 40, 202, 0.2);
}

.word-display {
  margin-top: 1rem;
}

.pronunciation-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.accent-block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ipa {
  font-style: italic;
  font-size: 1.1rem;
}

.play-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #7928CA;
}

.definitions {
  margin-bottom: 1.5rem;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
}

.definitions h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.definition {
  font-weight: bold;
  margin-bottom: 0.2rem;
  color: var(--text-light);
  word-break: break-word;
}

.dark-mode .definition {
  color: var(--text-light);
}

.translation {
  color: #ff2b94;
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.examples-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: cadetblue;
  margin: 0.5rem 0;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.examples-toggle:hover {
  background-color: rgba(121, 40, 202, 0.1);
}

.toggle-icon {
  font-size: 0.8rem;
}

.examples {
  list-style: none;
  padding-left: 1rem;
  margin-bottom: 1rem;
}

.examples li {
  margin-bottom: 0.5rem;
  word-break: break-word;
  overflow-wrap: anywhere;
  line-height: 1.4;
}

.examples li strong,
.examples li em {
  display: inline-block;
  max-width: 100%;
  word-break: break-word;
}

.examples li {
  padding: 0.5rem;
  border-radius: 8px;
  transition: background-color 0.2s ease, transform 0.2s ease;
  cursor: default;
}

.examples li:hover {
  background-color: rgba(121, 40, 202, 0.08);
  transform: translateX(4px);
}

.examples li:hover strong {
  color: #7928CA;
}

.examples li:hover em {
  color: #FF0080;
}

/* Responsive */
@media (max-width: 640px) {
  .audio-content {
    padding: 1.5rem 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .input-group {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    padding: 1rem;
  }

  .radio-group {
    flex-direction: column;
  }

  .audio-card {
    padding: 1.5rem;
    margin: 0;
  }

  .audio-status-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .playing-text {
    white-space: normal;
  }

  .definitions h3,
  .definition,
  .translation,
  .examples li {
    font-size: 0.95rem;
  }
}

@media (max-width: 400px) {
  .title {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>