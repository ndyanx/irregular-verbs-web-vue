<template>
    <div class="app">
        <NavBar @open-quiz="showQuiz = $event" />

        <main class="home-content">
            <section class="hero">
                <span class="eyebrow">Inglés · Verbos irregulares</span>
                <h1>
                    Domina los verbos irregulares
                    <span class="accent-word">con claridad</span>
                </h1>
                <p class="subtitle">
                    Tabla completa, pronunciación nativa y tres modos de
                    práctica pensados para que avances a tu ritmo.
                </p>
                <div class="cta-buttons">
                    <router-link to="/verbs" class="btn primary">
                        Comenzar ahora
                    </router-link>
                    <button @click="showQuiz = 'classic'" class="btn outline">
                        Quiz rápido
                    </button>
                    <router-link to="/word" class="btn outline">
                        Buscar palabra
                    </router-link>
                    <router-link to="/text" class="btn outline">
                        Texto interactivo
                    </router-link>
                </div>
            </section>

            <section class="features">
                <div
                    v-for="(feature, index) in features"
                    :key="index"
                    class="feature-card"
                >
                    <div class="icon" v-html="feature.icon"></div>
                    <h2>{{ feature.title }}</h2>
                    <p>{{ feature.description }}</p>
                </div>
            </section>
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
import { allVerbs } from "@/data/verbs";

const ICONS = {
    audio: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9v6a2 2 0 0 0 2 2h3l5 4V3l-5 4H5a2 2 0 0 0-2 2z"></path><path d="M16 12a4.5 4.5 0 0 0-1.5-3.37l.71-.71a5.5 5.5 0 0 1 0 8.16l-.71-.71A4.5 4.5 0 0 0 16 12z"></path></svg>',
    games: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="M7 9v6M4 12h6M15 10h.01M18 13h.01"></path></svg>',
    progress:
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"></path><path d="M7 16l4-6 4 3 5-8"></path></svg>',
};

export default {
    name: "HomeView",
    components: { NavBar, QuizModals, Footer },
    data() {
        return {
            showQuiz: null,
            features: [
                {
                    title: "Pronunciación",
                    description:
                        "Audios nativos con respaldo de síntesis de voz.",
                    icon: ICONS.audio,
                },
                {
                    title: "Tres modos de juego",
                    description:
                        "Aprende practicando: quiz, emparejar y carrera.",
                    icon: ICONS.games,
                },
                {
                    title: "Seguimiento",
                    description: "Monitorea tu progreso mientras avanzas.",
                    icon: ICONS.progress,
                },
            ],
        };
    },
    computed: {
        preparedVerbs() {
            return allVerbs;
        },
    },
    created() {
        document.body.classList.add("theme-loaded");
    },
};
</script>

<style scoped>
.home-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}

.hero {
    text-align: center;
    padding: 4.5rem 0 3.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.eyebrow {
    font-size: 0.8125rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 1rem;
}

.hero h1 {
    font-size: 3rem;
    font-weight: 700;
    line-height: 1.15;
    margin-bottom: 1.25rem;
    color: var(--ink);
    max-width: 720px;
}

.accent-word {
    color: var(--accent);
}

.subtitle {
    font-size: 1.125rem;
    color: var(--text-light);
    margin-bottom: 2.25rem;
    max-width: 520px;
}

.cta-buttons {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 0.9375rem;
    transition: var(--transition);
    cursor: pointer;
}

.btn.primary {
    background: var(--accent);
    color: white;
    border: none;
    text-decoration: none;
}

.btn.primary:hover {
    background: var(--accent-dark);
}

.btn.outline {
    border: 1px solid var(--line);
    background: var(--surface);
    color: var(--ink);
    text-decoration: none;
}

.btn.outline:hover {
    border-color: var(--accent);
    color: var(--accent);
}

.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
}

.feature-card {
    background: var(--surface);
    border-radius: var(--radius-lg);
    padding: 2rem;
    border: 1px solid var(--line);
    transition: var(--transition);
}

.feature-card:hover {
    border-color: var(--line-strong);
    box-shadow: var(--shadow);
}

.icon {
    width: 48px;
    height: 48px;
    margin-bottom: 1.25rem;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-soft);
    color: var(--accent);
}

.feature-card h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--ink);
}

.feature-card p {
    color: var(--text-light);
    line-height: 1.6;
    font-size: 0.9375rem;
}

@media (max-width: 768px) {
    .hero {
        padding: 3rem 0 2.5rem;
    }

    .hero h1 {
        font-size: 2.25rem;
    }

    .cta-buttons {
        flex-direction: column;
        align-items: stretch;
    }

    .btn {
        text-align: center;
    }
}
</style>
