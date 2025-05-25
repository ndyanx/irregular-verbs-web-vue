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
          <div id="quiz-reference" class="quiz-reference">{{ currentVerb ? getVerbReference(currentVerb) : '' }}</div>
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
  </div>
</template>

<script>
import confetti from 'canvas-confetti';

export default {
  name: 'QuizModal',
  props: {
    show: Boolean,
    verbs: Object,
    showParticiple: Boolean
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
      questionTypes: [
        { type: 'base_to_past', text: (verb, verbKey) => `¿Cuál es el pasado de "${verb.present}"?` },
        { type: 'base_to_participle', text: (verb, verbKey) => `¿Cuál es el participio de "${verb.present}"?` },
        { type: 'past_to_present', text: (verb, verbKey) => `¿Cuál es el presente de "${verb.past}"?` }
      ]
    }
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
      const availableTypes = this.questionTypes.filter(type => {
        if (type.type.includes('participle')) return this.showParticiple;
        return true;
      });

      const unusedVerbKeys = Object.keys(this.verbs)
        .filter(key => !this.usedVerbKeys.includes(key));

      if (unusedVerbKeys.length === 0) {
        this.usedVerbKeys = [];
        unusedVerbKeys.push(...Object.keys(this.verbs));
      }

      const randomKey = unusedVerbKeys[Math.floor(Math.random() * unusedVerbKeys.length)];
      this.currentVerbKey = randomKey;
      this.currentVerb = this.verbs[randomKey];
      // hack
      // this.currentVerbKey = "have";
      // this.currentVerb = this.verbs["have"];
      this.usedVerbKeys.push(randomKey);

      const hasSpecialRules = this.currentVerb.gameRules;
      
      if (hasSpecialRules) {
        const forms = {
          present: this.currentVerb.present.split(' / ').map(f => f.trim()),
          past: this.currentVerb.past.split(' / ').map(f => f.trim())
        };

        const direction = Math.random();
        
        if (direction < 0.4) {
          const randomBase = forms.present[Math.floor(Math.random() * forms.present.length)];
          this.questionText = `¿Cuál es el pasado de "${randomBase}"?`;
        } else if (direction < 0.8) {
          const randomPast = forms.past[Math.floor(Math.random() * forms.past.length)];
          this.questionText = `¿Cuál es el presente de "${randomPast}"?`;
        } else {
          const randomBase = forms.present[Math.floor(Math.random() * forms.present.length)];
          this.questionText = `¿Cuál es el participio de "${randomBase}"?`;
        }
      } else {
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        this.questionText = randomType.text(this.currentVerb, this.currentVerbKey);
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

      const gameRules = currentVerb.gameRules;
      const verbPresent = currentVerb.present.toLowerCase().split('/').map(s => s.trim());
      const verbPast = currentVerb.past.toLowerCase().split('/').map(s => s.trim());
      const verbParticiple = currentVerb.participle.toLowerCase().split('/').map(s => s.trim().replace('*', ''));

      if (gameRules) {
        if (this.questionText.includes('presente de')) {
          const PresentForm = this.questionText.match(/"(.+?)"/)[1].toLowerCase();
          correctAnswer = gameRules.pastToBase[PresentForm].join(' o ');
          isCorrect = gameRules.pastToBase[PresentForm].some(ans => 
            ans.toLowerCase() === userAnswer
          );
        } 
        else if (this.questionText.includes('pasado de')) {
          const pastForm = this.questionText.match(/"(.+?)"/)[1].toLowerCase();
          correctAnswer = gameRules.baseToPast[pastForm].join(' o ');
          isCorrect = gameRules.baseToPast[pastForm].some(ans => 
            ans.toLowerCase() === userAnswer
          );
        }
        else if (this.questionText.includes('participio de')) {
          correctAnswer = currentVerb.participle;
          isCorrect = verbParticiple.includes(userAnswer);
        }
      } else {
        if (this.questionText.includes('presente de')) {
          correctAnswer = currentVerb.present;
          isCorrect = verbPresent.includes(userAnswer);
        } 
        else if (this.questionText.includes('pasado de')) {
          correctAnswer = currentVerb.past;
          isCorrect = verbPast.includes(userAnswer);
        }
        else if (this.questionText.includes('participio de')) {
          correctAnswer = currentVerb.participle;
          isCorrect = verbParticiple.includes(userAnswer);
        }
      }

      this.attempts++;
      if (isCorrect) {
        this.score++;
        this.launchConfetti();
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
      this.usedVerbKeys = [];
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
/* @keyframes correctAnswer {
  0% { background-color: rgba(76, 201, 240, 0.1); }
  50% { background-color: rgba(76, 201, 240, 0.3); }
  100% { background-color: rgba(76, 201, 240, 0.1); }
}

@keyframes wrongAnswer {
  0% { background-color: rgba(247, 37, 133, 0.1); }
  50% { background-color: rgba(247, 37, 133, 0.3); }
  100% { background-color: rgba(247, 37, 133, 0.1); }
} */

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

.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2147483647; /* asegúrate que esté por encima del modal */
}
</style>