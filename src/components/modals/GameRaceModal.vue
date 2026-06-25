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
                        <h3 id="quiz-title">Carrera de Verbos</h3>
                        <div class="quiz-stats">
                            <span class="stat-item correct"
                                >{{ score }} correctas</span
                            >
                            <span class="stat-item wrong"
                                >{{ attempts }} fallos</span
                            >
                        </div>
                    </div>
                    <button
                        class="close-btn"
                        @click="close"
                        aria-label="Cerrar juego"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                        >
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
                            <span class="toggle-text">Incluir participio</span>
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
                            <div
                                class="time-left"
                                :style="{
                                    width: `${Math.min(100, (timeLeft / totalTime) * 100)}%`,
                                }"
                            ></div>
                        </div>
                        <div class="time-text">{{ timeLeft }}s</div>
                    </div>

                    <!-- Pregunta -->
                    <div class="quiz-display">
                        <div class="quiz-reference">
                            Escribe la forma que falta:
                        </div>
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
                            :disabled="
                                timeOver ||
                                !userAnswer.trim() ||
                                isChecking ||
                                answerLock
                            "
                        >
                            <span v-if="timeOver">Tiempo terminado</span>
                            <span v-else>Comprobar</span>
                        </button>
                        <button
                            v-if="timeOver"
                            class="next-btn"
                            @click="resetGame"
                        >
                            Reiniciar juego
                        </button>
                    </div>

                    <!-- Feedback -->
                    <div
                        class="quiz-feedback"
                        :class="{
                            correct: lastCorrect && feedback,
                            wrong: !lastCorrect && feedback,
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
import { useConfetti } from "@/composables/useConfetti";
import "@/assets/game-modal.css";

export default {
    name: "TimeRaceModal",
    setup() {
        return useConfetti();
    },
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
            userAnswer: "",
            score: 0,
            attempts: 0,
            feedback: "",
            lastCorrect: false,
            timer: null,
            includeParticiple: false,
            timeBonus: 5,
            timeOver: false,
            isChecking: false,
            answerLock: false,
        };
    },
    computed: {
        currentQuestion() {
            if (!this.currentVerbKey) return "";
            const verb = this.verbs[this.currentVerbKey];
            const form = this.currentFormType;
            return `"${verb[form]}" (${this.getFormName(form)})`;
        },
        placeholderText() {
            const forms = {
                present:
                    "Pasado" + (this.includeParticiple ? " o Participio" : ""),
                past:
                    "Presente" +
                    (this.includeParticiple ? " o Participio" : ""),
                participle: "Presente o Pasado",
            };
            return forms[this.currentFormType] || "";
        },
        availableQuestionTypes() {
            return this.includeParticiple
                ? ["present", "past", "participle"]
                : ["present", "past"];
        },
    },
    methods: {
        getFormName(form) {
            return {
                present: "Presente",
                past: "Pasado",
                participle: "Participio",
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
            this.currentVerbKey =
                verbKeys[Math.floor(Math.random() * verbKeys.length)];
            this.currentFormType =
                this.availableQuestionTypes[
                    Math.floor(
                        Math.random() * this.availableQuestionTypes.length,
                    )
                ];
            this.userAnswer = "";
            this.$nextTick(() => this.$refs.answerInput.focus());
        },
        checkAnswer() {
            if (
                !this.userAnswer.trim() ||
                this.timeOver ||
                this.isChecking ||
                this.answerLock
            )
                return;

            this.isChecking = true;

            const verb = this.verbs[this.currentVerbKey];
            const expectedForms = [
                ...(this.currentFormType !== "present"
                    ? verb.present.toLowerCase().split(" / ")
                    : []),
                ...(this.currentFormType !== "past"
                    ? verb.past.toLowerCase().split(" / ")
                    : []),
                ...(this.includeParticiple &&
                this.currentFormType !== "participle"
                    ? verb.participle.toLowerCase().split(" / ")
                    : []),
            ];

            const isCorrect = expectedForms.includes(
                this.userAnswer.toLowerCase().trim(),
            );
            this.feedback = isCorrect
                ? `¡Correcto! +${this.timeBonus}s`
                : `Era: ${expectedForms.join(" o ")}`;

            if (isCorrect) {
                this.answerLock = true;
                this.score++;
                this.timeLeft = Math.min(
                    this.timeLeft + this.timeBonus,
                    this.totalTime,
                );

                if (this.score % 5 === 0) {
                    this.launchConfetti();
                }

                setTimeout(() => {
                    this.generateQuestion();
                    this.feedback = "";
                    this.isChecking = false;
                    this.answerLock = false;
                }, 1000);
            } else {
                this.attempts++;
                setTimeout(() => {
                    this.generateQuestion();
                    this.feedback = "";
                    this.isChecking = false;
                }, 1500); // Mostrar feedback un poco más para respuestas incorrectas
            }

            this.lastCorrect = isCorrect;
        },
        close() {
            clearInterval(this.timer);
            this.$emit("close");
        },
        resetGame() {
            clearInterval(this.timer);
            this.timeLeft = this.totalTime;
            this.score = 0;
            this.attempts = 0;
            this.feedback = "";
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
/* Toggle switch */
.toggle-container {
    margin-bottom: 12px;
    -webkit-tap-highlight-color: transparent;
}

.toggle-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
}

.toggle-text {
    font-size: 0.9rem;
    color: var(--text-light);
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
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
    background-color: var(--line);
    border-radius: 24px;
    transition: 0.3s;
}

.toggle-slider:before {
    content: "";
    position: absolute;
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: var(--surface);
    border-radius: 50%;
    transition: 0.3s;
    box-shadow: var(--shadow-sm);
}

.toggle-switch input:checked + .toggle-slider {
    background-color: var(--accent);
}

.toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(20px);
}

/* Temporizador */
.time-container {
    margin-bottom: 12px;
}

.time-bar {
    height: 8px;
    background: var(--line);
    border-radius: 4px;
    overflow: hidden;
}

.time-left {
    height: 100%;
    background: var(--accent);
    transition: width 1s linear;
}

.time-text {
    text-align: right;
    font-size: 0.8rem;
    color: var(--text-light);
    margin-top: 4px;
}

/* Área de juego */
.quiz-display {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.quiz-input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    background: var(--surface);
    color: var(--ink);
    min-width: 0;
    text-align: center;
    font-family: var(--font-body);
}

.quiz-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--focus-ring);
}

.quiz-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.quiz-submit {
    width: 100%;
    padding: 14px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: var(--transition);
}

.quiz-submit:hover:not(:disabled) {
    background: var(--accent-dark);
    transform: translateY(-1px);
}

.quiz-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.next-btn {
    width: 100%;
    padding: 14px;
    background: var(--ink);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.next-btn:hover {
    opacity: 0.85;
    transform: translateY(-1px);
}

/* Feedback */
.quiz-feedback {
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    text-align: center;
    font-weight: 500;
    font-size: 0.95rem;
    line-height: 1.3;
}

.quiz-feedback.correct {
    background: var(--accent-soft);
    color: var(--accent-dark);
    border: 1px solid var(--accent);
}

.quiz-feedback.wrong {
    background: var(--warn-soft);
    color: var(--warn);
    border: 1px solid var(--warn);
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
        border-radius: var(--radius);
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

    .quiz-submit,
    .next-btn {
        padding: 12px;
        font-size: 0.9rem;
    }
}
</style>
