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
                        <h3 id="quiz-title">Emparejar Verbos</h3>
                        <div class="quiz-stats">
                            <span class="stat-item correct"
                                >{{ score }} correctas</span
                            >
                            <span class="stat-item wrong"
                                >{{ attempts }} fallos</span
                            >
                            <span class="stat-item"
                                >{{ accuracy }}% precisión</span
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
                    <!-- Selector de modo de juego -->
                    <div class="game-mode-container">
                        <h4 class="mode-title">Modo de juego</h4>
                        <div class="game-mode-selector">
                            <button
                                v-for="mode in gameModes"
                                :key="mode.value"
                                @click="changeGameMode(mode.value)"
                                :class="{ active: gameMode === mode.value }"
                                class="mode-btn"
                            >
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
                                <div class="verb-text">
                                    {{ verb[gameMode] }}
                                </div>
                                <div
                                    v-if="
                                        feedback &&
                                        correctIndices.includes(index)
                                    "
                                    class="card-icon correct-icon"
                                >
                                    <svg
                                        width="11"
                                        height="11"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="3"
                                    >
                                        <polyline
                                            points="20 6 9 17 4 12"
                                        ></polyline>
                                    </svg>
                                </div>
                                <div
                                    v-else-if="
                                        feedback &&
                                        selectedVerbs.includes(index)
                                    "
                                    class="card-icon wrong-icon"
                                >
                                    <svg
                                        width="11"
                                        height="11"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="3"
                                    >
                                        <line
                                            x1="18"
                                            y1="6"
                                            x2="6"
                                            y2="18"
                                        ></line>
                                        <line
                                            x1="6"
                                            y1="6"
                                            x2="18"
                                            y2="18"
                                        ></line>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Botón siguiente -->
                    <button
                        v-if="feedback"
                        class="next-btn"
                        @click="generateNewQuestion"
                    >
                        <span>Siguiente pregunta</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useConfetti } from "@/composables/useConfetti";
import "@/assets/game-modal.css";

// Modal: Emparejar significados con formas
// - Permite alternar modo (present/past/participle)
// - Mide precisión y da feedback visual
export default {
    name: "GameMatchModal",
    setup() {
        return useConfetti();
    },
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
            feedback: "",
            isCorrect: false,
            score: 0,
            attempts: 0,
            correctIndices: [],
            gameMode: "past",
            questionKey: 0,
            gameModes: [
                { value: "present", label: "Presente" },
                { value: "past", label: "Pasado" },
                { value: "participle", label: "Participio" },
            ],
        };
    },
    computed: {
        currentMeaning() {
            if (!this.currentVerb) return "";
            return this.currentVerb.meanings
                .map((m) => m[this.gameMode])
                .join(" / ");
        },
        accuracy() {
            const total = this.score + this.attempts;
            return total > 0 ? Math.round((this.score / total) * 100) : 100;
        },
    },
    methods: {
        generateNewQuestion() {
            const verbKeys = Object.keys(this.verbs);
            if (verbKeys.length < 4) return;

            this.currentVerbKey =
                verbKeys[Math.floor(Math.random() * verbKeys.length)];
            this.currentVerb = this.verbs[this.currentVerbKey];

            const incorrectVerbs = this.getIncorrectVerbs(verbKeys, 3);

            this.shuffledVerbs = [this.currentVerb, ...incorrectVerbs].sort(
                () => Math.random() - 0.5,
            );

            this.correctIndices = this.shuffledVerbs
                .map((verb, index) =>
                    verb[this.gameMode] === this.currentVerb[this.gameMode]
                        ? index
                        : -1,
                )
                .filter((index) => index !== -1);

            this.resetQuestionState();
            this.questionKey++;
        },

        getIncorrectVerbs(verbKeys, count) {
            const incorrectVerbs = [];
            const usedKeys = new Set([this.currentVerbKey]);

            while (
                incorrectVerbs.length < count &&
                usedKeys.size < verbKeys.length
            ) {
                const randomKey =
                    verbKeys[Math.floor(Math.random() * verbKeys.length)];
                if (!usedKeys.has(randomKey)) {
                    const verb = this.verbs[randomKey];
                    if (
                        verb[this.gameMode] !== this.currentVerb[this.gameMode]
                    ) {
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

            this.feedback = this.isCorrect
                ? "¡Correcto!"
                : "Incorrecto, intenta de nuevo.";

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
                wrong:
                    this.feedback &&
                    this.selectedVerbs.includes(index) &&
                    !this.correctIndices.includes(index),
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
            this.feedback = "";
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
            this.$emit("close");
        },
    },
    watch: {
        show(val) {
            if (val) {
                this.generateNewQuestion();
            } else {
                this.resetQuiz();
            }
        },
    },
};
</script>

<style scoped>
/* Overrides sobre game-modal.css: este modal necesita más ancho y stats que
   pueden envolver en varias líneas (tiene un stat extra: "precisión") */
.quiz-content {
    max-width: 500px;
}

.quiz-stats {
    flex-wrap: wrap;
}

.stat-item {
    color: var(--text-light);
}

/* Contenido principal */
.game-mode-container {
    margin-bottom: 8px;
}

.mode-title {
    font-size: 0.9rem;
    color: var(--text-light);
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
    padding: 8px 14px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: transparent;
    color: var(--text-light);
    cursor: pointer;
    font-weight: 500;
    font-size: 0.85rem;
    -webkit-tap-highlight-color: transparent;
    transition: var(--transition);
}

.mode-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.mode-btn.active {
    background: var(--accent);
    color: white;
    border-color: var(--accent);
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
    border: 1px solid var(--line);
    border-radius: var(--radius);
    cursor: pointer;
    text-align: center;
    background: var(--surface);
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
}

.verb-card:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
}

.verb-card.selected {
    border-color: var(--accent);
    background: var(--accent-soft);
}

.verb-card.correct {
    border-color: var(--accent);
    background: var(--accent-soft);
}

.verb-card.wrong {
    border-color: var(--warn);
    background: var(--warn-soft);
}

.verb-text {
    font-weight: 600;
    font-size: 1rem;
    color: var(--ink);
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
}

.correct-icon {
    background: var(--accent);
    color: white;
}

.wrong-icon {
    background: var(--warn);
    color: white;
}

/* Botón siguiente */
.next-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: var(--transition);
}

.next-btn:hover {
    background: var(--accent-dark);
    transform: translateY(-1px);
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
</style>
