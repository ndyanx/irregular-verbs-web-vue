<template>
  <div v-if="show">
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

    <div 
      class="quiz-modal"
      @click.self="close"
      role="dialog"
      aria-labelledby="quiz-title"
      aria-modal="true"
    >
      <div class="quiz-content">
        <div class="quiz-header">
          <h3 id="quiz-title">Juego de Verbos Irregulares</h3>
          <button 
            class="icon-btn"
            @click="close"
            aria-label="Cerrar juego"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="quiz-body">
          <div class="quiz-reference">{{ currentVerb ? getVerbReference(currentVerb) : '' }}</div>
          <div class="quiz-question">{{ questionText }}</div>
          <input 
            type="text" 
            class="quiz-input" 
            placeholder="Escribe tu respuesta..."
            v-model.trim="userAnswer"
            @keyup.enter="checkAnswer"
            ref="answerInput"
            aria-label="Respuesta"
          >
          <button 
            class="quiz-submit"
            @click="checkAnswer"
            :disabled="!userAnswer.trim() || isChecking || answerLock"
          >
             {{ timeOver ? 'Tiempo terminado' : 'Comprobar' }}
          </button>
          <div 
            class="quiz-feedback"
            :class="{ correct: isCorrect, wrong: !isCorrect && feedback }"
            aria-live="polite"
          >
            {{ feedback }}
          </div>
          <div class="quiz-stats">
            ✅ {{ score }} | ❌ {{ attempts }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import confetti from 'canvas-confetti';

const QUESTION_TYPES = [
  { type: 'base_to_past', text: (verb, verbKey) => `¿Cuál es el pasado de "${verb.present}"?` },
  { type: 'base_to_participle', text: (verb, verbKey) => `¿Cuál es el participio de "${verb.present}"?` },
  { type: 'past_to_present', text: (verb, verbKey) => `¿Cuál es el presente de "${verb.past}"?` }
];

export default {
  name: 'GameQuizModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    verbs: {
      type: Object,
      required: true,
      validator: value => Object.keys(value).length > 0
    },
    showParticiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      currentVerbKey: null,
      currentVerb: null,
      questionText: '',
      userAnswer: '',
      feedback: '',
      isCorrect: false,
      score: 0,
      attempts: 0,
      usedVerbKeys: [],
      confetti: null,
      isChecking: false,
      answerLock: false
    };
  },
  computed: {
    availableQuestionTypes() {
      return QUESTION_TYPES.filter(type => {
        if (type.type.includes('participle')) return this.showParticiple;
        return true;
      });
    },
    unusedVerbKeys() {
      return Object.keys(this.verbs)
        .filter(key => !this.usedVerbKeys.includes(key));
    }
  },
  methods: {
    getVerbReference(verb) {
      return verb.meanings.map(m => m.present).join(" / ");
    },
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
    getRandomVerbKey() {
      if (this.unusedVerbKeys.length === 0) {
        this.usedVerbKeys = [];
        return this.getRandomFromArray(Object.keys(this.verbs));
      }
      return this.getRandomFromArray(this.unusedVerbKeys);
    },
    getRandomFromArray(array) {
      return array[Math.floor(Math.random() * array.length)];
    },
    generateSpecialQuestion(forms) {
      const direction = Math.random();
      
      if (direction < 0.4) {
        const randomBase = this.getRandomFromArray(forms.present);
        return `¿Cuál es el pasado de "${randomBase}"?`;
      } 
      if (direction < 0.8) {
        const randomPast = this.getRandomFromArray(forms.past);
        return `¿Cuál es el presente de "${randomPast}"?`;
      }
      
      const randomBase = this.getRandomFromArray(forms.present);
      return `¿Cuál es el participio de "${randomBase}"?`;
    },
    generateQuestionText() {
      if (this.currentVerb.gameRules) {
        const forms = {
          present: this.currentVerb.present.split(' / ').map(f => f.trim()),
          past: this.currentVerb.past.split(' / ').map(f => f.trim())
        };
        return this.generateSpecialQuestion(forms);
      }
      
      const randomType = this.getRandomFromArray(this.availableQuestionTypes);
      return randomType.text(this.currentVerb, this.currentVerbKey);
    },
    generateNewQuestion() {
      this.currentVerbKey = this.getRandomVerbKey();
      this.currentVerb = this.verbs[this.currentVerbKey];
      this.usedVerbKeys.push(this.currentVerbKey);

      this.questionText = this.generateQuestionText();
      this.userAnswer = '';
      this.feedback = '';
      this.isCorrect = false;
      
      this.$nextTick(() => {
        this.$refs.answerInput.focus();
      });
    },
    normalizeAnswer(answer) {
      return answer.trim().toLowerCase().replace('*', '');
    },
    splitVerbForms(forms) {
      return forms.toLowerCase().split('/').map(s => this.normalizeAnswer(s));
    },
    checkSpecialCaseAnswer() {
      const quotedText = this.questionText.match(/"(.+?)"/)[1].toLowerCase();
      
      if (this.questionText.includes('presente de')) {
        const correctAnswers = this.currentVerb.gameRules.pastToBase[quotedText];
        return {
          isCorrect: correctAnswers.some(ans => 
            this.normalizeAnswer(ans) === this.normalizeAnswer(this.userAnswer)
          ),
          correctAnswer: correctAnswers.join(' o ')
        };
      }
      
      if (this.questionText.includes('pasado de')) {
        const correctAnswers = this.currentVerb.gameRules.baseToPast[quotedText];
        return {
          isCorrect: correctAnswers.some(ans => 
            this.normalizeAnswer(ans) === this.normalizeAnswer(this.userAnswer)
          ),
          correctAnswer: correctAnswers.join(' o ')
        };
      }
      
      return {
        isCorrect: this.splitVerbForms(this.currentVerb.participle)
          .includes(this.normalizeAnswer(this.userAnswer)),
        correctAnswer: this.currentVerb.participle
      };
    },
    checkRegularAnswer() {
      if (this.questionText.includes('presente de')) {
        return {
          isCorrect: this.splitVerbForms(this.currentVerb.present)
            .includes(this.normalizeAnswer(this.userAnswer)),
          correctAnswer: this.currentVerb.present
        };
      }
      
      if (this.questionText.includes('pasado de')) {
        return {
          isCorrect: this.splitVerbForms(this.currentVerb.past)
            .includes(this.normalizeAnswer(this.userAnswer)),
          correctAnswer: this.currentVerb.past
        };
      }
      
      return {
        isCorrect: this.splitVerbForms(this.currentVerb.participle)
          .includes(this.normalizeAnswer(this.userAnswer)),
        correctAnswer: this.currentVerb.participle
      };
    },
    checkAnswer() {
      if (!this.userAnswer.trim() || this.isChecking || this.answerLock) return;

      this.isChecking = true;
      
      const { isCorrect, correctAnswer } = this.currentVerb.gameRules 
        ? this.checkSpecialCaseAnswer() 
        : this.checkRegularAnswer();

      this.isCorrect = isCorrect;
      this.feedback = this.isCorrect ? '¡Correcto! 🎉' : `Incorrecto. La respuesta correcta era: ${correctAnswer}`;
      
      if (isCorrect) {
        this.answerLock = true;
        this.score++;
        if (this.score % 3 === 0) {
          this.launchConfetti();
        }
        setTimeout(() => {
          this.generateNewQuestion();
          this.isChecking = false;
          this.answerLock = false;
        }, 1500);
      } else {
        this.attempts++;
        this.isChecking = false;
      }
    },
    close() {
      this.$emit('close');
      this.resetGame();
    },
    resetGame() {
      this.usedVerbKeys = [];
      this.feedback = '';
      this.isCorrect = false;
      this.score = 0;
      this.attempts = 0;
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.generateNewQuestion();
      } else {
        this.resetGame();
      }
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
  font-size: 1.2rem;
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

.quiz-submit:hover:not(:disabled) {
  background-color: var(--primary-light);
}

.quiz-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
  padding: 5px 0;
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

.correct {
  color: var(--success);
}

.wrong {
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

@media (max-width: 480px) {
  .quiz-content {
    width: 95%;
    padding: 15px;
  }
  
  .quiz-question {
    font-size: 1.1rem;
  }
  
  .quiz-reference {
    font-size: 1rem;
  }
}
</style>