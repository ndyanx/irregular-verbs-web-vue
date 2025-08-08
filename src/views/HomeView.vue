<template>
  <div :class="['app', { 'dark-mode': settingsStore.darkMode }]">
    <NavBar @open-quiz="showQuiz = $event" />
    
    <main class="home-content">
      <section class="hero">
        <h1>Aprende <span class="gradient-text">Verbos Irregulares</span></h1>
        <p class="subtitle">La forma más eficiente de dominar el inglés</p>
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
        </div>
      </section>

      <section class="features">
        <div v-for="(feature, index) in features" :key="index" class="feature-card">
          <div class="icon" :style="iconGradient(index)"></div>
          <h3>{{ feature.title }}</h3>
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
import NavBar from '@/components/NavBar.vue';
import Footer from '@/components/Footer.vue';
import QuizModals from '@/components/modals/QuizModals.vue';
import { useSettingsStore } from '@/stores/settings';
import { useVerbsStore } from '@/stores/verbs';

export default {
  name: 'HomeView',
  components: { NavBar, QuizModals, Footer },
  setup() {
    const settingsStore = useSettingsStore();
    const verbsStore = useVerbsStore();
    return { settingsStore, verbsStore };
  },
  data() {
    return {
      // verbType: 'all',
      showQuiz: null,
      features: [
        {
          title: "Pronunciación",
          description: "Audios nativos + síntesis de voz"
        },
        {
          title: "3 Modos de Juego",
          description: "Aprende practicando"
        },
        {
          title: "Seguimiento",
          description: "Monitoriza tu progreso"
        }
      ],
      gradients: {
        light: [
          'linear-gradient(135deg, #41d1ff 0%, #7367ff 100%)',
          'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
          'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)'
        ],
        dark: [
          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        ]
      }
    };
  },
  computed: {
    preparedVerbs () {
      return this.verbsStore.allVerbs;
    }
  },
  methods: {
    iconGradient(index) {
      return {
        background: this.settingsStore.darkMode 
          ? this.gradients.dark[index]
          : this.gradients.light[index]
      };
    }
  },
  created() {
    document.body.classList.add('theme-loaded');
  }
};
</script>

<style scoped>
.home-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Hero: Minimalista con acento de gradiente */
.hero {
  text-align: center;
  padding: 4rem 0;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text);
}

.gradient-text {
  display: inline-block;
  background-image: linear-gradient(
    270deg,
    #f72585,
    #7209b7,
    #3a0ca3,
    #4361ee,
    #4cc9f0,
    #4895ef,
    #f72585
  );
  background-size: 400% 400%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: gradientText 6s ease infinite;
}

@keyframes gradientText {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-light);
  margin-bottom: 2rem;
}

/* Botones: Estilo Vercel pero con hover gradiente */
.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn.primary {
  background: linear-gradient(90deg, #41d1ff 0%, #7367ff 100%);
  color: white;
  border: none;
  text-decoration: none;
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(65, 209, 255, 0.3);
}

.btn.outline {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  text-decoration: none;
  font-size: 0.9rem;
}

.btn.outline:hover {
  border-color: var(--primary);
  color: var(--primary);
}

/* Features: Tarjetas limpias con iconos gradientes */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--card);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  border: 1px solid var(--border);
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--text);
}

.feature-card p {
  color: var(--text-light);
  line-height: 1.6;
}

/* Modo oscuro: Ajustes sutiles */
.dark-mode .hero h1 {
  color: white;
}

.dark-mode .btn.outline {
  border-color: var(--border-dark);
  color: white;
}

.dark-mode .btn.outline:hover {
  border-color: var(--primary);
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 0;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .features {
    grid-template-columns: 1fr;
  }
}
</style>