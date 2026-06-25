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
                        <h3 id="quiz-title">Verbos Irregulares</h3>
                        <div class="quiz-stats">
                            <span class="stat-item correct"
                                >{{ score }} correctas</span
                            >
                            <span class="stat-item wrong"
                                >{{ attempts }} intentos</span
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
                        />
                        <button
                            class="quiz-submit"
                            @click="checkAnswer"
                            :disabled="
                                !userAnswer.trim() || isChecking || answerLock
                            "
                        >
                            <span
                                v-if="isChecking"
                                class="spinner"
                                aria-hidden="true"
                            ></span>
                            <svg
                                v-else
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                                aria-hidden="true"
                            >
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </button>
                    </div>

                    <!-- Feedback -->
                    <div
                        class="quiz-feedback"
                        :class="{
                            correct: isCorrect && feedback,
                            wrong: !isCorrect && feedback,
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

// Modal: Juego clásico de preguntas
// - Genera preguntas aleatorias sobre formas verbales
// - Soporta reglas especiales (gameRules) para verbos con múltiples mapeos
const QUESTION_TYPES = [
    {
        type: "base_to_past",
        text: (verb, verbKey) => `¿Pasado de "${verb.present}"?`,
    },
    {
        type: "base_to_participle",
        text: (verb, verbKey) => `¿Participio de "${verb.present}"?`,
    },
    {
        type: "past_to_present",
        text: (verb, verbKey) => `¿Presente de "${verb.past}"?`,
    },
];

export default {
    name: "GameQuizModal",
    setup() {
        return useConfetti();
    },
    props: {
        show: {
            type: Boolean,
            required: true,
        },
        verbs: {
            type: Object,
            required: true,
        },
        showParticiple: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            currentVerbKey: null,
            currentVerb: null,
            questionText: "",
            userAnswer: "",
            feedback: "",
            isCorrect: false,
            score: 0,
            attempts: 0,
            usedVerbKeys: [],
            isChecking: false,
            answerLock: false,
        };
    },
    computed: {
        availableQuestionTypes() {
            return QUESTION_TYPES.filter((type) => {
                if (type.type.includes("participle"))
                    return this.showParticiple;
                return true;
            });
        },
        unusedVerbKeys() {
            return Object.keys(this.verbs).filter(
                (key) => !this.usedVerbKeys.includes(key),
            );
        },
    },
    methods: {
        getVerbReference(verb) {
            return verb.meanings?.map((m) => m.present).join(" / ") || "";
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
            // Si el verbo define gameRules, se usa el mapeo explícito para generar la pregunta
            if (this.currentVerb.gameRules) {
                const forms = {
                    present: this.currentVerb.present
                        .split(" / ")
                        .map((f) => f.trim()),
                    past: this.currentVerb.past
                        .split(" / ")
                        .map((f) => f.trim()),
                };

                if (Math.random() < 0.5) {
                    const randomBase = this.getRandomFromArray(forms.present);
                    return `¿Pasado de "${randomBase}"?`;
                } else {
                    const randomPast = this.getRandomFromArray(forms.past);
                    return `¿Presente de "${randomPast}"?`;
                }
            }

            const randomType = this.getRandomFromArray(
                this.availableQuestionTypes,
            );
            return randomType.text(this.currentVerb, this.currentVerbKey);
        },

        generateNewQuestion() {
            this.currentVerbKey = this.getRandomVerbKey();
            this.currentVerb = this.verbs[this.currentVerbKey];
            this.usedVerbKeys.push(this.currentVerbKey);

            this.questionText = this.generateQuestionText();
            this.userAnswer = "";
            this.feedback = "";
            this.isCorrect = false;

            this.$nextTick(() => {
                if (this.$refs.answerInput) {
                    this.$refs.answerInput.focus();
                }
            });
        },

        normalizeAnswer(answer) {
            return answer.trim().toLowerCase().replace(/[*]/g, "");
        },

        splitVerbForms(forms) {
            return forms
                .toLowerCase()
                .split("/")
                .map((s) => this.normalizeAnswer(s));
        },

        checkAnswer() {
            // Normaliza y compara la respuesta contra las formas válidas
            if (!this.userAnswer.trim() || this.isChecking || this.answerLock)
                return;

            this.isChecking = true;

            let isCorrect = false;
            let correctAnswer = "";

            if (this.currentVerb.gameRules) {
                const quotedMatch = this.questionText.match(/"(.+?)"/);
                if (quotedMatch) {
                    const quotedText = quotedMatch[1].toLowerCase();

                    if (this.questionText.includes("Presente de")) {
                        const correctAnswers =
                            this.currentVerb.gameRules.pastToBase[quotedText];
                        isCorrect =
                            correctAnswers?.some(
                                (ans) =>
                                    this.normalizeAnswer(ans) ===
                                    this.normalizeAnswer(this.userAnswer),
                            ) || false;
                        correctAnswer = correctAnswers?.join(" o ") || "";
                    } else {
                        const correctAnswers =
                            this.currentVerb.gameRules.baseToPast[quotedText];
                        isCorrect =
                            correctAnswers?.some(
                                (ans) =>
                                    this.normalizeAnswer(ans) ===
                                    this.normalizeAnswer(this.userAnswer),
                            ) || false;
                        correctAnswer = correctAnswers?.join(" o ") || "";
                    }
                }
            } else {
                if (this.questionText.includes("Presente de")) {
                    isCorrect = this.splitVerbForms(
                        this.currentVerb.present || "",
                    ).includes(this.normalizeAnswer(this.userAnswer));
                    correctAnswer = this.currentVerb.present || "";
                } else if (this.questionText.includes("Pasado de")) {
                    isCorrect = this.splitVerbForms(
                        this.currentVerb.past || "",
                    ).includes(this.normalizeAnswer(this.userAnswer));
                    correctAnswer = this.currentVerb.past || "";
                } else {
                    isCorrect = this.splitVerbForms(
                        this.currentVerb.participle || "",
                    ).includes(this.normalizeAnswer(this.userAnswer));
                    correctAnswer = this.currentVerb.participle || "";
                }
            }

            this.isCorrect = isCorrect;
            this.feedback = isCorrect ? "¡Correcto!" : `Era: ${correctAnswer}`;

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
                    this.userAnswer = "";
                    this.feedback = "";
                }, 2000);
            }
        },

        close() {
            this.$emit("close");
            this.resetGame();
        },

        resetGame() {
            this.usedVerbKeys = [];
            this.feedback = "";
            this.isCorrect = false;
            this.score = 0;
            this.attempts = 0;
            this.isChecking = false;
            this.answerLock = false;
            this.userAnswer = "";
        },
    },

    watch: {
        show(newVal) {
            if (newVal) {
                this.resetGame();
                this.generateNewQuestion();
            }
        },
    },
};
</script>

<style scoped>
.input-section {
    display: flex;
    gap: 8px;
    align-items: stretch;
}

.quiz-input {
    flex: 1;
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    background: var(--surface);
    color: var(--ink);
    min-width: 0;
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
    width: 44px;
    height: 44px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
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

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
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
    background: var(--accent-soft);
    color: var(--accent-dark);
    border: 1px solid var(--accent);
}

.quiz-feedback.wrong {
    background: var(--warn-soft);
    color: var(--warn);
    border: 1px solid var(--warn);
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

    .quiz-submit {
        width: 40px;
        height: 40px;
    }
}
</style>
