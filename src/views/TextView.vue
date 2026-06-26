<template>
    <div class="app">
        <NavBar @open-quiz="showQuiz = $event" />

        <main class="text-explorer">
            <h1 class="title">Texto interactivo</h1>
            <p class="subtitle">
                Pega tu párrafo en inglés, analiza y haz clic en cualquier
                palabra para escucharla y ver detalles.
            </p>

            <section class="controls">
                <textarea
                    v-model="inputText"
                    class="text-input"
                    placeholder="Pega aquí tu párrafo en inglés..."
                    rows="6"
                ></textarea>
                <div class="actions">
                    <div class="accent-select">
                        <span class="label">Acento:</span>
                        <label class="radio">
                            <input type="radio" value="us" v-model="accent" />
                            <span>US</span>
                        </label>
                        <label class="radio">
                            <input type="radio" value="uk" v-model="accent" />
                            <span>UK</span>
                        </label>
                    </div>
                    <button
                        class="btn primary"
                        @click="analyzeText"
                        :disabled="!inputText.trim() || isAnalyzing"
                    >
                        {{
                            isAnalyzing
                                ? `Analizando ${prefetchProgress.done}/${prefetchProgress.total}…`
                                : "Analizar texto"
                        }}
                    </button>
                </div>
            </section>

            <section v-if="tokens.length" class="results">
                <div class="paragraph" aria-label="Texto interactivo">
                    <template v-for="(token, idx) in tokens" :key="idx">
                        <span
                            v-if="token.type === 'word'"
                            class="word"
                            :class="{
                                active:
                                    selectedWord?.original === token.original,
                            }"
                            @click="handleWordClick(token)"
                            :title="getWordTitle(token)"
                            role="button"
                            tabindex="0"
                            @keyup.enter="handleWordClick(token)"
                            >{{ token.original }}</span
                        ><span v-else class="sep">{{ token.original }}</span>
                    </template>
                </div>

                <!--
                    En mobile, .details se comporta como un bottom sheet:
                    - .details-backdrop oscurece el fondo y permite cerrar tocando fuera
                    - El botón "close-btn" y el "drag-handle" permiten cerrar explícitamente
                    En desktop, .details-backdrop no se renderiza y .details queda
                    sticky en la columna derecha (ver <style scoped>).
                -->
                <div
                    class="details-backdrop"
                    v-if="selectedWord"
                    @click="closeDetails"
                ></div>

                <aside
                    class="details"
                    v-if="selectedWord"
                    @touchstart="onSheetTouchStart"
                    @touchmove="onSheetTouchMove"
                    @touchend="onSheetTouchEnd"
                    :style="sheetDragStyle"
                >
                    <div class="drag-handle" aria-hidden="true"></div>
                    <div class="details-header">
                        <h2 class="details-title">
                            {{ selectedWord.normalized }}
                        </h2>
                        <div
                            class="pronunciations"
                            v-if="selectedData?.pronunciations"
                        >
                            <div
                                v-for="(p, key) in selectedData.pronunciations"
                                :key="key"
                                class="accent"
                            >
                                <strong>{{ key.toUpperCase() }}</strong>
                                <span class="ipa" v-if="p.ipa"
                                    >/{{ p.ipa }}/</span
                                >
                                <!-- Reproducción disponible al hacer clic en la palabra del párrafo -->
                            </div>
                        </div>
                        <button
                            class="close-details-btn"
                            type="button"
                            aria-label="Cerrar detalles"
                            @click="closeDetails"
                        >
                            ✕
                        </button>
                    </div>

                    <div class="definitions" v-if="selectedData?.entries">
                        <div
                            class="entry"
                            v-for="entry in selectedData.entries"
                            :key="entry.id"
                        >
                            <h3>{{ entry.pos }}</h3>
                            <div
                                v-for="(sense, idx) in entry.senses"
                                :key="idx"
                                class="sense"
                            >
                                <p v-if="sense.sense_title" class="stitle">
                                    [{{ sense.sense_title }}]
                                </p>
                                <p v-if="sense.phrase" class="sphrase">
                                    » {{ sense.phrase }}
                                </p>
                                <p v-if="sense.definition" class="definition">
                                    » {{ sense.definition }}
                                </p>
                                <p v-if="sense.translation" class="translation">
                                    ╚ {{ sense.translation }}
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </section>
        </main>

        <Footer />
    </div>
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer.vue";
import { ref, computed, watch, onUnmounted } from "vue";
import { useAudioStore } from "@/stores/audio";
import { useWordFetch } from "@/composables/useWordFetch";

// Vista: Texto interactivo
// - Tokeniza el párrafo preservando espacios y puntuación
// - Hace prefetch de palabras únicas y cachea resultados
// - Reproduce pronunciación y muestra detalles al seleccionar una palabra
export default {
    name: "TextView",
    components: { NavBar, Footer },
    setup() {
        const audioStore = useAudioStore();
        const { fetchWord } = useWordFetch();

        const inputText = ref("");
        const tokens = ref([]);
        const isAnalyzing = ref(false);
        const accent = ref(audioStore.currentAccent || "us");
        const prefetchProgress = ref({ done: 0, total: 0 });

        // Mapa palabra(normalizada) -> datos de API
        const wordDataMap = ref({});
        const selectedWord = ref(null);
        const analyzeRunId = ref(0);

        const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

        const selectedData = computed(() => {
            if (!selectedWord.value) return null;
            return wordDataMap.value[selectedWord.value.normalized] || null;
        });

        watch(accent, (val) => {
            audioStore.currentAccent = val;
        });

        // Cuando .details actúa como bottom sheet (mobile, <=900px),
        // bloqueamos el scroll del body para que el gesto de swipe-down
        // del usuario no termine también scrolleando el párrafo detrás.
        // En desktop (.details es sticky, no fixed) esto no tiene efecto
        // visible, pero lo restringimos al breakpoint para no interferir.
        const MOBILE_BREAKPOINT = "(max-width: 900px)";
        watch(selectedWord, (val) => {
            const isMobile = window.matchMedia(MOBILE_BREAKPOINT).matches;
            if (val && isMobile) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        });

        function tokenize(text) {
            const result = [];
            // Divide en grupos de letras/apóstrofos y lo demás como separadores
            const regex = /([A-Za-z\']+)|([^A-Za-z\']+)/g;
            let match;
            while ((match = regex.exec(text)) !== null) {
                if (match[1]) {
                    const original = match[1];
                    result.push({
                        type: "word",
                        original,
                        normalized: original.toLowerCase(),
                    });
                } else if (match[2]) {
                    result.push({ type: "sep", original: match[2] });
                }
            }
            return result;
        }

        async function analyzeText() {
            if (!inputText.value.trim()) return;
            isAnalyzing.value = true;
            wordDataMap.value = {};
            selectedWord.value = null;
            tokens.value = tokenize(inputText.value);

            const unique = Array.from(
                new Set(
                    tokens.value
                        .filter((t) => t.type === "word")
                        .map((t) => t.normalized),
                ),
            );

            const currentRun = ++analyzeRunId.value;
            prefetchProgress.value = { done: 0, total: unique.length };

            // Enviar todas las palabras al backend para que las encole en background.
            // POST /api/words responde 202 inmediatamente — el scraping ocurre en el servidor
            // sin bloquear al usuario. Cuando haga clic en una palabra, GET /api/word/:word
            // ya la encontrará en caché y responderá al instante.
            try {
                await fetch(`${VITE_API_BASE_URL}/api/words`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ words: unique }),
                });
            } catch {
                // Si falla el encolado, continuamos igual —
                // el clic individual hará el fetch bajo demanda
            }

            // El texto ya está listo para interactuar; quitamos el spinner
            if (analyzeRunId.value === currentRun) {
                isAnalyzing.value = false;
                prefetchProgress.value = {
                    done: unique.length,
                    total: unique.length,
                };
                const firstWord = tokens.value.find((t) => t.type === "word");
                selectedWord.value = firstWord || null;
            }
        }

        // Cierra el panel de detalles (solo relevante en mobile, donde
        // .details se comporta como bottom sheet). En desktop el panel
        // es sticky y permanece a la vista, pero deseleccionar también
        // es un estado válido (no rompe nada que selectedWord sea null).
        function closeDetails() {
            selectedWord.value = null;
        }

        // --- Swipe-down para cerrar el bottom sheet (solo tiene efecto
        // visual en mobile, gracias al CSS; en desktop .details no es
        // "fixed" así que el transform no produce ningún movimiento
        // perceptible, pero dejamos los handlers activos sin penalidad). ---
        const dragOffset = ref(0);
        const isDragging = ref(false);
        let touchStartY = 0;
        const SWIPE_CLOSE_THRESHOLD = 90; // px

        const sheetDragStyle = computed(() => {
            if (!isDragging.value || dragOffset.value <= 0) return {};
            return {
                transform: `translateY(${dragOffset.value}px)`,
                transition: "none",
            };
        });

        function onSheetTouchStart(e) {
            // Solo iniciamos el gesto si el toque empieza cerca del borde
            // superior del panel (handle/encabezado), para no interferir
            // con el scroll normal del contenido de detalles.
            const sheetEl = e.currentTarget;
            const touchY = e.touches[0].clientY;
            const sheetTop = sheetEl.getBoundingClientRect().top;
            if (touchY - sheetTop > 80) return;

            touchStartY = touchY;
            isDragging.value = true;
        }

        function onSheetTouchMove(e) {
            if (!isDragging.value) return;
            const delta = e.touches[0].clientY - touchStartY;
            dragOffset.value = Math.max(0, delta);
        }

        function onSheetTouchEnd() {
            if (!isDragging.value) return;
            isDragging.value = false;
            if (dragOffset.value > SWIPE_CLOSE_THRESHOLD) {
                closeDetails();
            }
            dragOffset.value = 0;
        }

        onUnmounted(() => {
            document.body.style.overflow = "";
        });

        function getWordTitle(token) {
            const hasData = !!wordDataMap.value[token.normalized];
            return hasData
                ? "Clic para escuchar y ver detalles"
                : "Clic para pronunciar (sintetizado)";
        }

        async function handleWordClick(token) {
            selectedWord.value = token;

            // Si aún no tenemos datos de esta palabra, fetchearla bajo demanda.
            // El backend ya debería tenerla en caché tras el POST /api/words inicial.
            if (wordDataMap.value[token.normalized] === undefined) {
                wordDataMap.value[token.normalized] = await fetchWord(
                    token.normalized,
                );
            }

            await audioStore.playWord(token.original, "en-US", accent.value);
        }

        return {
            audioStore,
            inputText,
            tokens,
            isAnalyzing,
            prefetchProgress,
            analyzeText,
            selectedWord,
            selectedData,
            getWordTitle,
            handleWordClick,
            closeDetails,
            sheetDragStyle,
            onSheetTouchStart,
            onSheetTouchMove,
            onSheetTouchEnd,
            accent,
        };
    },
    created() {
        document.body.classList.add("theme-loaded");
    },
};
</script>

<style scoped>
.text-explorer {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.title {
    font-family: var(--font-display);
    font-size: 1.875rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-align: center;
    color: var(--ink);
}

.subtitle {
    color: var(--text-light);
    margin-bottom: 1.25rem;
    text-align: center;
}

.controls {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    max-width: 800px;
    margin: 0 auto;
}

.text-input {
    width: 100%;
    background: var(--card);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.75rem;
    resize: vertical;
}

.actions {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.accent-select {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.accent-select .label {
    color: var(--text-light);
}

.radio {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}

.btn.primary {
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    padding: 0.6rem 1.25rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
}

.btn.primary:hover:not(:disabled) {
    background: var(--accent-dark);
}

.btn.primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.results {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
}

.paragraph {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    line-height: 1.9;
    font-size: 1.05rem;
}

.word {
    color: var(--text);
    cursor: pointer;
    padding: 0 2px;
    border-radius: 6px;
    transition:
        background-color 0.2s ease,
        color 0.2s ease;
}

.word:hover {
    background: var(--accent-soft);
    color: var(--accent-dark);
}

.word.active {
    background: var(--accent-soft-strong);
    color: var(--accent-dark);
}

.sep {
    white-space: pre-wrap;
}

.details {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    max-height: 70vh;
    overflow: auto;
    /*
     * Desktop: el panel se "pega" debajo del NavBar (que es sticky,
     * top:0, height: var(--header-height)) y se queda a la vista
     * mientras se hace scroll por el párrafo largo. align-self: start
     * es necesario porque el grid, por defecto, estira los items a
     * la altura de la fila (stretch), lo que invalidaría el sticky.
     */
    position: sticky;
    top: calc(var(--header-height) + 1rem);
    align-self: start;
}

.drag-handle {
    display: none;
}

.close-details-btn {
    display: none;
}

.details-backdrop {
    display: none;
}

.details-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}
.details-title {
    margin: 0;
    font-size: 1.25rem;
    flex: 1;
}

.pronunciations {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}
.accent {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}
.ipa {
    font-style: italic;
    opacity: 0.8;
}
.play-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.2rem 0.4rem;
    cursor: pointer;
}

.definitions {
    margin-top: 0.75rem;
}
.entry {
    margin-bottom: 1rem;
}
.sense {
    margin-bottom: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--line);
}
.stitle {
    font-weight: 600;
    color: var(--accent-dark);
}
.definition {
    font-weight: 600;
    color: var(--ink);
}
.translation {
    color: var(--text-light);
    font-style: italic;
}

@media (max-width: 900px) {
    .results {
        grid-template-columns: 1fr;
        justify-items: center;
    }
    .controls,
    .paragraph {
        width: 100%;
        max-width: 680px;
        margin-left: auto;
        margin-right: auto;
    }

    /*
     * Mobile: .details deja de ser parte del flujo del grid y se
     * convierte en un bottom sheet — un panel que sube desde abajo
     * sin tapar toda la pantalla, para no perder el contexto del
     * párrafo que se está leyendo. Se cierra con el botón ✕, tocando
     * el fondo oscurecido (.details-backdrop), o deslizando hacia
     * abajo (swipe, implementado en el script).
     */
    .details-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(28, 29, 31, 0.5);
        z-index: 1100;
        animation: backdrop-in 0.2s ease;
    }

    .details {
        display: block;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        top: auto;
        width: 100%;
        max-width: none;
        max-height: 75vh;
        margin: 0;
        border-radius: 20px 20px 0 0;
        box-shadow: var(--shadow-lg);
        z-index: 1101;
        padding: 0.5rem 1.25rem 1.5rem;
        box-sizing: border-box;
        animation: sheet-in 0.25s ease;
        /* Permite que el navegador gestione el swipe-down para cerrar
           sin interferir con el scroll vertical del contenido */
        touch-action: pan-y;
    }

    .drag-handle {
        display: block;
        width: 40px;
        height: 4px;
        border-radius: 999px;
        background: var(--border);
        margin: 0.5rem auto 0.75rem;
    }

    .details-header {
        align-items: flex-start;
    }

    .close-details-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        border: none;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent-dark);
        font-size: 0.95rem;
        line-height: 1;
        cursor: pointer;
        transition: var(--transition);
    }

    .close-details-btn:hover,
    .close-details-btn:active {
        background: var(--accent-soft-strong);
    }
}

@keyframes sheet-in {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

@keyframes backdrop-in {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@media (prefers-reduced-motion: reduce) {
    .details,
    .details-backdrop {
        animation: none;
    }
}
</style>
