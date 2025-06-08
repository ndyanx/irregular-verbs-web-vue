<template>
  <div :class="['app', { 'dark-mode': settingsStore.darkMode }]">
    <NavBar 
      :soundEnabled="settingsStore.soundEnabled" 
      :darkMode="settingsStore.darkMode"
      @toggle-sound="settingsStore.toggleSound"
      @toggle-dark-mode="settingsStore.toggleDarkMode"
      @open-quiz="handleOpenQuiz"
    />
    
    <VerbTable 
      :verbs="preparedVerbs" 
      :soundEnabled="settingsStore.soundEnabled"
      :showParticiple="settingsStore.showParticiple"
      :commonVerbs="verbsStore.commonVerbs"
      @toggle-participle="settingsStore.toggleParticiple"
      @speak-word="speakWord"
    />
    
    <QuizModals 
      :showQuiz="showQuiz"
      :verbs="preparedVerbs"
      :showParticiple="settingsStore.showParticiple"
      @close="showQuiz = null"
    />
    
    <Footer />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue';
import VerbTable from '@/components/VerbTable.vue';
import QuizModals from '@/components/modals/QuizModals.vue';
import Footer from '@/components/Footer.vue';
import { useSettingsStore } from '@/stores/settings';
import { useVerbsStore } from '@/stores/verbs';

export default {
  name: 'VerbsView',
  components: {
    NavBar,
    VerbTable,
    QuizModals,
    Footer
  },
  setup() {
    const settingsStore = useSettingsStore();
    const verbsStore = useVerbsStore();
    return { settingsStore, verbsStore };
  },
  data() {
    return {
      showQuiz: null,
      audioCache: new Map(),
      // Puedes cambiar aquí el acento: 'uk' o 'us'
      defaultAccent: 'us',
    };
  },
  computed: {
    preparedVerbs () {
      return this.verbsStore.allVerbs;
    }
  },
  methods: {
    handleOpenQuiz(type) {
      this.showQuiz = type;
    },
    
    async speakWord(text, lang = 'en-US') {
      if (!this.settingsStore.soundEnabled || !text) return;
      
      // Divide la palabra en partes si hay '/'
      const parts = text.replace('*', '').split('/').map(part => part.trim()).filter(part => part);
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        try {
          await this.playApiAudio(part, this.defaultAccent);
        } catch (error) {
          console.log(`API audio not available for "${part}", using speechSynthesis`, error);
          this.fallbackToSpeechSynthesis(part, lang);
          // Espera 1 segundo para evitar que se pisen audios
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (i < parts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    },

    async playApiAudio(word, accent = 'uk') {
      if (this.audioCache.has(word)) {
        const audio = this.audioCache.get(word);
        audio.currentTime = 0;
        await audio.play();
        return;
      }

      const apiUrl = `https://irregular-verbs-web-express.onrender.com/api/audio/${accent}/${encodeURIComponent(word)}`;
      const response = await fetch(apiUrl);

      if (!response.ok) throw new Error('Audio API fetch failed');

      const data = await response.json();
      if (!data.audioUrl) throw new Error('No audio URL returned');

      const audio = new Audio(data.audioUrl);
      return new Promise((resolve, reject) => {
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
    document.body.classList.add('theme-loaded');
  }
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  transition: var(--transition);
}
</style>
