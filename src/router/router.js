import { createRouter, createWebHistory } from 'vue-router'

// Carga perezosa para mejorar el rendimiento del bundle inicial
const HomeView = () => import('@/views/HomeView.vue')
const VerbsView = () => import('@/views/VerbsView.vue')
const WordView = () => import('@/views/WordView.vue')
const NotFoundView = () => import('@/views/NotFoundView.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Verbos Irregulares en Inglés - Aprende y Practica',
      description: 'Tabla de verbos irregulares, pronunciación y juegos para practicar.'
    }
  },
  {
    path: '/verbs',
    name: 'verbs',
    component: VerbsView,
    meta: {
      title: 'Lista de Verbos Irregulares - Tabla y Juegos',
      description: 'Explora la tabla de verbos irregulares y practica con quizzes.'
    }
  },
  {
    path: '/word',
    name: 'word',
    component: WordView,
    meta: {
      title: 'Word Explorer - Pronunciación y Ejemplos',
      description: 'Busca palabras en inglés, escucha su audio y revisa ejemplos.'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: NotFoundView,
    meta: {
      title: 'Página no encontrada',
      description: 'La página solicitada no existe.'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Actualiza el título y la meta descripción por ruta (SEO básico)
const DEFAULT_TITLE = 'Verbos Irregulares en Inglés';
const DEFAULT_DESC = 'Aprende verbos irregulares con tabla, pronunciación y juegos.';
router.afterEach((to) => {
  document.title = to.meta?.title || DEFAULT_TITLE;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', to.meta?.description || DEFAULT_DESC);
});

export default router
