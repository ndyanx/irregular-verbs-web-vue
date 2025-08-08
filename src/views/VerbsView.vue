<template>
  <div :class="['app', { 'dark-mode': settingsStore.darkMode }]">
    <NavBar @open-quiz="handleOpenQuiz" />
    
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
import { useAudioStore } from '@/stores/audio';

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
    const audioStore = useAudioStore();
    return { settingsStore, verbsStore, audioStore };
  },
  data() {
    return {
      showQuiz: null,
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
      await this.audioStore.playWord(text, lang, 'us');
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
