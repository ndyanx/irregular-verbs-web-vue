<template>
  <div v-if="show">
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

    <div class="quiz-modal" @click.self="close" role="dialog" aria-labelledby="quiz-title" aria-modal="true">
      <div class="quiz-content">
        <!-- Header compacto -->
        <div class="quiz-header">
          <div class="header-left">
            <h3 id="quiz-title">🌚 Carrera de Verbos</h3>
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

        <!-- Contenido principal -->
        <div class="quiz-body">
          <!-- Configuración de Participio -->
          <div class="toggle-container">
            <label class="toggle-label">
              <span class="toggle-text">Incluir Participio</span>
              <div class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="includeParticiple" 
                  @change="resetGame"
                />
                <span class="toggle-slider"></span>
              </div>
            </label>
          </div>

          <!-- Temporizador -->
          <div class="time-container">
            <div class="time-bar">
              <div class="time-left" :style="{ width: `${Math.min(100, (timeLeft / totalTime) * 100)}%` }"></div>
            </div>
            <div class="time-text">{{ timeLeft }}s</div>
          </div>
          
          <!-- Pregunta -->
          <div class="quiz-display">
            <div class="quiz-reference">Escribe la forma que falta:</div>
            <div class="quiz-question">{{ currentQuestion }}</div>
            <input 
              v-model="userAnswer" 
              :placeholder="placeholderText"
              ref="answerInput"
              :disabled="timeOver"
              @keyup.enter="checkAnswer"
              class="quiz-input"
            />
            <button 
              class="quiz-submit" 
              @click="checkAnswer"
              :disabled="timeOver || !userAnswer.trim() || isChecking || answerLock"
            >
              <span v-if="timeOver">⏰ Tiempo terminado</span>
              <span v-else>✓ Comprobar</span>
            </button>
            <button 
              v-if="timeOver"
              class="next-btn"
              @click="resetGame"
            >
              🔄 Reiniciar Juego
            </button>
          </div>
          
          <!-- Feedback -->
          <div 
            class="quiz-feedback"
            :class="{ 
              'correct': lastCorrect && feedback, 
              'wrong': !lastCorrect && feedback
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

export default {
  name: 'TimeRaceModal',
  props: {
    show: Boolean,
    verbs: Object,
  },
  data() {
    return {
      timeLeft: 40,
      totalTime: 40,
      currentVerbKey: null,
      currentFormType: null,
      userAnswer: '',
      score: 0,
      attempts: 0,
      feedback: '',
      lastCorrect: false,
      timer: null,
      includeParticiple: false,
      timeBonus: 5,
      timeOver: false,
      isChecking: false,
      answerLock: false
    };
  },
  computed: {
    currentQuestion() {
      if (!this.currentVerbKey) return '';
      const verb = this.verbs[this.currentVerbKey];
      const form = this.currentFormType;
      return `"${verb[form]}" (${this.getFormName(form)})`;
    },
    placeholderText() {
      const forms = {
        present: 'Pasado' + (this.includeParticiple ? ' o Participio' : ''),
        past: 'Presente' + (this.includeParticiple ? ' o Participio' : ''),
        participle: 'Presente o Pasado'
      };
      return forms[this.currentFormType] || '';
    },
    availableQuestionTypes() {
      return this.includeParticiple 
        ? ['present', 'past', 'participle'] 
        : ['present', 'past'];
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
    getFormName(form) {
      return {
        present: 'Presente',
        past: 'Pasado',
        participle: 'Participio'
      }[form];
    },
    startTimer() {
      this.timeOver = false;
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.timeOver = true;
          clearInterval(this.timer);
          this.feedback = "¡Se acabó el tiempo!";
        }
      }, 1000);
    },
    generateQuestion() {
      const verbKeys = Object.keys(this.verbs);
      this.currentVerbKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
      this.currentFormType = this.availableQuestionTypes[
        Math.floor(Math.random() * this.availableQuestionTypes.length)
      ];
      this.userAnswer = '';
      this.$nextTick(() => this.$refs.answerInput.focus());
    },
    checkAnswer() {
      if (!this.userAnswer.trim() || this.timeOver || this.isChecking || this.answerLock) return;
      
      this.isChecking = true;
      
      const verb = this.verbs[this.currentVerbKey];
      const expectedForms = [
        ...(this.currentFormType !== 'present' ? verb.present.toLowerCase().split(' / ') : []),
        ...(this.currentFormType !== 'past' ? verb.past.toLowerCase().split(' / ') : []),
        ...(this.includeParticiple && this.currentFormType !== 'participle' 
          ? verb.participle.toLowerCase().split(' / ') 
          : [])
      ];
      
      const isCorrect = expectedForms.includes(this.userAnswer.toLowerCase().trim());
      this.feedback = isCorrect ? `¡Correcto! +${this.timeBonus}s` : `Era: ${expectedForms.join(' o ')}`;
      
      if (isCorrect) {
        this.answerLock = true;
        this.score++;
        this.timeLeft = Math.min(this.timeLeft + this.timeBonus, this.totalTime);
        
        if (this.score % 5 === 0) {
          this.launchConfetti();
        }
        
        setTimeout(() => {
          this.generateQuestion();
          this.feedback = '';
          this.isChecking = false;
          this.answerLock = false;
        }, 1000);
      } else {
        this.attempts++;
        setTimeout(() => {
          this.generateQuestion();
          this.feedback = '';
          this.isChecking = false;
        }, 1500); // Mostrar feedback un poco más para respuestas incorrectas
      }
      
      this.lastCorrect = isCorrect;
    },
    close() {
      clearInterval(this.timer);
      this.$emit('close');
    },
    resetGame() {
      clearInterval(this.timer);
      this.timeLeft = this.totalTime;
      this.score = 0;
      this.attempts = 0;
      this.feedback = '';
      this.timeOver = false;
      this.lastCorrect = false;
      this.generateQuestion();
      this.startTimer();
    },
  },
  watch: {
    show(val) {
      if (val) this.resetGame();
      else clearInterval(this.timer);
    },
  },
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 420px;
  padding: 20px;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
}

/* Header optimizado */
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
  transition: all 0.2s ease;
  background: #f9fafb;
  color: #6b7280;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Contenido principal */
.quiz-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Toggle switch */
.toggle-container {
  margin-bottom: 12px;
  -webkit-tap-highlight-color: transparent; /* Elimina el destello azul */
}

.toggle-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.toggle-text {
  font-size: 0.9rem;
  color: #6b7280;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e5e7eb;
  border-radius: 24px;
  transition: .3s;
}

.toggle-slider:before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .3s;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #10b981;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* Temporizador */
.time-container {
  margin-bottom: 12px;
}

.time-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.time-left {
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transition: width 1s linear;
}

.time-text {
  text-align: right;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 4px;
}

/* Área de juego */
.quiz-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.quiz-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: #ffffff;
  color: #1f2937;
  min-width: 0;
  text-align: center;
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
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.quiz-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.quiz-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.next-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.next-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

/* Feedback */
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

/* Responsive */
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
  
  .quiz-submit, .next-btn {
    padding: 12px;
    font-size: 0.9rem;
  }
}

/* Dark mode support */
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
  
  .toggle-slider {
    background-color: #4b5563;
  }
  
  .time-bar {
    background-color: #4b5563;
  }
}
</style>