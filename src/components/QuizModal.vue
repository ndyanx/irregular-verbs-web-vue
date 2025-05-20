<template>
  <div 
    id="quiz-modal" 
    class="quiz-modal"
    v-if="show"
    @click.self="close"
  >
    <div class="quiz-content">
      <div class="quiz-header">
        <h3>Juego de Verbos Irregulares</h3>
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
      <div class="quiz-body">
        <div id="quiz-reference" class="quiz-reference">{{ currentVerb ? currentVerb[3] : '' }}</div>
        <div id="quiz-question" class="quiz-question">{{ questionText }}</div>
        <input 
          type="text" 
          id="quiz-answer" 
          class="quiz-input" 
          placeholder="Escribe tu respuesta..."
          v-model="userAnswer"
          @keyup.enter="checkAnswer"
        >
        <button 
          id="quiz-submit" 
          class="quiz-submit"
          @click="checkAnswer"
        >
          Comprobar
        </button>
        <div 
          id="quiz-feedback" 
          class="quiz-feedback"
          :class="{ correct: isCorrect, wrong: !isCorrect && feedback }"
        >
          {{ feedback }}
        </div>
        <div id="quiz-stats" class="quiz-stats">
          Aciertos: {{ score }} / Intentos: {{ attempts }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizModal',
  props: {
    show: Boolean,
    verbs: Array,
    showParticiple: Boolean
  },
  data() {
    return {
      currentVerb: null,
      questionText: '',
      userAnswer: '',
      feedback: '',
      isCorrect: false,
      score: 0,
      attempts: 0,
      usedVerbIndices: [],
      questionTypes: [
        { type: 'base_to_past', text: (verb) => `¿Cuál es el pasado de "${verb[0]}"?` },
        { type: 'base_to_participle', text: (verb) => `¿Cuál es el participio de "${verb[0]}"?` },
        { type: 'past_to_base', text: (verb) => `¿Cuál es el presente de "${verb[1]}"?` }
      ]
    }
  },
  methods: {
    generateNewQuestion() {
      const availableTypes = this.questionTypes.filter(type => {
        if (type.type.includes('participle')) return this.showParticiple;
        return true;
      });

      const unusedVerbIndices = this.verbs
        .map((_, index) => index)
        .filter(index => !this.usedVerbIndices.includes(index));

      if (unusedVerbIndices.length === 0) {
        this.usedVerbIndices = [];
        unusedVerbIndices.push(...Array.from({length: this.verbs.length}, (_, i) => i));
      }

      const randomIndex = unusedVerbIndices[Math.floor(Math.random() * unusedVerbIndices.length)];
      this.currentVerb = this.verbs[randomIndex];
      this.usedVerbIndices.push(randomIndex);

      const hasSpecialRules = this.currentVerb[7]?.gameRules;
      
      if (hasSpecialRules) {
        const forms = {
          base: this.currentVerb[0].split(' / ').map(f => f.trim()),
          past: this.currentVerb[1].split(' / ').map(f => f.trim())
        };

        const direction = Math.random();
        
        if (direction < 0.4) {
          const randomBase = forms.base[Math.floor(Math.random() * forms.base.length)];
          this.questionText = `¿Cuál es el pasado de "${randomBase}"?`;
        } else if (direction < 0.8) {
          const randomPast = forms.past[Math.floor(Math.random() * forms.past.length)];
          this.questionText = `¿Cuál es el presente de "${randomPast}"?`;
        } else {
          const randomBase = forms.base[Math.floor(Math.random() * forms.base.length)];
          this.questionText = `¿Cuál es el participio de "${randomBase}"?`;
        }
      } else {
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        this.questionText = randomType.text(this.currentVerb);
      }

      this.userAnswer = '';
      this.feedback = '';
      this.isCorrect = false;
    },
    checkAnswer() {
      if (!this.userAnswer.trim()) return;
      
      const userAnswer = this.userAnswer.trim().toLowerCase();
      const currentVerb = this.currentVerb;
      let isCorrect = false;
      let correctAnswer = '';

      const gameRules = currentVerb[7]?.gameRules;
      const verbBase = currentVerb[0].toLowerCase().split('/').map(s => s.trim());
      const verbPast = currentVerb[1].toLowerCase().split('/').map(s => s.trim());
      const verbParticiple = currentVerb[2].toLowerCase().split('/').map(s => s.trim().replace('*', ''));

      if (gameRules) {
        if (this.questionText.includes('pasado de')) {
          const baseForm = this.questionText.match(/"(.+?)"/)[1].toLowerCase();
          correctAnswer = gameRules.baseToPast[baseForm].join(' o ');
          isCorrect = gameRules.baseToPast[baseForm].includes(userAnswer);
        } 
        else if (this.questionText.includes('presente de')) {
          const pastForm = this.questionText.match(/"(.+?)"/)[1].toLowerCase();
          correctAnswer = gameRules.pastToBase[pastForm].join(' o ');
          isCorrect = gameRules.pastToBase[pastForm].includes(userAnswer);
        }
        else if (this.questionText.includes('participio de')) {
          correctAnswer = currentVerb[2];
          isCorrect = verbParticiple.includes(userAnswer);
        }
      } else {
        if (this.questionText.includes('presente de')) {
          correctAnswer = currentVerb[0];
          isCorrect = verbBase.includes(userAnswer);
        } 
        else if (this.questionText.includes('pasado de')) {
          correctAnswer = currentVerb[1];
          isCorrect = verbPast.includes(userAnswer);
        }
        else if (this.questionText.includes('participio de')) {
          correctAnswer = currentVerb[2];
          isCorrect = verbParticiple.includes(userAnswer);
        }
      }

      this.attempts++;
      if (isCorrect) {
        this.score++;
        this.feedback = '¡Correcto!';
        this.isCorrect = true;
        setTimeout(this.generateNewQuestion, 1500);
      } else {
        this.feedback = `Incorrecto. La respuesta correcta era: ${correctAnswer}`;
        this.isCorrect = false;
      }
    },
    close() {
      this.$emit('close');
      this.usedVerbIndices = [];
      this.feedback = '';
      this.isCorrect = false;
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.generateNewQuestion();
      }
    }
  }
}
</script>

<style scoped>
/* Estilos del modal del juego */
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
}

.quiz-content {
  background-color: var(--card);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
  padding: 20px;
  position: relative;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.quiz-header h3 {
  margin: 0;
  color: var(--primary);
}

.quiz-question {
  font-size: 1.2rem;
  margin-bottom: 15px;
  padding: 10px;
  background-color: rgba(67, 97, 238, 0.1);
  border-radius: 12px;
}

.quiz-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--card);
  color: var(--text);
}

.quiz-submit {
  width: 100%;
  padding: 12px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.quiz-submit:hover {
  background-color: var(--primary-light);
}

.quiz-feedback {
  margin-top: 15px;
  padding: 10px;
  border-radius: 12px;
  text-align: center;
}

.quiz-reference {
  font-size: 1.2rem;
  margin-bottom: 15px;
  text-align: center;
  padding: 5px 0px;
  color: white;
  background-color: black;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.dark-mode .quiz-reference {
  color: black;
  background-color: white;
}

.quiz-stats {
  margin-top: 15px;
  text-align: center;
  color: var(--text-light);
}

/* Animaciones */
@keyframes correctAnswer {
  0% { background-color: rgba(76, 201, 240, 0.1); }
  50% { background-color: rgba(76, 201, 240, 0.3); }
  100% { background-color: rgba(76, 201, 240, 0.1); }
}

@keyframes wrongAnswer {
  0% { background-color: rgba(247, 37, 133, 0.1); }
  50% { background-color: rgba(247, 37, 133, 0.3); }
  100% { background-color: rgba(247, 37, 133, 0.1); }
}

.correct {
  animation: correctAnswer 1s ease;
  color: var(--success);
}

.wrong {
  animation: wrongAnswer 1s ease;
  color: var(--danger);
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
</style>