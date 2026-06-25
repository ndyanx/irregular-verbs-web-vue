<template>
    <div class="app">
        <NavBar @open-quiz="showQuiz = $event" />

        <main class="audio-content">
            <div class="header-wrapper">
                <h1 class="title">Word Explorer</h1>
                <p class="subtitle">
                    Escucha la pronunciación en inglés y revisa ejemplos.
                </p>
            </div>

            <div class="audio-card">
                <div class="input-group">
                    <input
                        v-model="inputWord"
                        type="text"
                        placeholder="Escribe una palabra en inglés..."
                        @keyup.enter="fetchWordInfo"
                        class="audio-input"
                    />
                    <button
                        @click="fetchWordInfo"
                        :disabled="!inputWord || isSearching"
                        class="btn primary"
                    >
                        Buscar
                    </button>
                </div>

                <div v-if="wordData" class="word-display">
                    <div class="pronunciation-info">
                        <div
                            class="accent-block"
                            v-for="(data, key) in wordData.pronunciations"
                            :key="key"
                        >
                            <strong>{{ key.toUpperCase() }}</strong>
                            <span class="ipa">/{{ data.ipa }}/</span>
                            <button
                                class="play-btn"
                                @click="playAccentAudio(key)"
                                aria-label="Reproducir pronunciación"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                    <path d="M3 9v6a2 2 0 0 0 2 2h3l5 4V3l-5 4H5a2 2 0 0 0-2 2z"></path>
                                    <path d="M16 12a4.5 4.5 0 0 0-1.5-3.37"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div
                        class="definitions"
                        v-for="entry in wordData.entries"
                        :key="entry.id"
                    >
                        <h3>{{ entry.pos }}</h3>
                        <div v-for="(sense, idx) in entry.senses" :key="idx">
                            <div class="sense">
                                <p v-if="sense.sense_title" class="stitle">
                                    [{{ sense.sense_title }}]
                                </p>
                                <p v-if="sense.phrase" class="sphrase">
                                    {{ sense.phrase }}
                                </p>
                                <p v-if="sense.definition" class="definition">
                                    {{ sense.definition }}
                                </p>
                                <p v-if="sense.translation" class="translation">
                                    {{ sense.translation }}
                                </p>
                                <div
                                    class="examples-toggle"
                                    @click="toggleExamples(entry.id, idx)"
                                >
                                    <span
                                        >Ejemplos ({{
                                            sense.examples.length
                                        }})</span
                                    >
                                    <svg
                                        class="toggle-icon"
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2.5"
                                        :style="{ transform: isExampleExpanded(entry.id, idx) ? 'rotate(180deg)' : 'rotate(0deg)' }"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                <ul
                                    class="examples"
                                    v-if="isExampleExpanded(entry.id, idx)"
                                >
                                    <li
                                        v-for="(ex, exIdx) in sense.examples"
                                        :key="exIdx"
                                    >
                                        <strong>{{ ex.en }}</strong
                                        ><br />
                                        <em v-if="ex.es">{{ ex.es }}</em>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="isSearching" class="audio-status-bar">
                    <div class="audio-wave">
                        <span
                            class="wave-bar"
                            v-for="n in 5"
                            :key="n"
                            :style="waveBarStyle(n)"
                        ></span>
                    </div>
                    <span class="playing-text">Buscando: {{ inputWord }}</span>
                </div>
            </div>
        </main>

        <QuizModals
            :showQuiz="showQuiz"
            :verbs="preparedVerbs"
            @close="showQuiz = null"
        />

        <Footer />
    </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";
import QuizModals from "@/components/modals/QuizModals.vue";
import { useAudioStore } from "@/stores/audio";
import { useWordFetch } from "@/composables/useWordFetch";
import { allVerbs } from "@/data/verbs";
import { ref } from "vue";

export default {
    name: "AudioView",
    components: { NavBar, QuizModals, Footer },
    setup() {
        const audioStore = useAudioStore();
        const { fetchWord } = useWordFetch();

        const showQuiz = ref(null);
        const inputWord = ref("");
        const isSearching = ref(false);
        const waveAnimation = ref(Array(5).fill(0));
        const wordData = ref(null);
        const lastRequestId = ref(0);
        const expandedExamples = ref({});

        const preparedVerbs = allVerbs;

        const isExampleExpanded = (id, idx) => {
            return !!expandedExamples.value[`${id}-${idx}`];
        };

        const toggleExamples = (id, idx) => {
            const key = `${id}-${idx}`;
            expandedExamples.value = {
                ...expandedExamples.value,
                [key]: !expandedExamples.value[key],
            };
        };

        const fetchWordInfo = async () => {
            if (!inputWord.value.trim() || isSearching.value) return;

            wordData.value = null;
            isSearching.value = true;
            startWaveAnimation();

            const currentRequestId = ++lastRequestId.value;

            try {
                const data = await fetchWord(inputWord.value);

                if (currentRequestId === lastRequestId.value) {
                    wordData.value = data;
                    expandedExamples.value = {};
                }
            } catch (err) {
                console.error("Error loading word data:", err);
            } finally {
                if (currentRequestId === lastRequestId.value) {
                    setTimeout(() => {
                        isSearching.value = false;
                        stopWaveAnimation();
                    }, 500);
                }
            }
        };

        const playAccentAudio = (accent) => {
            if (!wordData.value || !wordData.value.word) return;
            audioStore.playWord(wordData.value.word, "en-US", accent);
        };

        let animationInterval = null;

        const startWaveAnimation = () => {
            animationInterval = setInterval(() => {
                waveAnimation.value = waveAnimation.value.map(
                    () => Math.floor(Math.random() * 15) + 5,
                );
            }, 200);
        };

        const stopWaveAnimation = () => {
            clearInterval(animationInterval);
            waveAnimation.value = Array(5).fill(0);
        };

        const waveBarStyle = (index) => {
            return {
                height: `${waveAnimation.value[index - 1]}px`,
            };
        };

        return {
            audioStore,
            showQuiz,
            inputWord,
            isSearching,
            waveAnimation,
            wordData,
            preparedVerbs,
            fetchWordInfo,
            playAccentAudio,
            waveBarStyle,
            stopWaveAnimation,
            isExampleExpanded,
            toggleExamples,
        };
    },
    created() {
        document.body.classList.add("theme-loaded");
    },
    beforeUnmount() {
        this.stopWaveAnimation();
    },
};
</script>

<style scoped>
.audio-content {
    max-width: 640px;
    margin: 0 auto;
    padding: 2.5rem 1.25rem;
    min-height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
}

.header-wrapper {
    margin-bottom: 2.5rem;
    text-align: center;
    padding: 0 0.5rem;
}

.title {
    font-family: var(--font-display);
    font-size: 2.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: var(--ink);
    line-height: 1.2;
}

.subtitle {
    font-size: 1.0625rem;
    color: var(--text-light);
    margin-bottom: 0;
}

.audio-card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    padding: 2rem;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--line);
    margin: 0 0.5rem;
}

.input-group {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
}

.audio-input {
    flex: 1;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-sm);
    border: 1px solid var(--line);
    font-size: 1rem;
    transition: var(--transition);
    background: var(--surface);
    color: var(--text);
    min-height: 50px;
    font-family: var(--font-body);
}

.audio-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--focus-ring);
}

.btn {
    padding: 0 1.5rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    transition: var(--transition);
    cursor: pointer;
    border: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 50px;
    font-family: var(--font-body);
}

.btn.primary {
    background: var(--accent);
    color: white;
    min-width: 110px;
}

.btn.primary:hover:not(:disabled) {
    background: var(--accent-dark);
}

.btn.primary:disabled {
    background: var(--line);
    color: var(--ink-faint);
    cursor: not-allowed;
}

/* Audio Status Bar */
.audio-status-bar {
    margin-top: 1.5rem;
    padding: 1rem;
    border-radius: var(--radius);
    background: var(--accent-soft);
    display: flex;
    align-items: center;
    gap: 1rem;
    animation: fadeIn 0.3s ease;
}

.audio-wave {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    height: 30px;
}

.wave-bar {
    width: 4px;
    background: var(--accent);
    border-radius: 2px;
    transition: height 0.2s ease;
    display: inline-block;
}

.playing-text {
    font-size: 0.9rem;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.word-display {
    margin-top: 1rem;
}

.pronunciation-info {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.accent-block {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--ink);
}

.ipa {
    font-style: italic;
    font-size: 1rem;
    color: var(--text-light);
}

.play-btn {
    background: var(--accent-soft);
    border: none;
    border-radius: 999px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--accent);
    transition: var(--transition);
}

.play-btn:hover {
    background: var(--accent-soft-strong);
}

.definitions {
    margin-bottom: 1.5rem;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
}

.definitions h3 {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--ink);
    text-transform: capitalize;
}

.stitle {
    font-weight: 600;
    margin-bottom: 0.2rem;
    color: var(--accent-dark);
    word-break: break-word;
}

.definition {
    font-weight: 600;
    margin-bottom: 0.2rem;
    color: var(--ink);
    word-break: break-word;
}

.translation {
    color: var(--text-light);
    margin-bottom: 0.5rem;
    word-break: break-word;
    font-style: italic;
}

.sense {
    margin-bottom: 24px;
    padding-top: 12px;
    border-top: 1px solid var(--line);
}

.examples-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: var(--text-light);
    margin: 0.5rem 0;
    padding: 0.25rem;
    border-radius: var(--radius-sm);
    transition: var(--transition);
    font-size: 0.9rem;
}

.examples-toggle:hover {
    background-color: var(--accent-soft);
    color: var(--accent-dark);
}

.toggle-icon {
    transition: transform 0.2s ease;
}

.examples {
    list-style: none;
    padding-left: 0.5rem;
    margin-bottom: 1rem;
}

.examples li {
    margin-bottom: 0.25rem;
    word-break: break-word;
    overflow-wrap: anywhere;
    line-height: 1.5;
    padding: 0.6rem 0.75rem;
    border-radius: var(--radius-sm);
    transition: background-color 0.2s ease;
    cursor: default;
}

.examples li strong,
.examples li em {
    display: inline-block;
    max-width: 100%;
    word-break: break-word;
}

.examples li em {
    color: var(--text-light);
    font-style: italic;
}

.examples li:hover {
    background-color: var(--accent-soft);
}

/* Responsive */
@media (max-width: 640px) {
    .audio-content {
        padding: 1.5rem 1rem;
    }

    .title {
        font-size: 1.875rem;
    }

    .input-group {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        padding: 1rem;
    }

    .audio-card {
        padding: 1.5rem;
        margin: 0;
    }

    .audio-status-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .playing-text {
        white-space: normal;
    }

    .definitions h3 {
        font-size: 1.125rem;
    }

    .stitle,
    .definition,
    .translation,
    .examples li {
        font-size: 0.9375rem;
    }
}
</style>
