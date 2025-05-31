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
      :verbs="verbs" 
      :soundEnabled="settingsStore.soundEnabled"
      :showParticiple="settingsStore.showParticiple"
      @toggle-participle="settingsStore.toggleParticiple"
      @speak-word="speakWord"
    />
    
    <QuizModals 
      :showQuiz="showQuiz"
      :verbs="verbs"
      :showParticiple="settingsStore.showParticiple"
      @close="showQuiz = null"
    />
    
    <Footer />
  </div>
</template>

<script>
import verbs from '@/assets/data/verbs.json';
import NavBar from '@/components/NavBar.vue';
import VerbTable from '@/components/VerbTable.vue';
import QuizModals from '@/components/modals/QuizModals.vue';
import Footer from '@/components/Footer.vue';
import { useSettingsStore } from '@/stores/settings';

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
    return { settingsStore };
  },
  data() {
    return {
      verbs: verbs,
      showQuiz: null,
      audioCache: new Map()
    };
  },
  methods: {
    handleOpenQuiz(type) {
      this.showQuiz = type;
    },
    
    async speakWord(text, lang = 'en-US') {
      if (!this.settingsStore.soundEnabled || !text) return;
      
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