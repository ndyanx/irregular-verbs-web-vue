<template>
  <div :class="['app', { 'dark-mode': settingsStore.darkMode }]">
    <NavBar 
      :soundEnabled="settingsStore.soundEnabled" 
      :darkMode="settingsStore.darkMode"
      @toggle-sound="settingsStore.toggleSound"
      @toggle-dark-mode="settingsStore.toggleDarkMode"
    />
    
    <main class="audio-content">
      <div class="header-wrapper">
        <h1 class="title">
          <span class="title-gradient">Audio Explorer</span>
          <span class="title-emoji">🎙️</span>
        </h1>
        <p class="subtitle">Escucha la pronunciación en diferentes acentos</p>
      </div>
      
      <div class="audio-card">
        <div class="input-group">
          <input 
            v-model="inputWord"
            type="text" 
            placeholder="Escribe una palabra en inglés..."
            @keyup.enter="playInputWord"
            class="audio-input"
          >
          <button 
            @click="playInputWord"
            :disabled="!inputWord"
            class="btn primary"
          >
            <span class="btn-content">
              <span class="btn-text">Reproducir</span>
              <span class="btn-icon">▶</span>
            </span>
          </button>
        </div>
        
        <div class="accent-selector">
          <div class="selector-title">Acento:</div>
          <div class="radio-group">
            <label class="radio-option" :class="{ 'active': accent === 'us' }">
              <input 
                type="radio" 
                v-model="accent" 
                value="us" 
                class="radio-input"
              >
              <span class="radio-label">🇺🇸 Americano</span>
            </label>
            <label class="radio-option" :class="{ 'active': accent === 'uk' }">
              <input 
                type="radio" 
                v-model="accent" 
                value="uk" 
                class="radio-input"
              >
              <span class="radio-label">🇬🇧 Británico</span>
            </label>
          </div>
        </div>

        <!-- Barra de estado de audio -->
        <div v-if="isPlaying" class="audio-status-bar">
          <div class="audio-wave">
            <span class="wave-bar" v-for="n in 5" :key="n" :style="waveBarStyle(n)"></span>
          </div>
          <span class="playing-text">Reproduciendo: {{ inputWord }}</span>
        </div>
      </div>
    </main>
    
    <Footer />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import { useSettingsStore } from '@/stores/settings';
import { useAudioStore } from '@/stores/audio';

export default {
  name: 'AudioView',
  components: { NavBar, Footer },
  setup() {
    const settingsStore = useSettingsStore();
    const audioStore = useAudioStore();
    return { settingsStore, audioStore };
  },
  data() {
    return {
      inputWord: '',
      accent: this.audioStore.currentAccent,
      isPlaying: false,
      waveAnimation: Array(5).fill(0)
    };
  },
  methods: {
    async playInputWord() {
      if (!this.inputWord.trim()) return;
      
      this.isPlaying = true;
      this.startWaveAnimation();
      
      try {
        await this.audioStore.playWord(this.inputWord, 'en-US', this.accent);
      } finally {
        setTimeout(() => {
          this.isPlaying = false;
          this.stopWaveAnimation();
        }, 300);
      }
    },
    
    startWaveAnimation() {
      this.animationInterval = setInterval(() => {
        this.waveAnimation = this.waveAnimation.map(() => 
          Math.floor(Math.random() * 15) + 5
        );
      }, 200);
    },
    
    stopWaveAnimation() {
      clearInterval(this.animationInterval);
      this.waveAnimation = Array(5).fill(0);
    },
    
    waveBarStyle(index) {
      return {
        height: `${this.waveAnimation[index-1]}px`,
        backgroundColor: this.settingsStore.darkMode ? '#7928CA' : '#FF0080'
      };
    }
  },
  watch: {
    accent(newVal) {
      this.audioStore.currentAccent = newVal;
    }
  },
  beforeUnmount() {
    this.stopWaveAnimation();
  },
  created() {
    document.body.classList.add('theme-loaded');
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
}

.btn-icon {
  font-size: 0.9em;
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
}

@media (max-width: 400px) {
  .title {
    flex-direction: column;
    gap: 0.25rem;
  }
}
</style>