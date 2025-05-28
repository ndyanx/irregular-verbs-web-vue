<template>
  <div v-if="show">
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>

    <div class="quiz-modal" @click.self="close" role="dialog" aria-labelledby="quiz-title" aria-modal="true">
      <div class="quiz-content">
        <!-- Header compacto -->
        <div class="quiz-header">
          <div class="header-left">
            <h3 id="quiz-title">🌚 Emparejar Verbos</h3>
            <div class="quiz-stats">
              <span class="stat-item correct">✅ {{ score }}</span>
              <span class="stat-item wrong">❌ {{ attempts }}</span>
              <span class="stat-item">📊 {{ accuracy }}%</span>
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
          <!-- Selector de modo de juego -->
          <div class="game-mode-container">
            <h4 class="mode-title">Modo de juego:</h4>
            <div class="game-mode-selector">
              <button
                v-for="mode in gameModes"
                :key="mode.value"
                @click="changeGameMode(mode.value)"
                :class="{ active: gameMode === mode.value }"
                class="mode-btn"
              >
                <span class="mode-icon">{{ mode.icon }}</span>
                <span>{{ mode.label }}</span>
              </button>
            </div>
          </div>

          <!-- Pantalla de significado -->
          <div class="quiz-reference">
            Encuentra el verbo que significa:
          </div>
          <div class="quiz-question">
            {{ currentMeaning }}
          </div>

          <!-- Grid de verbos -->
          <div class="verbs-container">
            <div class="verbs-grid">
              <div 
                v-for="(verb, index) in shuffledVerbs" 
                :key="`${questionKey}-${index}`"
                class="verb-card"
                :class="getVerbCardClass(index)"
                @click="selectVerb(index)"
              >
                <div class="verb-text">{{ verb[gameMode] }}</div>
                <div v-if="feedback && correctIndices.includes(index)" class="card-icon correct-icon">✓</div>
                <div v-else-if="feedback && selectedVerbs.includes(index)" class="card-icon wrong-icon">✗</div>
              </div>
            </div>
          </div>

          <!-- Botón siguiente -->
          <button 
            v-if="feedback" 
            class="next-btn" 
            @click="generateNewQuestion"
          >
            <span class="btn-icon">🎯</span>
            <span>Siguiente pregunta</span>
          </button>
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
      questionKey: 0,
      gameModes: [
        { value: 'present', label: 'Presente', icon: '🔄' },
        { value: 'past', label: 'Pasado', icon: '⏮️' },
        { value: 'participle', label: 'Participio', icon: '✨' },
      ],
    };
  },
  computed: {
    currentMeaning() {
      if (!this.currentVerb) return '';
      return this.currentVerb.meanings.map(m => m[this.gameMode]).join(" / ");
    },
    accuracy() {
      const total = this.score + this.attempts;
      return total > 0 ? Math.round((this.score / total) * 100) : 100;
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
      if (verbKeys.length < 4) return;
      
      this.currentVerbKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
      this.currentVerb = this.verbs[this.currentVerbKey];
      
      const incorrectVerbs = this.getIncorrectVerbs(verbKeys, 3);
      
      this.shuffledVerbs = [this.currentVerb, ...incorrectVerbs]
        .sort(() => Math.random() - 0.5);
      
      this.correctIndices = this.shuffledVerbs
        .map((verb, index) => verb[this.gameMode] === this.currentVerb[this.gameMode] ? index : -1)
        .filter(index => index !== -1);
      
      this.resetQuestionState();
      this.questionKey++;
    },

    getIncorrectVerbs(verbKeys, count) {
      const incorrectVerbs = [];
      const usedKeys = new Set([this.currentVerbKey]);
      
      while (incorrectVerbs.length < count && usedKeys.size < verbKeys.length) {
        const randomKey = verbKeys[Math.floor(Math.random() * verbKeys.length)];
        if (!usedKeys.has(randomKey)) {
          const verb = this.verbs[randomKey];
          if (verb[this.gameMode] !== this.currentVerb[this.gameMode]) {
            incorrectVerbs.push(verb);
            usedKeys.add(randomKey);
          }
        }
      }
      
      return incorrectVerbs;
    },

    selectVerb(index) {
      if (this.feedback || this.selectedVerbs.length > 0) return;
      
      this.selectedVerbs = [index];
      this.isCorrect = this.correctIndices.includes(index);
      
      this.feedback = this.isCorrect ? '¡Correcto! 🎉' : 'Incorrecto, intenta de nuevo.';
      
      if (this.isCorrect) {
        this.score++;
        if (this.score % 5 === 0) {
          this.launchConfetti();
        }
      } else {
        this.attempts++;
      }
    },

    getVerbCardClass(index) {
      return {
        selected: !this.feedback && this.selectedVerbs.includes(index),
        correct: this.feedback && this.correctIndices.includes(index),
        wrong: this.feedback && this.selectedVerbs.includes(index) && !this.correctIndices.includes(index),
      };
    },

    changeGameMode(mode) {
      if (mode !== this.gameMode) {
        this.gameMode = mode;
        this.generateNewQuestion();
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
      this.questionKey = 0;
    },

    close() {
      this.$emit('close');
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.generateNewQuestion();
      } else {
        this.resetQuiz();
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 500px;
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
  color: white;
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

.game-mode-container {
  margin-bottom: 8px;
}

.mode-title {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 500;
}

.game-mode-selector {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 25px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
}

.mode-btn:hover {
  border-color: #818cf8;
  color: #6366f1;
}

.mode-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #6366f1;
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

/* Grid de verbos */
.verbs-container {
  margin-bottom: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.verbs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  flex: 1;
  align-content: start;
}

.verb-card {
  position: relative;
  padding: 16px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  text-align: center;
  background: #ffffff;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.verb-card:hover {
  border-color: #818cf8;
  transform: translateY(-2px);
}

.verb-card.selected {
  border-color: #6366f1;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
}

.verb-card.correct {
  border-color: #10b981;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1));
}

.verb-card.wrong {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.1));
}

.verb-text {
  font-weight: 600;
  font-size: 1rem;
  color: #1f2937;
}

.card-icon {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.7rem;
}

.correct-icon {
  background: #10b981;
  color: white;
}

.wrong-icon {
  background: #ef4444;
  color: white;
}

/* Botón siguiente */
.next-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.next-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-icon {
  font-size: 1.1rem;
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
  
  .quiz-stats {
    font-size: 0.8rem;
    gap: 8px;
  }
  
  .quiz-question {
    font-size: 1rem;
    padding: 12px 14px;
  }
  
  .verbs-grid {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .verb-card {
    padding: 12px 8px;
    min-height: 45px;
  }
  
  .verb-text {
    font-size: 0.9rem;
  }
  
  .next-btn {
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
  
  .verb-card {
    background: #1f2937;
    border-color: #374151;
  }
  
  .verb-text {
    color: #f9fafb;
  }
  
  .close-btn {
    background: #374151;
    color: #9ca3af;
  }
  
  .close-btn:hover {
    background: #dc2626;
    color: white;
  }
  
  .mode-btn {
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .mode-btn:hover {
    border-color: #818cf8;
    color: #818cf8;
  }
  
  .mode-btn.active {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  }
}
</style>