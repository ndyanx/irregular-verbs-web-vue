<template>
  <div :class="['app', { 'dark-mode': darkMode }]">
    <NavBar 
      :soundEnabled="soundEnabled" 
      :darkMode="darkMode"
      @toggle-sound="toggleSound"
      @toggle-dark-mode="toggleDarkMode"
      @open-quiz="handleOpenQuiz"
    />
    
    <VerbTable 
      :verbs="verbs" 
      :soundEnabled="soundEnabled"
      :showParticiple="showParticiple"
      @toggle-participle="toggleParticiple"
      @speak-word="speakWord"
    />
    
    <GameQuizModal 
      :show="showQuiz === 'classic'" 
      :verbs="verbs"
      :showParticiple="showParticiple"
      @close="showQuiz = null"
    />
    
    <GameMatchModal 
      :show="showQuiz === 'match'" 
      :verbs="verbs"
      @close="showQuiz = null"
    />

    <GameRaceModal
      :show="showQuiz === 'race'" 
      :verbs="verbs"
      @close="showQuiz = null"
    />
    
    <Footer />
  </div>
</template>

<script>
import verbs from '@/assets/data/verbs.json';
import NavBar from '/src/components/NavBar.vue';
import VerbTable from '/src/components/VerbTable.vue';
import GameQuizModal from '/src/components/modals/GameQuizModal.vue';
import GameMatchModal from '/src/components/modals/GameMatchModal.vue';
import GameRaceModal from '/src/components/modals/GameRaceModal.vue';
import Footer from '/src/components/Footer.vue';

export default {
  name: 'App',
  components: {
    NavBar,
    VerbTable,
    GameQuizModal,
    GameMatchModal,
    GameRaceModal,
    Footer
  },
  data() {
    return {
      verbs: verbs,
      soundEnabled: false,
      darkMode: false,
      showQuiz: null,
      showParticiple: false,
      audioCache: new Map()
    }
  },
  methods: {
    handleOpenQuiz(type) {
      this.showQuiz = type;
    },
    toggleParticiple() {
      this.showParticiple = !this.showParticiple;
    },
    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('soundEnabled', this.soundEnabled);
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('darkMode', this.darkMode);
      document.body.classList.toggle('dark-mode', this.darkMode);
    },
    
    async speakWord(text, lang = 'en-US') {
      if (!this.soundEnabled || !text) return;
      
      const parts = text.replace('*', '').split('/').map(part => part.trim()).filter(part => part);
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        try {
          await this.playOxfordAudio(part);
        } catch (error) {
          console.log(`Oxford audio not available for "${part}", using speechSynthesis`);
          this.fallbackToSpeechSynthesis(part, lang);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (i < parts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    },
    
    async playOxfordAudio(word) {
      return new Promise((resolve, reject) => {
        if (this.audioCache.has(word)) {
          const audio = this.audioCache.get(word);
          audio.currentTime = 0;
          audio.play().then(resolve).catch(reject);
          return;
        }
        
        const audioUrl = this.getOxfordPronunciationURL(word);
        console.log(`Loading audio for: ${word} from ${audioUrl}`);
        const audio = new Audio(audioUrl);
        
        audio.addEventListener('canplaythrough', () => {
          this.audioCache.set(word, audio);
          audio.play().then(resolve).catch(reject);
        });
        
        audio.addEventListener('error', () => {
          reject(new Error('Audio load failed'));
        });
        
        audio.load();
      });
    },
    
    getOxfordPronunciationURL(word, variant = 1, format = 'ogg') {
      const sanitized = word.toLowerCase().replace(/[^a-z]/g, '');
      const folder1 = sanitized[0];
      const folder2 = sanitized.slice(0, 3).padEnd(3, '_');

      let folder3;
      if (sanitized.length === 2) {
        folder3 = sanitized + '__u';
      } else if (sanitized.length <= 5) {
        folder3 = sanitized.padEnd(5, '_');
      } else {
        folder3 = sanitized.slice(0, 5);
      }

      const extension = format === 'ogg' ? 'ogg' : 'mp3';
      const mediaFolder = format === 'ogg' ? 'us_pron_ogg' : 'us_pron';
      const fileName = `${sanitized}__us_${variant}.${extension}`;

      return `https://www.oxfordlearnersdictionaries.com/us/media/american_english/${mediaFolder}/${folder1}/${folder2}/${folder3}/${fileName}`;
    },
    
    fallbackToSpeechSynthesis(text, lang) {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
    }
  },
  created() {
    this.soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.add('theme-loaded');
  }
}
</script>

<style scoped>
/* ============ VARIABLES & RESET ============ */
:root {
  --primary: #6c51a6;
  --primary-light: #6c51a6;
  --text: #2b2d42;
  --text-light: #8d99ae;
  --bg: #f8f9fa;
  --card: #ffffff;
  --border: #e9ecef;
  --success: #6c51a6;
  --danger: #f72585;
  --warning: #f8961e;
  --radius: 12px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}


.dark-mode {
  --primary: #6c51a6;
  --primary-light: #6c51a6;
  --text: #f8f9fa;
  --text-light: #adb5bd;
  --bg: #121212;
  --card: #1e1e1e;
  --border: #2d2d2d;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--text);
  line-height: 1.6;
  transition: var(--transition);
  padding-bottom: 60px;
}

.app {
  min-height: 100vh;
  transition: var(--transition);
}
</style>