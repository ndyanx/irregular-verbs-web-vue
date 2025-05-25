<template>
  <div v-if="show">
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

    <div 
      id="quiz-modal" 
      class="quiz-modal"
      @click.self="close"
    >
      <div class="quiz-content">
        <div class="quiz-header">
          <h3>Emparejar Verbos</h3>
          <button 
            id="close-quiz" 
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
          <div class="quiz-instructions">
            <p>Selecciona el verbo que corresponda al significado mostrado:</p>
          </div>

          <div class="meaning-display">
            {{ currentVerb ? getVerbReference(currentVerb) : '' }}
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
              <div v-if="gameMode === 'base'">{{ verb.present }}</div>
              <div v-if="gameMode === 'past'">{{ verb.past }}</div>
              <div v-if="gameMode === 'participle'">{{ verb.participle }}</div>
            </div>
          </div>

          <div class="quiz-controls">
            <div class="game-mode-selector">
              <div class="mode-buttons">
                <button
                  v-for="mode in gameModes"
                  :key="mode.value"
                  @click="gameMode = mode.value"
                  :class="{ active: gameMode === mode.value }"
                >
                  {{ mode.label }}
                </button>
              </div>
              <div class="mode-select">
                <select v-model="gameMode">
                  <option v-for="mode in gameModes" :key="mode.value" :value="mode.value">
                    {{ mode.label }}
                  </option>
                </select>
              </div>
            </div>

            <button v-if="feedback" class="quiz-next" @click="generateNewQuestion">
              Siguiente
            </button>
          </div>

          <div class="quiz-feedback" :class="{ correct: isCorrect, wrong: !isCorrect && feedback }">
            {{ feedback }}
          </div>

          <div class="quiz-stats">
            Aciertos: {{ score }} / Intentos: {{ attempts }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import confetti from 'canvas-confetti';

export default {
  name: 'MatchVerbsModal',
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
        { value: 'base', label: 'Presente' },
        { value: 'past', label: 'Pasado' },
        { value: 'participle', label: 'Participio' },
      ]
    };
  },
  methods: {
    getVerbReference(verb) {
      return verb.meanings.map(m => m.present).join(" / ");
    },
    launchConfetti() {
      const canvas = this.$refs.confettiCanvas;
      const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
      myConfetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    },
    generateNewQuestion() {
      this.selectedVerbs = [];
      this.feedback = '';
      this.isCorrect = false;
      this.correctIndices = [];

      const verbKeys = Object.keys(this.verbs);
      const randomKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
      this.currentVerbKey = randomKey;
      this.currentVerb = this.verbs[randomKey];
      
      const usedKeys = [randomKey];
      const incorrectVerbs = [];

      // Seleccionar 3 verbos incorrectos
      while (incorrectVerbs.length < 3 && usedKeys.length < verbKeys.length) {
        const randomKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
        if (!usedKeys.includes(randomKey)) {
          const verb = this.verbs[randomKey];
          
          // Verificar que no sea la respuesta correcta
          if (
            (this.gameMode === 'base' && verb.present !== this.currentVerb.present) ||
            (this.gameMode === 'past' && verb.past !== this.currentVerb.past) ||
            (this.gameMode === 'participle' && verb.participle !== this.currentVerb.participle)
          ) {
            incorrectVerbs.push(verb);
            usedKeys.push(randomKey);
          }
        }
      }

      // Mezclar los verbos (correcto + incorrectos)
      this.shuffledVerbs = this.shuffleArray([this.currentVerb, ...incorrectVerbs]);

      // Encontrar los índices de las respuestas correctas
      this.correctIndices = this.shuffledVerbs
        .map((verb, index) => {
          if (this.gameMode === 'base' && verb.present === this.currentVerb.present) return index;
          if (this.gameMode === 'past' && verb.past === this.currentVerb.past) return index;
          if (this.gameMode === 'participle' && verb.participle === this.currentVerb.participle) return index;
          return -1;
        })
        .filter(index => index !== -1);
    },
    selectVerb(index) {
      if (this.feedback) return;
      
      this.selectedVerbs = [index];
      this.attempts++;
      
      this.isCorrect = this.correctIndices.includes(index);
      this.feedback = this.isCorrect ? '¡Correcto! 🎉' : 'Incorrecto 😢';
      
      if (this.isCorrect) {
        this.score++;
        this.launchConfetti();
      }
    },
    shuffleArray(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    resetQuiz() {
      this.currentVerbKey = null;
      this.currentVerb = null;
      this.shuffledVerbs = [];
      this.selectedVerbs = [];
      this.feedback = '';
      this.isCorrect = false;
      this.correctIndices = [];
    },
    close() {
      this.$emit('close');
      this.resetQuiz();
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
  display: flex;
  flex-direction: column;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

.quiz-instructions {
  margin-bottom: 15px;
  text-align: center;
  color: var(--text-light);
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

.quiz-body.has-feedback .verb-card {
  pointer-events: none;
}
.quiz-body.has-feedback .verb-card.correct,
.quiz-body.has-feedback .verb-card.wrong {
  pointer-events: auto;
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

.verb-form {
  margin: 6px 0;
}

.quiz-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 15px;
}

.game-mode-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  justify-content: center;
}

.mode-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.mode-select {
  display: none;
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

.quiz-submit,
.quiz-next {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.quiz-submit {
  background-color: var(--primary);
  color: white;
}

.quiz-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quiz-submit:not(:disabled):hover {
  background-color: var(--primary-light);
}

.quiz-next {
  background-color: var(--success);
  color: white;
}

/* .quiz-next:hover {
  background-color: #3ab7d8;
} */

.quiz-feedback {
  margin-top: 15px;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
}

.quiz-feedback.correct {
  color: var(--success);
  /* background-color: rgba(76, 201, 240, 0.1); */
}

.quiz-feedback.wrong {
  color: var(--danger);
  /* background-color: rgba(247, 37, 133, 0.1); */
}

.quiz-stats {
  margin-top: 15px;
  text-align: center;
  color: var(--text-light);
}

.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2147483647; /* asegúrate que esté por encima del modal */
}

/* Responsive styles */
@media (max-width: 480px) {
  .quiz-modal {
    align-items: flex-start;
    padding: 10px;
  }

  .quiz-content {
    width: 100%;
    max-height: calc(100% - 20px);
    padding: 15px;
  }

  .verbs-grid {
    grid-template-columns: 1fr;
  }

  .mode-buttons {
    display: none;
  }

  .mode-select {
    display: block;
    width: 100%;
    margin-bottom: 12px;
  }

  .mode-select select {
    width: 100%;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid var(--primary-light);
    background-color: var(--card);
    color: var(--text-light);
    font-size: 1rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    transition: border 0.3s ease;
  }

  .mode-select select:focus {
    border-color: var(--primary);
    outline: none;
  }
}
</style>
