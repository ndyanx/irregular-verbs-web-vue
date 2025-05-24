<template>
  <div 
    id="quiz-modal" 
    class="quiz-modal"
    v-if="show"
    @click.self="close"
  >
    <div class="quiz-content">
      <div class="quiz-header">
        <h3>Emparejar Verbos</h3>
        <button 
          id="close-quiz" 
          class="icon-btn close-btn"
          @click="close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="quiz-body">
        <div class="quiz-instructions">
          <p>Selecciona el verbo que corresponda al significado mostrado:</p>
        </div>
        
        <div class="meaning-display">
          {{ currentVerb ? currentVerb[3] : '' }}
        </div>
        
        <div class="verbs-grid">
          <div 
            v-for="(verb, index) in shuffledVerbs" 
            :key="index"
            class="verb-card"
            :class="{
              selected: selectedVerbs.includes(index),
              correct: feedback && correctIndices.includes(index),
              wrong: feedback && selectedVerbs.includes(index) && !correctIndices.includes(index)
            }"
            @click="selectVerb(index)"
          >
            <div class="verb-form" v-if="gameMode === 'base' || gameMode === 'all'">{{ verb[0] }}</div>
            <div class="verb-form" v-if="gameMode === 'past' || gameMode === 'all'">{{ verb[1] }}</div>
            <div class="verb-form" v-if="gameMode === 'participle' || gameMode === 'all'">{{ verb[2] }}</div>
          </div>
        </div>
        
        <div class="quiz-controls">
          <div class="game-mode-selector">
            <!-- Botones para pantallas grandes -->
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

            <!-- Selector para móviles -->
            <div class="mode-select">
              <select v-model="gameMode">
                <option v-for="mode in gameModes" :key="mode.value" :value="mode.value">
                  {{ mode.label }}
                </option>
              </select>
            </div>
          </div>

          <button 
            class="quiz-next"
            @click="generateNewQuestion"
            v-if="feedback"
          >
            Siguiente
          </button>
        </div>
        
        <div 
          class="quiz-feedback"
          :class="{ correct: isCorrect, wrong: !isCorrect && feedback }"
        >
          {{ feedback }}
        </div>
        
        <div class="quiz-stats">
          Aciertos: {{ score }} / Intentos: {{ attempts }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizModal2',
  props: {
    show: Boolean,
    verbs: Array,
  },
  data() {
    return {
      currentVerb: null,
      shuffledVerbs: [],
      selectedVerbs: [],
      feedback: '',
      isCorrect: false,
      score: 0,
      attempts: 0,
      correctIndices: [],
      requiredSelections: 1,
      gameMode: 'past',
      gameModes: [
        { value: 'base', label: 'Solo Presente' },
        { value: 'past', label: 'Solo Pasado' },
        { value: 'participle', label: 'Solo Participio' },
        { value: 'all', label: 'Todas las Formas' }
      ]
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.generateNewQuestion();
      } else {
        this.resetQuiz();
      }
    },
    gameMode() {
      this.generateNewQuestion();
    }
  },
  methods: {
    generateNewQuestion() {
      this.selectedVerbs = [];
      this.feedback = '';
      this.isCorrect = false;
      this.correctIndices = [];
      
      const randomIndex = Math.floor(Math.random() * this.verbs.length);
      this.currentVerb = this.verbs[randomIndex];
      this.shuffledVerbs = [this.currentVerb];
      
      const incorrectVerbs = [];
      const usedIndices = [randomIndex];
      
      while (incorrectVerbs.length < 3) {
        const randomVerbIndex = Math.floor(Math.random() * this.verbs.length);
        if (!usedIndices.includes(randomVerbIndex)) {
          const verb = this.verbs[randomVerbIndex];
          
          let isValidIncorrect = false;
          if (this.gameMode === 'base') {
            isValidIncorrect = verb[0] !== this.currentVerb[0];
          } else if (this.gameMode === 'past') {
            isValidIncorrect = verb[1] !== this.currentVerb[1];
          } else if (this.gameMode === 'participle') {
            isValidIncorrect = verb[2] !== this.currentVerb[2];
          } else {
            isValidIncorrect = verb[0] !== this.currentVerb[0] && 
                               verb[1] !== this.currentVerb[1] && 
                               verb[2] !== this.currentVerb[2];
          }
          
          if (isValidIncorrect) {
            incorrectVerbs.push(verb);
            usedIndices.push(randomVerbIndex);
          }
        }
      }
      
      this.shuffledVerbs = this.shuffleArray([...this.shuffledVerbs, ...incorrectVerbs]);
      
      this.correctIndices = this.shuffledVerbs
        .map((verb, index) => {
          if (this.gameMode === 'base' && verb[0] === this.currentVerb[0]) return index;
          if (this.gameMode === 'past' && verb[1] === this.currentVerb[1]) return index;
          if (this.gameMode === 'participle' && verb[2] === this.currentVerb[2]) return index;
          if (this.gameMode === 'all' && verb[0] === this.currentVerb[0]) return index;
          return -1;
        })
        .filter(index => index !== -1);
    },
    selectVerb(index) {
      if (this.feedback) return;
      this.selectedVerbs = [index];
      this.attempts++;
      const isCorrect = this.correctIndices.includes(index);
      this.isCorrect = isCorrect;
      this.feedback = isCorrect 
        ? '¡Correcto! Has seleccionado el verbo correcto.' 
        : 'Incorrecto. El verbo seleccionado no corresponde al significado.';
      if (isCorrect) this.score++;
    },
    shuffleArray(array) {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    },
    resetQuiz() {
      this.currentVerb = null;
      this.shuffledVerbs = [];
      this.selectedVerbs = [];
      this.feedback = '';
      this.isCorrect = false;
      this.correctIndices = [];
      this.gameMode = 'past';
    },
    close() {
      this.$emit('close');
      this.resetQuiz();
    }
  }
}
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
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.close-btn {
  color: var(--text-light);
}

.close-btn:hover {
  color: var(--danger);
  background-color: rgba(247, 37, 133, 0.1);
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
