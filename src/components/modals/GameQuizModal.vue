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
        <!-- Header compacto -->
        <div class="quiz-header">
          <div class="header-left">
            <h3 id="quiz-title">🌚 Verbos Irregulares</h3>
            <div class="quiz-stats">
              <span class="stat-item correct">✅ {{ score }}</span>
              <span class="stat-item wrong">❌ {{ attempts }}</span>
            </div>
          </div>
          <button 
            class="close-btn"
            @click="close"
            aria-label="Cerrar juego"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Contenido principal optimizado -->
        <div class="quiz-body">
          <!-- Referencia del verbo -->
          <div class="quiz-reference" v-if="currentVerb">
            {{ getVerbReference(currentVerb) }}
          </div>

          <!-- Pregunta -->
          <div class="quiz-question">
            {{ questionText }}
          </div>

          <!-- Input y botón -->
          <div class="input-section">
            <input 
              type="text" 
              class="quiz-input" 
              placeholder="Tu respuesta..."
              v-model.trim="userAnswer"
              @keyup.enter="checkAnswer"
              ref="answerInput"
              aria-label="Respuesta"
              :disabled="answerLock"
            >
            <button 
              class="quiz-submit"
              @click="checkAnswer"
              :disabled="!userAnswer.trim() || isChecking || answerLock"
            >
              <span v-if="isChecking">⏳</span>
              <span v-else>✓</span>
            </button>
          </div>

          <!-- Feedback -->
          <div 
            class="quiz-feedback"
            :class="{ 
              'correct': isCorrect && feedback, 
              'wrong': !isCorrect && feedback
            }"
            v-show="feedback"
            aria-live="polite"
          >
            {{ feedback }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import confetti from 'canvas-confetti';

const QUESTION_TYPES = [
  { type: 'base_to_past', text: (verb, verbKey) => `¿Pasado de "${verb.present}"?` },
  { type: 'base_to_participle', text: (verb, verbKey) => `¿Participio de "${verb.present}"?` },
  { type: 'past_to_present', text: (verb, verbKey) => `¿Presente de "${verb.past}"?` }
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
      return verb.meanings?.map(m => m.present).join(" / ") || '';
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
    
    generateQuestionText() {
      if (this.currentVerb.gameRules) {
        const forms = {
          present: this.currentVerb.present.split(' / ').map(f => f.trim()),
          past: this.currentVerb.past.split(' / ').map(f => f.trim())
        };
        
        if (Math.random() < 0.5) {
          const randomBase = this.getRandomFromArray(forms.present);
          return `¿Pasado de "${randomBase}"?`;
        } else {
          const randomPast = this.getRandomFromArray(forms.past);
          return `¿Presente de "${randomPast}"?`;
        }
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
        if (this.$refs.answerInput) {
          this.$refs.answerInput.focus();
        }
      });
    },
    
    normalizeAnswer(answer) {
      return answer.trim().toLowerCase().replace(/[*]/g, '');
    },
    
    splitVerbForms(forms) {
      return forms.toLowerCase().split('/').map(s => this.normalizeAnswer(s));
    },
    
    checkAnswer() {
      if (!this.userAnswer.trim() || this.isChecking || this.answerLock) return;

      this.isChecking = true;
      
      let isCorrect = false;
      let correctAnswer = '';
      
      if (this.currentVerb.gameRules) {
        const quotedMatch = this.questionText.match(/"(.+?)"/);
        if (quotedMatch) {
          const quotedText = quotedMatch[1].toLowerCase();
          
          if (this.questionText.includes('Presente de')) {
            const correctAnswers = this.currentVerb.gameRules.pastToBase[quotedText];
            isCorrect = correctAnswers?.some(ans => 
              this.normalizeAnswer(ans) === this.normalizeAnswer(this.userAnswer)
            ) || false;
            correctAnswer = correctAnswers?.join(' o ') || '';
          } else {
            const correctAnswers = this.currentVerb.gameRules.baseToPast[quotedText];
            isCorrect = correctAnswers?.some(ans => 
              this.normalizeAnswer(ans) === this.normalizeAnswer(this.userAnswer)
            ) || false;
            correctAnswer = correctAnswers?.join(' o ') || '';
          }
        }
      } else {
        if (this.questionText.includes('Presente de')) {
          isCorrect = this.splitVerbForms(this.currentVerb.present || '')
            .includes(this.normalizeAnswer(this.userAnswer));
          correctAnswer = this.currentVerb.present || '';
        } else if (this.questionText.includes('Pasado de')) {
          isCorrect = this.splitVerbForms(this.currentVerb.past || '')
            .includes(this.normalizeAnswer(this.userAnswer));
          correctAnswer = this.currentVerb.past || '';
        } else {
          isCorrect = this.splitVerbForms(this.currentVerb.participle || '')
            .includes(this.normalizeAnswer(this.userAnswer));
          correctAnswer = this.currentVerb.participle || '';
        }
      }

      this.isCorrect = isCorrect;
      this.feedback = isCorrect 
        ? '¡Correcto! 🎉' 
        : `❌ Era: ${correctAnswer}`;
      
      if (isCorrect) {
        this.answerLock = true;
        this.score++;
        
        if (this.score % 5 === 0) {
          this.launchConfetti();
        }
        
        setTimeout(() => {
          this.generateNewQuestion();
          this.isChecking = false;
          this.answerLock = false;
        }, 1200);
      } else {
        this.attempts++;
        setTimeout(() => {
          this.isChecking = false;
          this.userAnswer = '';
          this.feedback = '';
        }, 2000);
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
      this.isChecking = false;
      this.answerLock = false;
      this.userAnswer = '';
    }
  },
  
  watch: {
    show(newVal) {
      if (newVal) {
        this.resetGame();
        this.generateNewQuestion();
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
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.quiz-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px;
  box-sizing: border-box;
}

.quiz-content {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  padding: 20px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
}

.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.quiz-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #1f2937;
  line-height: 1.2;
}

.quiz-stats {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.stat-item.correct {
  color: #10b981;
}

.stat-item.wrong {
  color: #ef4444;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  background: #f9fafb;
  color: #6b7280;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.quiz-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.quiz-reference {
  font-size: 0.95rem;
  text-align: center;
  padding: 8px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  font-weight: 500;
  line-height: 1.3;
  word-break: break-word;
}

.quiz-question {
  font-size: 1.1rem;
  padding: 14px 16px;
  background: white;
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
  border: 1px solid #e5e7eb;
}

.input-section {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.quiz-input {
  flex: 1;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: #ffffff;
  color: #1f2937;
  min-width: 0;
}

.quiz-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.quiz-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quiz-submit {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quiz-submit:hover:not(:disabled) {
  transform: translateY(-1px);
}

.quiz-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quiz-feedback {
  padding: 10px 14px;
  border-radius: 10px;
  text-align: center;
  font-weight: 500;
  font-size: 0.95rem;
  line-height: 1.3;
}

.quiz-feedback.correct {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

.quiz-feedback.wrong {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

@media (max-width: 480px) {
  .quiz-modal {
    padding: 8px;
    align-items: flex-start;
    padding-top: 60px;
  }
  
  .quiz-content {
    max-width: none;
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    max-height: calc(100vh - 80px);
  }
  
  .quiz-header h3 {
    font-size: 1rem;
  }
  
  .quiz-question {
    font-size: 1rem;
    padding: 12px 14px;
  }
  
  .quiz-reference {
    font-size: 0.9rem;
    padding: 8px 10px;
  }
  
  .quiz-input {
    font-size: 16px;
    padding: 12px;
  }
  
  .quiz-submit {
    width: 40px;
    height: 40px;
  }
}

@media (prefers-color-scheme: dark) {
  .quiz-content {
    background: #1f2937;
    border-color: #374151;
  }
  
  .quiz-header h3 {
    color: #f9fafb;
  }
  
  .quiz-question {
    background: #1f2937;
    color: #f9fafb;
    border-color: #374151;
  }
  
  .quiz-input {
    background: #1f2937;
    color: #f9fafb;
    border-color: #374151;
  }
  
  .close-btn {
    background: #374151;
    color: #9ca3af;
  }
  
  .close-btn:hover {
    background: #dc2626;
    color: white;
  }
}
</style>