<template>
  <div v-if="show">
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

    <div 
      class="quiz-modal"
      @click.self="close"
    >
      <div class="quiz-content">
        <div class="quiz-header">
          <h3>Emparejar Verbos</h3>
          <button 
            class="icon-btn"
            @click="close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="quiz-body" :class="{ 'has-feedback': feedback }">
          <div class="meaning-display">
            {{ currentMeaning }}
          </div>

          <div class="verbs-grid">
            <div 
              v-for="(verb, index) in shuffledVerbs" 
              :key="index"
              class="verb-card"
              :class="{
                selected: !feedback && selectedVerbs.includes(index),
                correct: feedback && correctIndices.includes(index),
                wrong: feedback && selectedVerbs.includes(index) && !correctIndices.includes(index)
              }"
              @click="selectVerb(index)"
            >
              <div>{{ verb[gameMode] }}</div>
            </div>
          </div>

          <div class="quiz-controls">
            <div class="game-mode-selector">
              <button
                v-for="mode in gameModes"
                :key="mode.value"
                @click="gameMode = mode.value"
                :class="{ active: gameMode === mode.value }"
              >
                {{ mode.label }}
              </button>
            </div>

            <button 
              v-if="feedback" 
              class="quiz-next" 
              @click="generateNewQuestion"
            >
              Siguiente
            </button>
          </div>
          
          <div class="quiz-feedback-row">
            <div class="quiz-feedback" :class="{ correct: isCorrect, wrong: !isCorrect && feedback }">
              {{ feedback }}
            </div>
            <div class="quiz-stats">
              ✅ {{ score }} | ❌ {{ attempts }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import confetti from 'canvas-confetti';

export default {
  name: 'GameMatchModal',
  props: {
    show: Boolean,
    verbs: Object,
  },
  data() {
    return {
      currentVerbKey: null,
      currentVerb: null,
      shuffledVerbs: [],
      selectedVerbs: [],
      feedback: '',
      isCorrect: false,
      score: 0,
      attempts: 0,
      correctIndices: [],
      gameMode: 'past',
      gameModes: [
        { value: 'present', label: 'Presente' },
        { value: 'past', label: 'Pasado' },
        { value: 'participle', label: 'Participio' },
      ]
    };
  },
  computed: {
    currentMeaning() {
      if (!this.currentVerb) return '';
      return this.currentVerb.meanings.map(m => m[this.gameMode]).join(" / ");
    }
  },
  methods: {
    launchConfetti() {
      const canvas = this.$refs.confettiCanvas;
      const myConfetti = confetti.create(canvas, { 
        resize: true, 
        useWorker: true 
      });
      myConfetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    },
    generateNewQuestion() {
      const verbKeys = Object.keys(this.verbs);
      this.currentVerbKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
      this.currentVerb = this.verbs[this.currentVerbKey];
      
      // Obtener 3 verbos incorrectos
      const incorrectVerbs = [];
      const usedKeys = [this.currentVerbKey];
      
      while (incorrectVerbs.length < 3 && usedKeys.length < verbKeys.length) {
        const randomKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
        if (!usedKeys.includes(randomKey)) {
          const verb = this.verbs[randomKey];
          if (verb[this.gameMode] !== this.currentVerb[this.gameMode]) {
            incorrectVerbs.push(verb);
            usedKeys.push(randomKey);
          }
        }
      }
      
      // Mezclar verbos
      this.shuffledVerbs = [this.currentVerb, ...incorrectVerbs]
        .sort(() => Math.random() - 0.5);
      
      // Identificar índices correctos
      this.correctIndices = this.shuffledVerbs
        .map((verb, index) => verb[this.gameMode] === this.currentVerb[this.gameMode] ? index : -1)
        .filter(index => index !== -1);
      
      this.resetQuestionState();
    },
    selectVerb(index) {
      if (this.feedback || this.selectedVerbs.length > 0) return;
      
      this.selectedVerbs = [index];
      
      this.isCorrect = this.correctIndices.includes(index);
      this.feedback = this.isCorrect ? '¡Correcto! 🎉' : 'Incorrecto 😢';
      
      if (this.isCorrect) {
        this.score++;
        if (this.score % 3 === 0) {
          this.launchConfetti();
        }
      } else {
        this.attempts++;
      }
    },
    resetQuestionState() {
      this.selectedVerbs = [];
      this.feedback = '';
      this.isCorrect = false;
    },
    resetQuiz() {
      this.currentVerbKey = null;
      this.currentVerb = null;
      this.shuffledVerbs = [];
      this.resetQuestionState();
      this.score = 0;
      this.attempts = 0;
    },
    close() {
      this.$emit('close');
    }
  },
  watch: {
    show(val) {
      if (val) this.generateNewQuestion();
      else this.resetQuiz();
    },
    gameMode() {
      this.generateNewQuestion();
    }
  }
};
</script>

<style scoped>
.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2147483647;
}

.quiz-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
}

.quiz-content {
  background-color: var(--card);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  max-height: calc(100% - 40px);
  overflow-y: auto;
  padding: 20px;
  position: relative;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.quiz-header h3 {
  font-size: 1.2rem;
  margin: 0;
  color: var(--primary);
}

.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  background-color: var(--card);
  color: var(--text);
}

.icon-btn:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.meaning-display {
  font-size: 1.2rem;
  margin-bottom: 20px;
  padding: 15px;
  background-color: black;
  color: white;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
}

.dark-mode .meaning-display {
  color: black;
  background-color: white;
}

.verbs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.verb-card {
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.verb-card:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
}

.verb-card.selected {
  border-color: var(--primary);
  background-color: rgba(67, 97, 238, 0.1);
}

.verb-card.correct {
  border-color: var(--success);
  background-color: rgba(76, 201, 240, 0.1);
}

.verb-card.wrong {
  border-color: var(--danger);
  background-color: rgba(247, 37, 133, 0.1);
}

.quiz-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.game-mode-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  justify-content: center;
}

.game-mode-selector button {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 20px;
  background-color: transparent;
  color: var(--text-light);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.game-mode-selector button:hover {
  border-color: var(--primary-light);
  color: var(--primary);
}

.game-mode-selector button.active {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

.quiz-next {
  padding: 12px;
  background-color: var(--success);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  width: 100%;
}

.quiz-feedback-row {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.quiz-feedback.correct {
  color: var(--success);
}

.quiz-feedback.wrong {
  color: var(--danger);
}

.quiz-stats {
  color: var(--text-light);
}

@media (max-width: 480px) {
  .verbs-grid {
    grid-template-columns: 1fr;
  }
}
</style>