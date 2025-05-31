<template>
  <div>
    <GameQuizModal 
      :show="showQuiz === 'classic'" 
      :verbs="filteredVerbs"
      @close="closeModal"
    />
    <GameMatchModal 
      :show="showQuiz === 'match'" 
      :verbs="filteredVerbs"
      @close="closeModal"
    />
    <GameRaceModal
      :show="showQuiz === 'race'" 
      :verbs="filteredVerbs"
      @close="closeModal"
    />
  </div>
</template>

<script>
import GameQuizModal from './GameQuizModal.vue';
import GameMatchModal from './GameMatchModal.vue';
import GameRaceModal from './GameRaceModal.vue';

export default {
  props: {
    showQuiz: String,
    verbs: {
      type: Object,
      required: true
    }
  },
  computed: {
    filteredVerbs() {
      return this.verbs;
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    }
  },
  components: { GameQuizModal, GameMatchModal, GameRaceModal }
};
</script>