<template>
  <div>
    <GameQuizModal 
      :show="showQuiz === 'classic'" 
      :verbs="verbs"
      @close="closeModal"
    />
    <GameMatchModal 
      :show="showQuiz === 'match'" 
      :verbs="verbs"
      @close="closeModal"
    />
    <GameRaceModal
      :show="showQuiz === 'race'" 
      :verbs="verbs"
      @close="closeModal"
    />
  </div>
</template>

<script>
import verbs from '@/assets/data/verbs.json';
import GameQuizModal from './GameQuizModal.vue';
import GameMatchModal from './GameMatchModal.vue';
import GameRaceModal from './GameRaceModal.vue';

export default {
  props: {
    showQuiz: String // 'classic', 'match', 'race' o null
  },
  data() {
    return {
      verbs: verbs
    };
  },
  methods: {
    closeModal() {
      this.$emit('close');
    }
  },
  components: { GameQuizModal, GameMatchModal, GameRaceModal }
};
</script>