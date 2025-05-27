<template>
  <div v-if="show">
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

    <div class="quiz-modal" @click.self="close">
      <div class="quiz-content">
        <div class="quiz-header">
          <h3>Carrera de Verbos ⏱️</h3>
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
          <div class="time-bar">
            <div class="time-left" :style="{ width: `${Math.min(100, (timeLeft / totalTime) * 100)}%` }"></div>
            <span class="time-text">{{ timeLeft }}s</span>
          </div>
          
          <!-- Pregunta -->
          <div class="quiz-display">
            <p class="instruction">Escribe la forma que falta:</p>
            <div class="current-form">{{ currentQuestion }}</div>
            <input 
              v-model="userAnswer" 
              :placeholder="placeholderText"
              ref="answerInput"
              :disabled="timeOver"
              @keyup.enter="checkAnswer"
            />
            <button 
              class="submit-btn" 
              @click="checkAnswer"
              :disabled="timeOver || !userAnswer.trim() || isChecking || answerLock"
            >
              {{ timeOver ? 'Tiempo terminado' : 'Comprobar' }}
            </button>
            <button 
              v-if="timeOver"
              class="restart-btn"
              @click="resetGame"
            >
              Reiniciar Juego
            </button>
          </div>
          
          <!-- Feedback y estadísticas -->
          <div class="quiz-feedback" :class="{ correct: lastCorrect, wrong: !lastCorrect && feedback }">
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
      confetti: null,
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
      
      const verb = this.verbs[this.currentVerbKey];
      const expectedForms = [
        ...(this.currentFormType !== 'present' ? verb.present.toLowerCase().split(' / ') : []),
        ...(this.currentFormType !== 'past' ? verb.past.toLowerCase().split(' / ') : []),
        ...(this.includeParticiple && this.currentFormType !== 'participle' 
          ? verb.participle.toLowerCase().split(' / ') 
          : [])
      ];
      
      const isCorrect = expectedForms.includes(this.userAnswer.toLowerCase().trim());
      this.feedback = isCorrect ? `¡Correcto! +${this.timeBonus}s` : `Incorrecto. Opciones: ${expectedForms.join(' o ')}`;
      
      if (isCorrect) {
        this.answerLock = true;
        this.score++;
        this.timeLeft = Math.min(this.timeLeft + this.timeBonus, this.totalTime); // Limitar al tiempo máximo
        this.launchConfetti();
        setTimeout(() => {
          this.generateQuestion();
          this.isChecking = false;
          this.answerLock = false;
        }, 1500);
      } else {
        this.attempts++;
        this.isChecking = false;
      }
      
      this.lastCorrect = isCorrect;
      setTimeout(this.generateQuestion, 1500);
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
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2147483647;
}

/* Estructura principal */
.quiz-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
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

.quiz-content {
  background: var(--card);
  border-radius: 12px;
  width: 95%;
  max-width: 400px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Cabecera */
.quiz-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.icon-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
}

/* Toggle de participio */
.toggle-container {
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.toggle-text {
  font-size: 14px;
  color: #555;
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
  background-color: #ccc;
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
  background-color: #4CAF50;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* Temporizador */
.time-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 15px;
  position: relative;
}

.time-left {
  height: 100%;
  background: var(--primary-light);
  border-radius: 4px;
  transition: width 1s linear;
}

.time-text {
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 12px;
  color: #555;
}

/* Área de juego */
.quiz-display {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instruction {
  text-align: center;
  margin: 0;
  color: #666;
  font-size: 14px;
}

.current-form {
  font-size: 1.2rem;
  font-weight: 500;
  text-align: center;
  color: #333;
  margin: 5px 0;
  border-radius: 12px;
}

.dark-mode .current-form {
   background-color: white;
   color: black;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
}

input:disabled {
  background: #f5f5f5;
}

/* Botones */
.submit-btn, .restart-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-btn {
  background: var(--primary-light);
  color: white;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.submit-btn:active:not(:disabled) {
  background: var(--primary-light);
}

.restart-btn {
  background: #2196F3;
  color: white;
  margin-top: 8px;
}

.restart-btn:active {
  background: #0b7dda;
}

/* Feedback */
.quiz-feedback {
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  margin: 10px 0;
  font-size: 14px;
}

.quiz-feedback.correct {
  background: #e8f5e9;
  color: #2e7d32;
}

.quiz-feedback.wrong {
  background: #ffebee;
  color: #c62828;
}

/* Estadísticas */
.quiz-stats {
  text-align: center;
  font-size: 14px;
  color: #555;
  margin-top: 10px;
}
</style>