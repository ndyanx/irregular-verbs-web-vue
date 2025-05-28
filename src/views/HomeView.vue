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
      showQuiz: null, // Cambiado a null y ahora puede ser 'classic' o 'match'
      showParticiple: false,
    }
  },
  methods: {
    handleOpenQuiz(type) {
      this.showQuiz = type; // 'classic' o 'match'
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
    speakWord(text, lang = 'en-US') {
      if (!this.soundEnabled || !text) return;
      
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        
        const parts = text.replace('*', '').split('/');
        
        parts.forEach((part, index) => {
          if (part) {
            const utterance = new SpeechSynthesisUtterance(part.trim());
            utterance.lang = lang;
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
          }
          if (index < parts.length - 1) {
            const pause = new SpeechSynthesisUtterance('');
            pause.lang = lang;
            pause.rate = 0.1;
            speechSynthesis.speak(pause);
          }
        });
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